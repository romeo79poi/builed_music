package com.catch.api.controller;

import com.catch.api.dto.TrackDTO;
import com.catch.api.dto.TrackSearchRequest;
import com.catch.api.dto.ApiResponse;
import com.catch.api.entity.Track;
import com.catch.api.service.TrackService;
import com.catch.api.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tracks")
@RequiredArgsConstructor
@Validated
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class TrackController {
    
    private final TrackService trackService;
    private final AnalyticsService analyticsService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TrackDTO>>> getAllTracks(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<TrackDTO> tracks = trackService.getAllTracks(pageable);
        
        return ResponseEntity.ok(ApiResponse.success(tracks));
    }
    
    @GetMapping("/{trackId}")
    public ResponseEntity<ApiResponse<TrackDTO>> getTrackById(@PathVariable String trackId) {
        log.info("Fetching track with ID: {}", trackId);
        
        TrackDTO track = trackService.getTrackById(trackId);
        
        return ResponseEntity.ok(ApiResponse.success(track));
    }
    
    @PostMapping("/{trackId}/play")
    public ResponseEntity<ApiResponse<String>> playTrack(
            @PathVariable String trackId,
            @RequestHeader(value = "User-ID", required = false) String userId,
            @RequestParam(defaultValue = "false") boolean skipAnalytics) {
        
        log.info("Play request for track: {} by user: {}", trackId, userId);
        
        // Record play event
        trackService.recordPlay(trackId, userId);
        
        // Send analytics event (async)
        if (!skipAnalytics && userId != null) {
            analyticsService.recordPlayEvent(trackId, userId);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Play recorded successfully"));
    }
    
    @PostMapping("/{trackId}/like")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<String>> likeTrack(
            @PathVariable String trackId,
            @RequestHeader("User-ID") String userId) {
        
        log.info("Like request for track: {} by user: {}", trackId, userId);
        
        boolean isLiked = trackService.toggleLike(trackId, userId);
        String message = isLiked ? "Track liked successfully" : "Track unliked successfully";
        
        return ResponseEntity.ok(ApiResponse.success(message));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<TrackDTO>>> searchTracks(
            @Valid @ModelAttribute TrackSearchRequest request) {
        
        log.info("Search request: {}", request);
        
        Page<TrackDTO> tracks = trackService.searchTracks(request);
        
        return ResponseEntity.ok(ApiResponse.success(tracks));
    }
    
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<TrackDTO>>> getTrendingTracks(
            @RequestParam(defaultValue = "50") @Min(1) @Max(100) int limit) {
        
        log.info("Fetching trending tracks, limit: {}", limit);
        
        List<TrackDTO> trendingTracks = trackService.getTrendingTracks(limit);
        
        return ResponseEntity.ok(ApiResponse.success(trendingTracks));
    }
    
    @GetMapping("/top")
    public ResponseEntity<ApiResponse<List<TrackDTO>>> getTopTracks(
            @RequestParam(defaultValue = "50") @Min(1) @Max(100) int limit,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String timeRange) {
        
        log.info("Fetching top tracks, limit: {}, genre: {}, timeRange: {}", limit, genre, timeRange);
        
        List<TrackDTO> topTracks = trackService.getTopTracks(limit, genre, timeRange);
        
        return ResponseEntity.ok(ApiResponse.success(topTracks));
    }
    
    @GetMapping("/recommendations")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<TrackDTO>>> getRecommendations(
            @RequestHeader("User-ID") String userId,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int limit) {
        
        log.info("Fetching recommendations for user: {}, limit: {}", userId, limit);
        
        List<TrackDTO> recommendations = trackService.getRecommendationsForUser(userId, limit);
        
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }
    
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<ApiResponse<List<TrackDTO>>> getTracksByArtist(
            @PathVariable String artistId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        
        log.info("Fetching tracks for artist: {}", artistId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "playCount"));
        List<TrackDTO> tracks = trackService.getTracksByArtist(artistId, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(tracks));
    }
    
    @GetMapping("/album/{albumId}")
    public ResponseEntity<ApiResponse<List<TrackDTO>>> getTracksByAlbum(@PathVariable String albumId) {
        
        log.info("Fetching tracks for album: {}", albumId);
        
        List<TrackDTO> tracks = trackService.getTracksByAlbum(albumId);
        
        return ResponseEntity.ok(ApiResponse.success(tracks));
    }
    
    @GetMapping("/genre/{genre}")
    public ResponseEntity<ApiResponse<List<TrackDTO>>> getTracksByGenre(
            @PathVariable String genre,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        
        log.info("Fetching tracks for genre: {}", genre);
        
        Pageable pageable = PageRequest.of(page, size);
        List<TrackDTO> tracks = trackService.getTracksByGenre(genre, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(tracks));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TrackDTO>> createTrack(
            @Valid @RequestBody TrackDTO trackDTO,
            @RequestHeader("User-ID") String userId) {
        
        log.info("Creating new track: {} by user: {}", trackDTO.getTitle(), userId);
        
        TrackDTO createdTrack = trackService.createTrack(trackDTO, userId);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdTrack));
    }
    
    @PutMapping("/{trackId}")
    @PreAuthorize("hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TrackDTO>> updateTrack(
            @PathVariable String trackId,
            @Valid @RequestBody TrackDTO trackDTO,
            @RequestHeader("User-ID") String userId) {
        
        log.info("Updating track: {} by user: {}", trackId, userId);
        
        TrackDTO updatedTrack = trackService.updateTrack(trackId, trackDTO, userId);
        
        return ResponseEntity.ok(ApiResponse.success(updatedTrack));
    }
    
    @DeleteMapping("/{trackId}")
    @PreAuthorize("hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteTrack(
            @PathVariable String trackId,
            @RequestHeader("User-ID") String userId) {
        
        log.info("Deleting track: {} by user: {}", trackId, userId);
        
        trackService.deleteTrack(trackId, userId);
        
        return ResponseEntity.ok(ApiResponse.success("Track deleted successfully"));
    }
    
    @GetMapping("/{trackId}/analytics")
    @PreAuthorize("hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getTrackAnalytics(
            @PathVariable String trackId,
            @RequestParam(required = false) String timeRange) {
        
        log.info("Fetching analytics for track: {}, timeRange: {}", trackId, timeRange);
        
        Object analytics = analyticsService.getTrackAnalytics(trackId, timeRange);
        
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
