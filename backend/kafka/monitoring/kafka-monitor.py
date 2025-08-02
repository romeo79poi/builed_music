#!/usr/bin/env python3
"""
CATCH Music Streaming - Kafka Monitoring Script
Real-time monitoring of Kafka cluster health and topic metrics
"""

import json
import time
import logging
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Any
from kafka import KafkaConsumer, KafkaProducer, KafkaAdminClient
from kafka.admin.config_resource import ConfigResource, ConfigResourceType
from kafka.errors import KafkaError
import subprocess
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class KafkaMonitor:
    """
    Kafka monitoring class for CATCH Music Streaming platform
    Monitors cluster health, topic metrics, and performance
    """
    
    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.bootstrap_servers = bootstrap_servers
        self.admin_client = KafkaAdminClient(
            bootstrap_servers=bootstrap_servers,
            client_id='catch-kafka-monitor'
        )
        
        # Critical topics for music streaming
        self.critical_topics = [
            'user-plays',
            'streaming-events', 
            'user-activity',
            'track-popularity',
            'user-social',
            'track-interactions'
        ]
        
        # Performance thresholds
        self.thresholds = {
            'lag_warning': 10000,      # Consumer lag warning threshold
            'lag_critical': 50000,     # Consumer lag critical threshold
            'throughput_low': 1000,    # Low throughput threshold (msgs/sec)
            'disk_usage_warning': 80,  # Disk usage warning (%)
            'disk_usage_critical': 90  # Disk usage critical (%)
        }
    
    def get_cluster_metadata(self) -> Dict[str, Any]:
        """Get cluster metadata and broker information"""
        try:
            metadata = self.admin_client.describe_cluster()
            brokers = []
            
            for broker in metadata.brokers:
                brokers.append({
                    'id': broker.nodeId,
                    'host': broker.host,
                    'port': broker.port,
                    'rack': broker.rack
                })
            
            return {
                'cluster_id': metadata.cluster_id,
                'controller_id': metadata.controller.nodeId if metadata.controller else None,
                'brokers': brokers,
                'broker_count': len(brokers)
            }
        except Exception as e:
            logger.error(f"Error getting cluster metadata: {e}")
            return {}
    
    def get_topic_metrics(self) -> Dict[str, Any]:
        """Get detailed metrics for all topics"""
        try:
            topics_metadata = self.admin_client.describe_topics()
            topic_configs = self.admin_client.describe_configs(
                config_resources=[
                    ConfigResource(ConfigResourceType.TOPIC, topic) 
                    for topic in topics_metadata.keys()
                ]
            )
            
            metrics = {}
            for topic_name, topic_metadata in topics_metadata.items():
                partitions = []
                total_replicas = 0
                
                for partition in topic_metadata.partitions:
                    partition_info = {
                        'partition_id': partition.partition,
                        'leader': partition.leader,
                        'replicas': [r.nodeId for r in partition.replicas],
                        'isr': [r.nodeId for r in partition.isr],
                        'replica_count': len(partition.replicas),
                        'isr_count': len(partition.isr)
                    }
                    partitions.append(partition_info)
                    total_replicas += len(partition.replicas)
                
                # Get topic configuration
                config = topic_configs.get(ConfigResource(ConfigResourceType.TOPIC, topic_name), {})
                config_dict = {entry.name: entry.value for entry in config.config_entries} if config else {}
                
                metrics[topic_name] = {
                    'partition_count': len(partitions),
                    'total_replicas': total_replicas,
                    'partitions': partitions,
                    'config': config_dict,
                    'is_critical': topic_name in self.critical_topics
                }
            
            return metrics
        except Exception as e:
            logger.error(f"Error getting topic metrics: {e}")
            return {}
    
    def get_consumer_lag(self) -> Dict[str, Any]:
        """Get consumer lag information for all consumer groups"""
        try:
            # Use kafka-consumer-groups.sh to get lag information
            cmd = [
                'kafka-consumer-groups.sh',
                '--bootstrap-server', self.bootstrap_servers,
                '--list'
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                logger.error(f"Error listing consumer groups: {result.stderr}")
                return {}
            
            consumer_groups = result.stdout.strip().split('\n')
            lag_info = {}
            
            for group in consumer_groups:
                if not group or group.startswith('Note:'):
                    continue
                
                # Get detailed lag information for each group
                cmd = [
                    'kafka-consumer-groups.sh',
                    '--bootstrap-server', self.bootstrap_servers,
                    '--group', group,
                    '--describe',
                    '--members'
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode == 0:
                    lag_info[group] = self._parse_consumer_lag(result.stdout)
            
            return lag_info
        except Exception as e:
            logger.error(f"Error getting consumer lag: {e}")
            return {}
    
    def _parse_consumer_lag(self, output: str) -> Dict[str, Any]:
        """Parse consumer lag output"""
        lines = output.strip().split('\n')
        if len(lines) < 2:
            return {}
        
        headers = lines[0].split()
        members = []
        
        for line in lines[1:]:
            if line.strip() and not line.startswith('Note:'):
                values = line.split()
                if len(values) >= len(headers):
                    member_info = dict(zip(headers, values))
                    members.append(member_info)
        
        return {'members': members}
    
    def get_broker_metrics(self) -> Dict[str, Any]:
        """Get broker-level metrics"""
        try:
            # This would typically integrate with JMX metrics
            # For demo purposes, we'll use basic disk usage
            broker_metrics = {}
            
            # Get disk usage for log directories
            log_dirs = ['/var/kafka-logs']  # Default log directory
            
            for log_dir in log_dirs:
                if os.path.exists(log_dir):
                    usage = self._get_disk_usage(log_dir)
                    broker_metrics[log_dir] = usage
            
            return broker_metrics
        except Exception as e:
            logger.error(f"Error getting broker metrics: {e}")
            return {}
    
    def _get_disk_usage(self, path: str) -> Dict[str, Any]:
        """Get disk usage for a given path"""
        try:
            statvfs = os.statvfs(path)
            total_bytes = statvfs.f_frsize * statvfs.f_blocks
            available_bytes = statvfs.f_frsize * statvfs.f_available
            used_bytes = total_bytes - available_bytes
            usage_percent = (used_bytes / total_bytes) * 100 if total_bytes > 0 else 0
            
            return {
                'total_bytes': total_bytes,
                'used_bytes': used_bytes,
                'available_bytes': available_bytes,
                'usage_percent': round(usage_percent, 2)
            }
        except Exception as e:
            logger.error(f"Error getting disk usage for {path}: {e}")
            return {}
    
    def check_cluster_health(self) -> Dict[str, Any]:
        """Comprehensive cluster health check"""
        health_status = {
            'timestamp': datetime.now().isoformat(),
            'overall_status': 'HEALTHY',
            'issues': [],
            'warnings': []
        }
        
        try:
            # Check cluster metadata
            cluster_info = self.get_cluster_metadata()
            if not cluster_info or cluster_info.get('broker_count', 0) == 0:
                health_status['overall_status'] = 'CRITICAL'
                health_status['issues'].append('No brokers available')
            
            # Check topic health
            topic_metrics = self.get_topic_metrics()
            for topic_name, metrics in topic_metrics.items():
                if metrics['is_critical']:
                    # Check if all partitions have leaders
                    for partition in metrics['partitions']:
                        if partition['leader'] is None:
                            health_status['overall_status'] = 'CRITICAL'
                            health_status['issues'].append(
                                f'Topic {topic_name} partition {partition["partition_id"]} has no leader'
                            )
                        
                        # Check ISR health
                        if partition['isr_count'] < partition['replica_count']:
                            health_status['warnings'].append(
                                f'Topic {topic_name} partition {partition["partition_id"]} has under-replicated ISR'
                            )
            
            # Check consumer lag
            consumer_lag = self.get_consumer_lag()
            for group, lag_info in consumer_lag.items():
                # This would need actual lag values from a more detailed implementation
                pass
            
            # Check broker metrics
            broker_metrics = self.get_broker_metrics()
            for log_dir, usage in broker_metrics.items():
                if usage.get('usage_percent', 0) > self.thresholds['disk_usage_critical']:
                    health_status['overall_status'] = 'CRITICAL'
                    health_status['issues'].append(
                        f'Disk usage critical in {log_dir}: {usage["usage_percent"]}%'
                    )
                elif usage.get('usage_percent', 0) > self.thresholds['disk_usage_warning']:
                    health_status['warnings'].append(
                        f'Disk usage warning in {log_dir}: {usage["usage_percent"]}%'
                    )
            
            # Adjust overall status based on warnings
            if health_status['warnings'] and health_status['overall_status'] == 'HEALTHY':
                health_status['overall_status'] = 'WARNING'
        
        except Exception as e:
            health_status['overall_status'] = 'CRITICAL'
            health_status['issues'].append(f'Health check failed: {str(e)}')
        
        return health_status
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive monitoring report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'cluster_info': self.get_cluster_metadata(),
            'topic_metrics': self.get_topic_metrics(),
            'consumer_lag': self.get_consumer_lag(),
            'broker_metrics': self.get_broker_metrics(),
            'health_check': self.check_cluster_health()
        }
        
        return report
    
    def monitor_continuous(self, interval: int = 60):
        """Continuous monitoring with specified interval"""
        logger.info(f"Starting continuous monitoring with {interval}s interval")
        
        while True:
            try:
                report = self.generate_report()
                
                # Log health status
                health = report['health_check']
                logger.info(f"Cluster Status: {health['overall_status']}")
                
                if health['issues']:
                    for issue in health['issues']:
                        logger.error(f"ISSUE: {issue}")
                
                if health['warnings']:
                    for warning in health['warnings']:
                        logger.warning(f"WARNING: {warning}")
                
                # Log critical topic status
                topic_metrics = report['topic_metrics']
                for topic in self.critical_topics:
                    if topic in topic_metrics:
                        metrics = topic_metrics[topic]
                        logger.info(
                            f"Topic {topic}: {metrics['partition_count']} partitions, "
                            f"{metrics['total_replicas']} replicas"
                        )
                
                time.sleep(interval)
                
            except KeyboardInterrupt:
                logger.info("Monitoring stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(interval)

def main():
    parser = argparse.ArgumentParser(description='CATCH Music Streaming Kafka Monitor')
    parser.add_argument('--bootstrap-servers', default='localhost:9092',
                        help='Kafka bootstrap servers')
    parser.add_argument('--mode', choices=['report', 'monitor'], default='report',
                        help='Run mode: generate single report or continuous monitoring')
    parser.add_argument('--interval', type=int, default=60,
                        help='Monitoring interval in seconds (for monitor mode)')
    parser.add_argument('--output', choices=['json', 'human'], default='human',
                        help='Output format')
    
    args = parser.parse_args()
    
    monitor = KafkaMonitor(bootstrap_servers=args.bootstrap_servers)
    
    if args.mode == 'report':
        report = monitor.generate_report()
        
        if args.output == 'json':
            print(json.dumps(report, indent=2))
        else:
            # Human-readable output
            print("CATCH Music Streaming - Kafka Cluster Report")
            print("=" * 50)
            print(f"Generated: {report['timestamp']}")
            print()
            
            # Cluster info
            cluster = report['cluster_info']
            print(f"Cluster ID: {cluster.get('cluster_id', 'Unknown')}")
            print(f"Controller: Broker {cluster.get('controller_id', 'Unknown')}")
            print(f"Brokers: {cluster.get('broker_count', 0)}")
            print()
            
            # Health status
            health = report['health_check']
            print(f"Overall Status: {health['overall_status']}")
            if health['issues']:
                print("Issues:")
                for issue in health['issues']:
                    print(f"  - {issue}")
            if health['warnings']:
                print("Warnings:")
                for warning in health['warnings']:
                    print(f"  - {warning}")
            print()
            
            # Topic summary
            topics = report['topic_metrics']
            print("Critical Topics:")
            for topic in monitor.critical_topics:
                if topic in topics:
                    metrics = topics[topic]
                    print(f"  {topic}: {metrics['partition_count']} partitions, "
                          f"{metrics['total_replicas']} replicas")
    
    elif args.mode == 'monitor':
        monitor.monitor_continuous(interval=args.interval)

if __name__ == '__main__':
    main()
