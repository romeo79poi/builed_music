package com.catch.api.service;

import com.catch.api.dto.TrackDTO;
import com.catch.api.dto.TrackSearchRequest;
import com.catch.api.entity.Track;
import com.catch.api.exception.ResourceNotFoundException;
import com.catch.api.repository.TrackRepository;
import com.catch.api.mapper.TrackMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TrackService {
    
    private final TrackRepository trackRepository;
    private final TrackMapper trackMapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final RedisService redisService;
    private final RecommendationService recommendationService;
    
    private static final String TRACK_PLAY_TOPIC = "track-plays";
    private static final String TRACK_LIKE_TOPIC = "track-likes";
    
    @Cacheable(value = "tracks", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<TrackDTO> getAllTracks(Pageable pageable) {
        Page<Track> tracks = trackRepository.findAll(pageable);
        return tracks.map(trackMapper::toDTO);
    }
    
    @Cacheable(value = "track", key = "#trackId")
    public TrackDTO getTrackById(String trackId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with ID: " + trackId));
        
        return trackMapper.toDTO(track);
    }
    
    @Transactional
    public void recordPlay(String trackId, String userId) {
        // Increment play count in database
        trackRepository.incrementPlayCount(trackId);
        
        // Send play event to Kafka for real-time analytics
        PlayEvent playEvent = new PlayEvent(trackId, userId, LocalDateTime.now());
        kafkaTemplate.send(TRACK_PLAY_TOPIC, playEvent);
        
        // Update cached play count
        redisService.incrementPlayCount(trackId);
        
        log.info("Play recorded for track: {} by user: {}", trackId, userId);
    }
    
    @Transactional
    public boolean toggleLike(String trackId, String userId) {
        // Check if user already liked this track
        String likeKey = "user:" + userId + ":liked:" + trackId;
        boolean isAlreadyLiked = redisService.exists(likeKey);
        
        if (isAlreadyLiked) {
            // Unlike the track
            trackRepository.decrementLikeCount(trackId);
            redisService.delete(likeKey);
            redisService.decrementLikeCount(trackId);
            
            // Send unlike event
            LikeEvent likeEvent = new LikeEvent(trackId, userId, false, LocalDateTime.now());
            kafkaTemplate.send(TRACK_LIKE_TOPIC, likeEvent);
            
            return false;
        } else {
            // Like the track
            trackRepository.incrementLikeCount(trackId);
            redisService.set(likeKey, "true", 86400); // Cache for 24 hours
            redisService.incrementLikeCount(trackId);
            
            // Send like event
            LikeEvent likeEvent = new LikeEvent(trackId, userId, true, LocalDateTime.now());
            kafkaTemplate.send(TRACK_LIKE_TOPIC, likeEvent);
            
            return true;
        }
    }
    
    @Cacheable(value = "track-search", key = "#request.hashCode()")
    public Page<TrackDTO> searchTracks(TrackSearchRequest request) {
        Pageable pageable = PageRequest.of(
            request.getPage(), 
            request.getSize(),
            request.getSortDirection(),
            request.getSortBy()
        );
        
        Page<Track> tracks;
        
        if (request.getQuery() != null && !request.getQuery().trim().isEmpty()) {
            tracks = trackRepository.globalSearch(request.getQuery().trim(), pageable);
        } else {
            tracks = trackRepository.findAll(pageable);
        }
        
        return tracks.map(trackMapper::toDTO);
    }
    
    @Cacheable(value = "trending-tracks", key = "#limit")
    public List<TrackDTO> getTrendingTracks(int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(7); // Last 7 days
        Pageable pageable = PageRequest.of(0, limit);
        
        List<Track> trendingTracks = trackRepository.findTrendingTracks(since, pageable);
        return trendingTracks.stream()
                .map(trackMapper::toDTO)
                .toList();
    }
    
    @Cacheable(value = "top-tracks", key = "#limit + '-' + #genre + '-' + #timeRange")
    public List<TrackDTO> getTopTracks(int limit, String genre, String timeRange) {
        Pageable pageable = PageRequest.of(0, limit);
        
        List<Track> topTracks;
        if (genre != null && !genre.trim().isEmpty()) {
            topTracks = trackRepository.findByGenreAndIsActiveTrueOrderByPlayCountDesc(genre);
            topTracks = topTracks.stream().limit(limit).toList();
        } else {
            Page<Track> trackPage = trackRepository.findTopTracksByPlayCount(pageable);
            topTracks = trackPage.getContent();
        }
        
        return topTracks.stream()
                .map(trackMapper::toDTO)
                .toList();
    }
    
    public List<TrackDTO> getRecommendationsForUser(String userId, int limit) {
        // Call Python ML service for recommendations
        return recommendationService.getRecommendationsForUser(userId, limit);
    }
    
    @Cacheable(value = "artist-tracks", key = "#artistId + '-' + #pageable.pageNumber")
    public List<TrackDTO> getTracksByArtist(String artistId, Pageable pageable) {
        List<Track> tracks = trackRepository.findByArtistIdAndIsActiveTrue(artistId);
        return tracks.stream()
                .map(trackMapper::toDTO)
                .toList();
    }
    
    @Cacheable(value = "album-tracks", key = "#albumId")
    public List<TrackDTO> getTracksByAlbum(String albumId) {
        List<Track> tracks = trackRepository.findByAlbumIdAndIsActiveTrue(albumId);
        return tracks.stream()
                .map(trackMapper::toDTO)
                .toList();
    }
    
    @Cacheable(value = "genre-tracks", key = "#genre + '-' + #pageable.pageNumber")
    public List<TrackDTO> getTracksByGenre(String genre, Pageable pageable) {
        List<Track> tracks = trackRepository.findByGenreAndIsActiveTrueOrderByPlayCountDesc(genre);
        return tracks.stream()
                .skip(pageable.getOffset())
                .limit(pageable.getPageSize())
                .map(trackMapper::toDTO)
                .toList();
    }
    
    @CacheEvict(value = {"tracks", "track-search", "trending-tracks", "top-tracks"}, allEntries = true)
    public TrackDTO createTrack(TrackDTO trackDTO, String userId) {
        Track track = trackMapper.toEntity(trackDTO);
        track.setArtistId(userId); // Set the creating user as artist
        track.setCreatedAt(LocalDateTime.now());
        
        Track savedTrack = trackRepository.save(track);
        
        // Send track creation event
        TrackCreatedEvent event = new TrackCreatedEvent(savedTrack.getId(), userId, LocalDateTime.now());
        kafkaTemplate.send("track-created", event);
        
        log.info("Track created: {} by user: {}", savedTrack.getId(), userId);
        
        return trackMapper.toDTO(savedTrack);
    }
    
    @CacheEvict(value = {"track", "tracks", "artist-tracks", "album-tracks"}, key = "#trackId")
    public TrackDTO updateTrack(String trackId, TrackDTO trackDTO, String userId) {
        Track existingTrack = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with ID: " + trackId));
        
        // Update track fields
        existingTrack.setTitle(trackDTO.getTitle());
        existingTrack.setAlbumName(trackDTO.getAlbumName());
        existingTrack.setGenre(trackDTO.getGenre());
        existingTrack.setUpdatedAt(LocalDateTime.now());
        
        Track updatedTrack = trackRepository.save(existingTrack);
        
        log.info("Track updated: {} by user: {}", trackId, userId);
        
        return trackMapper.toDTO(updatedTrack);
    }
    
    @CacheEvict(value = {"track", "tracks", "artist-tracks", "album-tracks"}, key = "#trackId")
    public void deleteTrack(String trackId, String userId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with ID: " + trackId));
        
        // Soft delete - mark as inactive
        track.setIsActive(false);
        track.setUpdatedAt(LocalDateTime.now());
        
        trackRepository.save(track);
        
        log.info("Track deleted: {} by user: {}", trackId, userId);
    }
    
    // Event classes for Kafka
    public static class PlayEvent {
        public String trackId;
        public String userId;
        public LocalDateTime timestamp;
        
        public PlayEvent(String trackId, String userId, LocalDateTime timestamp) {
            this.trackId = trackId;
            this.userId = userId;
            this.timestamp = timestamp;
        }
    }
    
    public static class LikeEvent {
        public String trackId;
        public String userId;
        public boolean isLike;
        public LocalDateTime timestamp;
        
        public LikeEvent(String trackId, String userId, boolean isLike, LocalDateTime timestamp) {
            this.trackId = trackId;
            this.userId = userId;
            this.isLike = isLike;
            this.timestamp = timestamp;
        }
    }
    
    public static class TrackCreatedEvent {
        public String trackId;
        public String artistId;
        public LocalDateTime timestamp;
        
        public TrackCreatedEvent(String trackId, String artistId, LocalDateTime timestamp) {
            this.trackId = trackId;
            this.artistId = artistId;
            this.timestamp = timestamp;
        }
    }
}
