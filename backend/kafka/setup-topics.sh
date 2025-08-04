#!/bin/bash

# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
while ! kafka-broker-api-versions --bootstrap-server $KAFKA_BROKERS > /dev/null 2>&1; do
    echo "Kafka not ready yet, waiting..."
    sleep 5
done

echo "Kafka is ready! Creating topics..."

# Create high-throughput topics
kafka-topics --create --bootstrap-server $KAFKA_BROKERS --topic user-plays --partitions 10 --replication-factor 1 --config retention.ms=604800000 --if-not-exists
kafka-topics --create --bootstrap-server $KAFKA_BROKERS --topic streaming-events --partitions 8 --replication-factor 1 --config retention.ms=86400000 --if-not-exists  
kafka-topics --create --bootstrap-server $KAFKA_BROKERS --topic user-activity --partitions 6 --replication-factor 1 --config retention.ms=2592000000 --if-not-exists
kafka-topics --create --bootstrap-server $KAFKA_BROKERS --topic track-popularity --partitions 4 --replication-factor 1 --config retention.ms=2592000000 --if-not-exists

# Create medium-throughput topics
kafka-topics --create --bootstrap-server $KAFKA_BROKERS --topic user-social --partitions 4 --replication-factor 1 --config retention.ms=2592000000 --if-not-exists
kafka-topics --create --bootstrap-server $KAFKA_BROKERS --topic track-interactions --partitions 4 --replication-factor 1 --config retention.ms=2592000000 --if-not-exists
kafka-topics --create --bootstrap-server $KAFKA_BROKERS --topic playlist-events --partitions 3 --replication-factor 1 --config retention.ms=2592000000 --if-not-exists
kafka-topics --create --bootstrap-server $KAFKA_BROKERS --topic recommendation-events --partitions 3 --replication-factor 1 --config retention.ms=604800000 --if-not-exists

# Create system topics
kafka-topics --create --bootstrap-server $KAFKA_BROKERS --topic user-auth-events --partitions 2 --replication-factor 1 --config retention.ms=2592000000 --if-not-exists
kafka-topics --create --bootstrap-server $KAFKA_BROKERS --topic system-notifications --partitions 2 --replication-factor 1 --config retention.ms=604800000 --if-not-exists

echo "Topics created successfully!"

# List all topics to verify
echo "Current topics:"
kafka-topics --list --bootstrap-server $KAFKA_BROKERS
