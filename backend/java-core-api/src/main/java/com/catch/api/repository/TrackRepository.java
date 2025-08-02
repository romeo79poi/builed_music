package com.catch.api.repository;

import com.catch.api.entity.Track;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrackRepository extends JpaRepository<Track, String> {
    
    // Find tracks by artist
    List<Track> findByArtistIdAndIsActiveTrue(String artistId);
    
    // Find tracks by album
    List<Track> findByAlbumIdAndIsActiveTrue(String albumId);
    
    // Search tracks by title
    @Query("SELECT t FROM Track t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) AND t.isActive = true")
    Page<Track> searchByTitle(@Param("query") String query, Pageable pageable);
    
    // Search tracks by artist name
    @Query("SELECT t FROM Track t WHERE LOWER(t.artistName) LIKE LOWER(CONCAT('%', :query, '%')) AND t.isActive = true")
    Page<Track> searchByArtistName(@Param("query") String query, Pageable pageable);
    
    // Find tracks by genre
    List<Track> findByGenreAndIsActiveTrueOrderByPlayCountDesc(String genre);
    
    // Find top tracks by play count
    @Query("SELECT t FROM Track t WHERE t.isActive = true ORDER BY t.playCount DESC")
    Page<Track> findTopTracksByPlayCount(Pageable pageable);
    
    // Find trending tracks (high play count in recent period)
    @Query("SELECT t FROM Track t WHERE t.isActive = true AND t.createdAt >= :since ORDER BY t.playCount DESC")
    List<Track> findTrendingTracks(@Param("since") LocalDateTime since, Pageable pageable);
    
    // Find recently added tracks
    @Query("SELECT t FROM Track t WHERE t.isActive = true ORDER BY t.createdAt DESC")
    Page<Track> findRecentlyAdded(Pageable pageable);
    
    // Find tracks by tags
    @Query("SELECT DISTINCT t FROM Track t JOIN t.tags tag WHERE tag IN :tags AND t.isActive = true")
    List<Track> findByTagsIn(@Param("tags") List<String> tags);
    
    // Increment play count
    @Modifying
    @Query("UPDATE Track t SET t.playCount = t.playCount + 1 WHERE t.id = :trackId")
    void incrementPlayCount(@Param("trackId") String trackId);
    
    // Increment like count
    @Modifying
    @Query("UPDATE Track t SET t.likeCount = t.likeCount + 1 WHERE t.id = :trackId")
    void incrementLikeCount(@Param("trackId") String trackId);
    
    // Decrement like count
    @Modifying
    @Query("UPDATE Track t SET t.likeCount = CASE WHEN t.likeCount > 0 THEN t.likeCount - 1 ELSE 0 END WHERE t.id = :trackId")
    void decrementLikeCount(@Param("trackId") String trackId);
    
    // Find tracks with duration range
    List<Track> findByDurationMsBetweenAndIsActiveTrue(Long minDuration, Long maxDuration);
    
    // Get track statistics
    @Query("SELECT COUNT(t), AVG(t.durationMs), SUM(t.playCount) FROM Track t WHERE t.isActive = true")
    Object[] getTrackStatistics();
    
    // Find explicit tracks
    List<Track> findByIsExplicitTrueAndIsActiveTrue();
    
    // Complex search query
    @Query("SELECT t FROM Track t WHERE " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.artistName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.albumName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND t.isActive = true " +
           "ORDER BY t.playCount DESC")
    Page<Track> globalSearch(@Param("query") String query, Pageable pageable);
}
