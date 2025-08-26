import numpy as np
import pandas as pd
import logging
from typing import List, Dict, Any, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler
import redis
import psycopg2
import pickle
import asyncio
from datetime import datetime, timedelta
import os
from concurrent.futures import ThreadPoolExecutor
import joblib

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MusicRecommendationEngine:
    """
    Advanced music recommendation engine using collaborative filtering,
    content-based filtering, and hybrid approaches for music streaming platforms.
    """
    
    def __init__(self, redis_client: redis.Redis, db_config: Dict[str, str]):
        self.redis_client = redis_client
        self.db_config = db_config
        self.tfidf_vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
        self.content_scaler = StandardScaler()
        self.svd_model = TruncatedSVD(n_components=100, random_state=42)
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Model cache keys
        self.CONTENT_MODEL_KEY = "ml:content_model"
        self.COLLABORATIVE_MODEL_KEY = "ml:collaborative_model"
        self.USER_FEATURES_KEY = "ml:user_features"
        self.TRACK_FEATURES_KEY = "ml:track_features"
        
        # Initialize models
        self._load_or_train_models()
    
    def _get_db_connection(self):
        """Get PostgreSQL database connection"""
        return psycopg2.connect(
            host=self.db_config['host'],
            database=self.db_config['database'],
            user=self.db_config['user'],
            password=self.db_config['password'],
            port=self.db_config.get('port', 5432)
        )
    
    def _load_or_train_models(self):
        """Load pre-trained models from Redis or train new ones"""
        try:
            # Try to load cached models
            content_model = self.redis_client.get(self.CONTENT_MODEL_KEY)
            collaborative_model = self.redis_client.get(self.COLLABORATIVE_MODEL_KEY)
            
            if content_model and collaborative_model:
                self.content_features = pickle.loads(content_model)
                self.user_item_matrix = pickle.loads(collaborative_model)
                logger.info("Loaded cached ML models from Redis")
            else:
                # Train new models
                logger.info("Training new ML models...")
                self._train_models()
                
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self._train_models()
    
    def _train_models(self):
        """Train recommendation models using current data"""
        try:
            # Load data from PostgreSQL
            tracks_df = self._load_tracks_data()
            interactions_df = self._load_user_interactions()
            
            # Train content-based model
            self._train_content_model(tracks_df)
            
            # Train collaborative filtering model
            self._train_collaborative_model(interactions_df)
            
            # Cache models in Redis
            self._cache_models()
            
            logger.info("ML models trained successfully")
            
        except Exception as e:
            logger.error(f"Error training models: {e}")
            raise
    
    def _load_tracks_data(self) -> pd.DataFrame:
        """Load tracks data from PostgreSQL"""
        query = """
            SELECT id, title, artist_name, album_name, genre, 
                   duration_ms, play_count, like_count, 
                   audio_quality, created_at
            FROM tracks 
            WHERE is_active = true
        """
        
        with self._get_db_connection() as conn:
            df = pd.read_sql(query, conn)
        
        # Feature engineering
        df['popularity_score'] = (df['play_count'] * 0.7 + df['like_count'] * 0.3)
        df['duration_minutes'] = df['duration_ms'] / 60000
        df['age_days'] = (datetime.now() - pd.to_datetime(df['created_at'])).dt.days
        
        # Create text features for content-based filtering
        df['text_features'] = (
            df['title'].fillna('') + ' ' +
            df['artist_name'].fillna('') + ' ' +
            df['album_name'].fillna('') + ' ' +
            df['genre'].fillna('')
        )
        
        return df
    
    def _load_user_interactions(self) -> pd.DataFrame:
        """Load user interaction data for collaborative filtering"""
        query = """
            SELECT DISTINCT user_id, track_id, 
                   COUNT(*) as play_count,
                   MAX(played_at) as last_played
            FROM user_play_history 
            WHERE played_at >= NOW() - INTERVAL '90 days'
            GROUP BY user_id, track_id
        """
        
        with self._get_db_connection() as conn:
            df = pd.read_sql(query, conn)
        
        return df
    
    def _train_content_model(self, tracks_df: pd.DataFrame):
        """Train content-based recommendation model"""
        # TF-IDF on text features
        tfidf_matrix = self.tfidf_vectorizer.fit_transform(tracks_df['text_features'])
        
        # Numerical features
        numerical_features = ['duration_minutes', 'popularity_score', 'age_days']
        numerical_matrix = self.content_scaler.fit_transform(
            tracks_df[numerical_features].fillna(0)
        )
        
        # Combine features
        content_features = np.hstack([
            tfidf_matrix.toarray(),
            numerical_matrix
        ])
        
        # Compute similarity matrix
        self.content_similarity = cosine_similarity(content_features)
        
        # Store track indices for mapping
        self.track_id_to_idx = {track_id: idx for idx, track_id in enumerate(tracks_df['id'])}
        self.idx_to_track_id = {idx: track_id for track_id, idx in self.track_id_to_idx.items()}
        
        self.content_features = {
            'similarity_matrix': self.content_similarity,
            'track_mapping': self.track_id_to_idx,
            'reverse_mapping': self.idx_to_track_id
        }
    
    def _train_collaborative_model(self, interactions_df: pd.DataFrame):
        """Train collaborative filtering model using SVD"""
        # Create user-item matrix
        user_item_matrix = interactions_df.pivot_table(
            index='user_id',
            columns='track_id',
            values='play_count',
            fill_value=0
        )
        
        # Apply SVD for dimensionality reduction
        user_item_norm = user_item_matrix.values
        
        # Normalize data
        user_means = np.mean(user_item_norm, axis=1)
        user_item_demeaned = user_item_norm - user_means.reshape(-1, 1)
        
        # Fit SVD
        self.svd_model.fit(user_item_demeaned)
        
        # Transform data
        user_factors = self.svd_model.transform(user_item_demeaned)
        item_factors = self.svd_model.components_
        
        self.user_item_matrix = {
            'user_factors': user_factors,
            'item_factors': item_factors,
            'user_means': user_means,
            'user_mapping': {user: idx for idx, user in enumerate(user_item_matrix.index)},
            'item_mapping': {item: idx for idx, item in enumerate(user_item_matrix.columns)},
            'reverse_user_mapping': {idx: user for user, idx in 
                                   zip(user_item_matrix.index, range(len(user_item_matrix.index)))},
            'reverse_item_mapping': {idx: item for item, idx in 
                                   zip(user_item_matrix.columns, range(len(user_item_matrix.columns)))}
        }
    
    def _cache_models(self):
        """Cache trained models in Redis"""
        try:
            # Cache with 24 hour expiration
            expiration = 86400
            
            self.redis_client.setex(
                self.CONTENT_MODEL_KEY,
                expiration,
                pickle.dumps(self.content_features)
            )
            
            self.redis_client.setex(
                self.COLLABORATIVE_MODEL_KEY,
                expiration,
                pickle.dumps(self.user_item_matrix)
            )
            
            logger.info("Models cached successfully in Redis")
            
        except Exception as e:
            logger.error(f"Error caching models: {e}")
    
    async def get_recommendations(self, user_id: str, num_recommendations: int = 20) -> List[Dict[str, Any]]:
        """
        Get personalized recommendations for a user using hybrid approach
        """
        try:
            # Get recommendations from different approaches
            content_recs = await self._get_content_based_recommendations(user_id, num_recommendations)
            collaborative_recs = await self._get_collaborative_recommendations(user_id, num_recommendations)
            trending_recs = await self._get_trending_recommendations(num_recommendations // 4)
            
            # Combine and rank recommendations
            combined_recs = self._combine_recommendations(
                content_recs, collaborative_recs, trending_recs, num_recommendations
            )
            
            return combined_recs
            
        except Exception as e:
            logger.error(f"Error getting recommendations for user {user_id}: {e}")
            # Fallback to trending tracks
            return await self._get_trending_recommendations(num_recommendations)
    
    async def _get_content_based_recommendations(self, user_id: str, num_recs: int) -> List[Dict[str, Any]]:
        """Get content-based recommendations based on user's listening history"""
        try:
            # Get user's recently played tracks
            user_tracks = await self._get_user_recent_tracks(user_id, limit=50)
            
            if not user_tracks:
                return []
            
            # Get similar tracks for each user track
            similar_tracks = []
            
            for track_id in user_tracks:
                if track_id in self.content_features['track_mapping']:
                    track_idx = self.content_features['track_mapping'][track_id]
                    similarities = self.content_features['similarity_matrix'][track_idx]
                    
                    # Get top similar tracks
                    similar_indices = similarities.argsort()[-10:][::-1]
                    
                    for idx in similar_indices:
                        similar_track_id = self.content_features['reverse_mapping'][idx]
                        if similar_track_id != track_id:  # Don't recommend same track
                            similar_tracks.append({
                                'track_id': similar_track_id,
                                'similarity_score': float(similarities[idx]),
                                'reason': 'content_based'
                            })
            
            # Remove duplicates and sort by similarity
            unique_tracks = {track['track_id']: track for track in similar_tracks}
            sorted_tracks = sorted(unique_tracks.values(), 
                                 key=lambda x: x['similarity_score'], reverse=True)
            
            return sorted_tracks[:num_recs]
            
        except Exception as e:
            logger.error(f"Error in content-based recommendations: {e}")
            return []
    
    async def _get_collaborative_recommendations(self, user_id: str, num_recs: int) -> List[Dict[str, Any]]:
        """Get collaborative filtering recommendations"""
        try:
            if user_id not in self.user_item_matrix['user_mapping']:
                return []
            
            user_idx = self.user_item_matrix['user_mapping'][user_id]
            user_factors = self.user_item_matrix['user_factors'][user_idx]
            item_factors = self.user_item_matrix['item_factors']
            user_mean = self.user_item_matrix['user_means'][user_idx]
            
            # Predict ratings for all items
            predicted_ratings = np.dot(user_factors, item_factors) + user_mean
            
            # Get top recommendations
            top_item_indices = predicted_ratings.argsort()[-num_recs:][::-1]
            
            recommendations = []
            for idx in top_item_indices:
                track_id = self.user_item_matrix['reverse_item_mapping'][idx]
                recommendations.append({
                    'track_id': track_id,
                    'predicted_rating': float(predicted_ratings[idx]),
                    'reason': 'collaborative_filtering'
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error in collaborative recommendations: {e}")
            return []
    
    async def _get_trending_recommendations(self, num_recs: int) -> List[Dict[str, Any]]:
        """Get trending tracks as fallback recommendations"""
        try:
            query = """
                SELECT id, play_count, like_count,
                       (play_count * 0.7 + like_count * 0.3) as score
                FROM tracks 
                WHERE is_active = true 
                  AND created_at >= NOW() - INTERVAL '7 days'
                ORDER BY score DESC 
                LIMIT %s
            """
            
            with self._get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (num_recs,))
                results = cursor.fetchall()
            
            recommendations = []
            for track_id, play_count, like_count, score in results:
                recommendations.append({
                    'track_id': track_id,
                    'trending_score': float(score),
                    'reason': 'trending'
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting trending recommendations: {e}")
            return []
    
    def _combine_recommendations(self, content_recs: List, collab_recs: List, 
                               trending_recs: List, num_final: int) -> List[Dict[str, Any]]:
        """Combine recommendations from different approaches with weighted scoring"""
        
        # Assign weights to different recommendation types
        weights = {
            'content_based': 0.4,
            'collaborative_filtering': 0.5,
            'trending': 0.1
        }
        
        combined_scores = {}
        
        # Aggregate scores from different approaches
        for recs, approach in [(content_recs, 'content_based'), 
                              (collab_recs, 'collaborative_filtering'),
                              (trending_recs, 'trending')]:
            
            for i, rec in enumerate(recs):
                track_id = rec['track_id']
                
                # Calculate position-based score (higher for top positions)
                position_score = (len(recs) - i) / len(recs) if recs else 0
                
                if track_id not in combined_scores:
                    combined_scores[track_id] = {
                        'track_id': track_id,
                        'total_score': 0,
                        'reasons': []
                    }
                
                # Add weighted score
                score_contribution = weights[approach] * position_score
                combined_scores[track_id]['total_score'] += score_contribution
                combined_scores[track_id]['reasons'].append(rec.get('reason', approach))
        
        # Sort by total score and return top recommendations
        final_recs = sorted(combined_scores.values(), 
                           key=lambda x: x['total_score'], reverse=True)
        
        return final_recs[:num_final]
    
    async def _get_user_recent_tracks(self, user_id: str, limit: int = 50) -> List[str]:
        """Get user's recently played tracks"""
        try:
            query = """
                SELECT DISTINCT track_id 
                FROM user_play_history 
                WHERE user_id = %s 
                  AND played_at >= NOW() - INTERVAL '30 days'
                ORDER BY played_at DESC 
                LIMIT %s
            """
            
            with self._get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (user_id, limit))
                results = cursor.fetchall()
            
            return [track_id for (track_id,) in results]
            
        except Exception as e:
            logger.error(f"Error getting user recent tracks: {e}")
            return []
    
    async def get_similar_tracks(self, track_id: str, num_similar: int = 10) -> List[Dict[str, Any]]:
        """Get tracks similar to a given track"""
        try:
            if track_id not in self.content_features['track_mapping']:
                return []
            
            track_idx = self.content_features['track_mapping'][track_id]
            similarities = self.content_features['similarity_matrix'][track_idx]
            
            # Get most similar tracks
            similar_indices = similarities.argsort()[-num_similar-1:][::-1]
            
            similar_tracks = []
            for idx in similar_indices:
                similar_track_id = self.content_features['reverse_mapping'][idx]
                if similar_track_id != track_id:  # Exclude the input track
                    similar_tracks.append({
                        'track_id': similar_track_id,
                        'similarity_score': float(similarities[idx])
                    })
            
            return similar_tracks[:num_similar]
            
        except Exception as e:
            logger.error(f"Error getting similar tracks: {e}")
            return []
    
    async def update_user_preferences(self, user_id: str, track_id: str, action: str):
        """Update user preferences based on interactions (like, play, skip)"""
        try:
            # Store interaction in Redis for real-time preference updates
            preference_key = f"user_prefs:{user_id}"
            
            interaction_data = {
                'track_id': track_id,
                'action': action,
                'timestamp': datetime.now().isoformat()
            }
            
            # Add to user's preference history
            self.redis_client.lpush(preference_key, pickle.dumps(interaction_data))
            self.redis_client.ltrim(preference_key, 0, 1000)  # Keep last 1000 interactions
            self.redis_client.expire(preference_key, 2592000)  # 30 days
            
            logger.info(f"Updated preferences for user {user_id}: {action} on track {track_id}")
            
        except Exception as e:
            logger.error(f"Error updating user preferences: {e}")
    
    def retrain_models_periodic(self):
        """Retrain models periodically (should be called by scheduler)"""
        try:
            logger.info("Starting periodic model retraining...")
            self._train_models()
            logger.info("Periodic model retraining completed")
        except Exception as e:
            logger.error(f"Error in periodic retraining: {e}")


# FastAPI service for ML recommendations
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="CATCH Music ML Service", version="1.0.0")

# Initialize recommendation engine
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=0,
    decode_responses=False
)

db_config = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'database': os.getenv('POSTGRES_DB', 'catch_music'),
    'user': os.getenv('POSTGRES_USER', 'catch_user'),
    'password': os.getenv('POSTGRES_PASSWORD', 'catch_password'),
    'port': int(os.getenv('POSTGRES_PORT', 5432))
}

