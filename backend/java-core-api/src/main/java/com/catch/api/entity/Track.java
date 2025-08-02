package com.catch.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "tracks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Track {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String artistId;
    
    @Column(name = "artist_name")
    private String artistName;
    
    @Column(name = "album_id")
    private String albumId;
    
    @Column(name = "album_name")
    private String albumName;
    
    @Column(name = "duration_ms")
    private Long durationMs;
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @Column(name = "cover_image_url")
    private String coverImageUrl;
    
    @Column(name = "genre")
    private String genre;
    
    @Column(name = "release_date")
    private LocalDateTime releaseDate;
    
    @Column(name = "play_count", columnDefinition = "BIGINT DEFAULT 0")
    private Long playCount = 0L;
    
    @Column(name = "like_count", columnDefinition = "BIGINT DEFAULT 0")
    private Long likeCount = 0L;
    
    @Column(name = "is_explicit")
    private Boolean isExplicit = false;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "audio_quality")
    private String audioQuality = "320kbps";
    
    @ElementCollection
    @CollectionTable(name = "track_tags", joinColumns = @JoinColumn(name = "track_id"))
    @Column(name = "tag")
    private Set<String> tags;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Business methods
    public void incrementPlayCount() {
        this.playCount = (this.playCount == null ? 0 : this.playCount) + 1;
    }
    
    public void incrementLikeCount() {
        this.likeCount = (this.likeCount == null ? 0 : this.likeCount) + 1;
    }
    
    public void decrementLikeCount() {
        this.likeCount = (this.likeCount == null || this.likeCount <= 0) ? 0 : this.likeCount - 1;
    }
}
