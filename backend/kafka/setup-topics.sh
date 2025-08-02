#!/bin/bash
# CATCH Music Streaming - Kafka Topics Setup
# Configure Kafka topics for event streaming similar to Spotify's architecture

set -e

# Kafka configuration
KAFKA_HOST=${KAFKA_HOST:-"localhost:9092"}
REPLICATION_FACTOR=${REPLICATION_FACTOR:-3}
PARTITIONS_HIGH_THROUGHPUT=${PARTITIONS_HIGH_THROUGHPUT:-12}
PARTITIONS_MEDIUM_THROUGHPUT=${PARTITIONS_MEDIUM_THROUGHPUT:-6}
PARTITIONS_LOW_THROUGHPUT=${PARTITIONS_LOW_THROUGHPUT:-3}

echo "Setting up Kafka topics for CATCH Music Streaming..."

# Function to create topic
create_topic() {
    local topic_name=$1
    local partitions=$2
    local replication_factor=$3
    local configs=$4
    
    echo "Creating topic: $topic_name with $partitions partitions and replication factor $replication_factor"
    
    kafka-topics.sh \
        --create \
        --bootstrap-server $KAFKA_HOST \
        --topic $topic_name \
        --partitions $partitions \
        --replication-factor $replication_factor \
        --config $configs \
        --if-not-exists
}

# High-throughput topics (user activity, plays, streams)
echo "Creating high-throughput topics..."

# User play events - highest volume topic
create_topic "user-plays" $PARTITIONS_HIGH_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=2592000000,segment.ms=86400000,compression.type=lz4"

# Real-time streaming events
create_topic "streaming-events" $PARTITIONS_HIGH_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=604800000,segment.ms=3600000,compression.type=lz4"

# User activity feed events
create_topic "user-activity" $PARTITIONS_HIGH_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=2592000000,segment.ms=86400000,compression.type=lz4"

# Track popularity updates
create_topic "track-popularity" $PARTITIONS_HIGH_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=7776000000,segment.ms=86400000,compression.type=lz4"

# Medium-throughput topics (social interactions, recommendations)
echo "Creating medium-throughput topics..."

# User social interactions (likes, follows, shares)
create_topic "user-social" $PARTITIONS_MEDIUM_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=7776000000,segment.ms=86400000,compression.type=lz4"

# Track likes and interactions
create_topic "track-interactions" $PARTITIONS_MEDIUM_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=7776000000,segment.ms=86400000,compression.type=lz4"

# Playlist operations
create_topic "playlist-events" $PARTITIONS_MEDIUM_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=7776000000,segment.ms=86400000,compression.type=lz4"

# Recommendation engine events
create_topic "recommendation-events" $PARTITIONS_MEDIUM_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=2592000000,segment.ms=86400000,compression.type=lz4"

# Search analytics
create_topic "search-analytics" $PARTITIONS_MEDIUM_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=7776000000,segment.ms=86400000,compression.type=lz4"

# Notification events
create_topic "notifications" $PARTITIONS_MEDIUM_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=2592000000,segment.ms=86400000,compression.type=lz4"

# Low-throughput topics (admin, system events)
echo "Creating low-throughput topics..."

# User account events (registration, login, profile updates)
create_topic "user-account" $PARTITIONS_LOW_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=31557600000,segment.ms=604800000,compression.type=lz4"

# Content management events (track uploads, album releases)
create_topic "content-management" $PARTITIONS_LOW_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=31557600000,segment.ms=604800000,compression.type=lz4"

# System monitoring and health events
create_topic "system-monitoring" $PARTITIONS_LOW_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=2592000000,segment.ms=86400000,compression.type=lz4"

# Payment and subscription events
create_topic "payment-events" $PARTITIONS_LOW_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=94608000000,segment.ms=604800000,compression.type=lz4"

# Security and fraud detection events
create_topic "security-events" $PARTITIONS_LOW_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=94608000000,segment.ms=604800000,compression.type=lz4"

# Content moderation events
create_topic "content-moderation" $PARTITIONS_LOW_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=31557600000,segment.ms=604800000,compression.type=lz4"

# Specialized topics for ML and analytics
echo "Creating ML and analytics topics..."

# ML training data pipeline
create_topic "ml-training-data" $PARTITIONS_MEDIUM_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=7776000000,segment.ms=86400000,compression.type=lz4"

# Real-time analytics aggregations
create_topic "analytics-aggregations" $PARTITIONS_MEDIUM_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=7776000000,segment.ms=86400000,compression.type=lz4"

# A/B testing events
create_topic "ab-testing" $PARTITIONS_LOW_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=7776000000,segment.ms=86400000,compression.type=lz4"

# Dead letter queue for failed events
create_topic "dead-letter-queue" $PARTITIONS_LOW_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=delete,retention.ms=2592000000,segment.ms=86400000,compression.type=lz4"

# Compacted topics for state management
echo "Creating compacted topics for state management..."

# User state snapshots (compacted for latest state)
create_topic "user-state" $PARTITIONS_MEDIUM_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=compact,min.cleanable.dirty.ratio=0.1,delete.retention.ms=86400000"

# Track metadata snapshots
create_topic "track-metadata" $PARTITIONS_MEDIUM_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=compact,min.cleanable.dirty.ratio=0.1,delete.retention.ms=86400000"

# Playlist state snapshots
create_topic "playlist-state" $PARTITIONS_MEDIUM_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=compact,min.cleanable.dirty.ratio=0.1,delete.retention.ms=86400000"

# Artist metadata snapshots
create_topic "artist-metadata" $PARTITIONS_LOW_THROUGHPUT $REPLICATION_FACTOR \
    "cleanup.policy=compact,min.cleanable.dirty.ratio=0.1,delete.retention.ms=86400000"

echo "All Kafka topics created successfully!"

# List all topics to verify
echo "Listing all created topics:"
kafka-topics.sh --list --bootstrap-server $KAFKA_HOST

echo "Kafka setup completed!"
echo ""
echo "Topic Summary:"
echo "=============="
echo "High-throughput topics: user-plays, streaming-events, user-activity, track-popularity"
echo "Medium-throughput topics: user-social, track-interactions, playlist-events, recommendation-events, search-analytics, notifications"
echo "Low-throughput topics: user-account, content-management, system-monitoring, payment-events, security-events, content-moderation"
echo "ML/Analytics topics: ml-training-data, analytics-aggregations, ab-testing"
echo "State management topics: user-state, track-metadata, playlist-state, artist-metadata"
echo "Infrastructure topics: dead-letter-queue"
echo ""
echo "Retention policies:"
echo "- User plays: 30 days"
echo "- Streaming events: 7 days"
echo "- Social interactions: 90 days"
echo "- Account events: 1 year"
echo "- Payment events: 3 years"
echo "- State topics: Compacted (latest state only)"