recommendation_engine = MusicRecommendationEngine(redis_client, db_config)

class RecommendationRequest(BaseModel):
    user_id: str
    num_recommendations: int = 20

class SimilarTracksRequest(BaseModel):
    track_id: str
    num_similar: int = 10

class UserInteractionRequest(BaseModel):
    user_id: str
    track_id: str
    action: str  # 'play', 'like', 'skip', 'share'

@app.post("/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """Get personalized recommendations for a user"""
    try:
        recommendations = await recommendation_engine.get_recommendations(
            request.user_id, request.num_recommendations
        )
        return {
            "status": "success",
            "data": recommendations,
            "user_id": request.user_id,
            "count": len(recommendations)
        }
    except Exception as e:
        logger.error(f"Error in recommendations endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/similar-tracks")
async def get_similar_tracks(request: SimilarTracksRequest):
    """Get tracks similar to a given track"""
    try:
        similar_tracks = await recommendation_engine.get_similar_tracks(
            request.track_id, request.num_similar
        )
        return {
            "status": "success",
            "data": similar_tracks,
            "track_id": request.track_id,
            "count": len(similar_tracks)
        }
    except Exception as e:
        logger.error(f"Error in similar tracks endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user-interaction")
async def record_user_interaction(request: UserInteractionRequest):
    """Record user interaction for preference learning"""
    try:
        await recommendation_engine.update_user_preferences(
            request.user_id, request.track_id, request.action
        )
        return {
            "status": "success",
            "message": "Interaction recorded successfully"
        }
    except Exception as e:
        logger.error(f"Error recording interaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain-models")
async def retrain_models(background_tasks: BackgroundTasks):
    """Trigger model retraining"""
    background_tasks.add_task(recommendation_engine.retrain_models_periodic)
    return {"status": "success", "message": "Model retraining started"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ML Recommendation Engine"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
