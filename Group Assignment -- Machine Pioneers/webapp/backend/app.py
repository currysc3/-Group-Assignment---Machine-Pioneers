#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MovieRec - Movie Recommendation System Backend API Service
Movie Recommendation System Backend based on Collaborative Filtering Algorithm

Tech Stack: Flask + RESTful API
Author: AI Assistant
Date: 2026-03-17
"""

from flask import Flask, jsonify, request, send_from_directory, render_template_string
from flask_cors import CORS
import pandas as pd
import numpy as np
import json
import os
import sys
from pathlib import Path
from datetime import datetime
from functools import lru_cache
import ast

# Import poster cache
from poster_cache import get_poster_url

# Add collaborative filtering algorithm path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "collaborative_filtering_algorithm"))

try:
    from user_based_cf import UserBasedCF
    from item_based_cf import ItemBasedCF
    CF_AVAILABLE = True
except ImportError:
    CF_AVAILABLE = False
    print("Warning: Collaborative filtering algorithm module not found, will use mock data")

app = Flask(__name__, static_folder=None, template_folder='../frontend_new/dist')
CORS(app)  # Enable CORS support

# ==================== Path Configuration ====================
BASE_DIR = Path(__file__).parent.parent
ASSETS_DIR = BASE_DIR / "assets"
DATA_DIR = BASE_DIR.parent / "数据预处理-核心代码+csv文件+分布图+说明"
CF_DIR = BASE_DIR.parent / "协同过滤算法-核心代码+推荐结果+说明"
EVAL_DIR = BASE_DIR.parent / "协同过滤算法评估与可视化"
FRONTEND_DIR = BASE_DIR / "frontend"

# ==================== Data Loading ====================
class DataStore:
    """Data store class for caching loaded data"""
    def __init__(self):
        self.movies = None
        self.movies_df = None
        self.user_based_recommendations = None
        self.item_based_recommendations = None
        self.test_predictions = None
        self.test_predictions_cosine = None
        self.test_predictions_pearson = None
        self.evaluation_results = None
        self.user_profiles = None
        self.user_ratings = None
        self.cleaned_movies = None
        # New enhanced data
        self.enhanced_user_profiles = None
        self.user_similarities = None
        self.expanded_movies = None
        
    def load_all(self):
        """Load all data"""
        print("Loading data...")
        
        # 1. Load expanded movie data (500 movies)
        expanded_movies_file = ASSETS_DIR / "data" / "movies_display_expanded.json"
        if expanded_movies_file.exists():
            with open(expanded_movies_file, 'r', encoding='utf-8') as f:
                self.expanded_movies = json.load(f).get('movies', [])
            print(f"✓ Loaded {len(self.expanded_movies)} expanded movies")
            # Also set as base movie data
            self.movies = self.expanded_movies[:100]  # First 100 for base display
        else:
            # Fallback to original data
            movies_file = ASSETS_DIR / "data" / "movies_display.json"
            if movies_file.exists():
                with open(movies_file, 'r', encoding='utf-8') as f:
                    self.movies = json.load(f).get('movies', [])
                print(f"✓ Loaded {len(self.movies)} movies")
        
        # Load cleaned_movies.csv for detailed information
        cleaned_movies_csv = DATA_DIR / "cleaned_movies.csv"
        if cleaned_movies_csv.exists():
            self.cleaned_movies = pd.read_csv(cleaned_movies_csv)
            print(f"✓ Loaded cleaned_movies data")
        
        # 2. Load recommendation results
        ub_file = CF_DIR / "user_based_recommendations_k10_cosine.csv"
        if ub_file.exists():
            self.user_based_recommendations = pd.read_csv(ub_file)
            print(f"✓ Loaded user-based recommendation data")
        
        ib_file = CF_DIR / "item_based_recommendations_k10_cosine.csv"
        if ib_file.exists():
            self.item_based_recommendations = pd.read_csv(ib_file)
            print(f"✓ Loaded item-based recommendation data")
        
        # 3. Load test prediction results
        pred_file = CF_DIR / "test_predictions_cosine.csv"
        if pred_file.exists():
            self.test_predictions_cosine = pd.read_csv(pred_file)
            print(f"✓ Loaded cosine test prediction data")
        
        pred_file_pearson = CF_DIR / "test_predictions_pearson.csv"
        if pred_file_pearson.exists():
            self.test_predictions_pearson = pd.read_csv(pred_file_pearson)
            print(f"✓ Loaded pearson test prediction data")
        
        # 4. Load enhanced user profiles
        enhanced_profiles_file = ASSETS_DIR / "data" / "enhanced_user_profiles.json"
        if enhanced_profiles_file.exists():
            with open(enhanced_profiles_file, 'r', encoding='utf-8') as f:
                self.enhanced_user_profiles = json.load(f).get('users', [])
            print(f"✓ Loaded {len(self.enhanced_user_profiles)} enhanced user profiles")
        
        # 5. Load user similarity data
        user_similarities_file = ASSETS_DIR / "data" / "user_similarities.json"
        if user_similarities_file.exists():
            with open(user_similarities_file, 'r', encoding='utf-8') as f:
                self.user_similarities = json.load(f).get('user_similarities', [])
            print(f"✓ Loaded {len(self.user_similarities)} user similarity data")
        
        # 6. Load user rating history
        ratings_file = CF_DIR / "user_movie_ratings.csv"
        if ratings_file.exists():
            self.user_ratings = pd.read_csv(ratings_file)
            print(f"✓ Loaded user rating data")
        
        print("Data loading complete!")

# Global data store
data_store = DataStore()

# ==================== Helper Functions ====================
def get_movie_by_id(movie_id):
    """Get movie information by ID (prefer expanded data)"""
    # First search in expanded data
    if data_store.expanded_movies:
        for movie in data_store.expanded_movies:
            if movie['id'] == movie_id or movie.get('movie_id') == movie_id:
                return movie
    # Fallback to base data
    for movie in (data_store.movies or []):
        if movie.get('id') == movie_id or movie.get('movie_id') == movie_id:
            return movie
    return None

def get_enhanced_user_profile(user_id):
    """Get enhanced user profile"""
    if data_store.enhanced_user_profiles:
        for user in data_store.enhanced_user_profiles:
            if user['user_id'] == user_id:
                return user
    return None

def get_user_similarities(user_id):
    """Get similar users list for a user"""
    if data_store.user_similarities:
        for us in data_store.user_similarities:
            if us['user_id'] == user_id:
                return us.get('similar_users', [])
    return []

def parse_genres(genres_str):
    """Parse genre string to list"""
    if isinstance(genres_str, list):
        return genres_str
    if pd.isna(genres_str):
        return []
    try:
        return ast.literal_eval(genres_str)
    except:
        return [g.strip() for g in str(genres_str).split(',') if g.strip()]

def jaccard_similarity(set1, set2):
    """Calculate Jaccard similarity"""
    if not set1 or not set2:
        return 0
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    return intersection / union if union > 0 else 0

def get_recommendations_for_user(user_id, algorithm='item_based', n=10):
    """Get recommendations for a user (include all recommendations, use placeholder info for missing movies)"""
    if algorithm == 'user_based' and data_store.user_based_recommendations is not None:
        recs = data_store.user_based_recommendations[
            data_store.user_based_recommendations['user_id'] == user_id
        ]
    elif algorithm == 'item_based' and data_store.item_based_recommendations is not None:
        recs = data_store.item_based_recommendations[
            data_store.item_based_recommendations['user_id'] == user_id
        ]
    else:
        return []
    
    # Merge movie details
    result = []
    for _, row in recs.iterrows():
        movie_id = int(row['movie_id'])
        title = row.get('title', 'Unknown')
        
        # Try to get from expanded movie library
        movie = get_movie_by_id(movie_id)
        
        if movie:
            # Use complete information from movie library
            genres = movie.get('genres', [])
            poster_url = movie.get('poster_url')
            overview = movie.get('overview')
            vote_average = movie.get('vote_average')
            runtime = movie.get('runtime')
            cast = movie.get('cast', [])[:5]
            director = movie.get('director')
            release_year = movie.get('release_year')
        else:
            # Use basic info from recommendation data + generated placeholder info
            genres = parse_genres(row.get('genres', ''))
            poster_url = get_poster_url(movie_id, title, genres)
            overview = f"Recommended film: {title}"
            vote_average = None
            runtime = None
            cast = []
            director = None
            release_year = None
        
        result.append({
            'movie_id': movie_id,
            'title': title,
            'predicted_rating': float(row['predicted_rating']),
            'rank': int(row['rank']),
            'poster_url': poster_url,
            'genres': genres,
            'release_year': release_year,
            'overview': overview,
            'vote_average': vote_average,
            'runtime': runtime,
            'cast': cast,
            'director': director
        })
        
        if len(result) >= n:
            break
    
    return result

# ==================== Frontend Routes ====================

@app.route('/')
def index():
    """Homepage - React App"""
    dist_dir = BASE_DIR / "frontend_new" / "dist"
    return send_from_directory(dist_dir, 'index.html')

# ==================== API Routes ====================

# -------------------- Movie Related APIs --------------------

@app.route('/api/movies')
def get_movies():
    """
    Get movie list
    Support using expanded dataset
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    use_expanded = request.args.get('expanded', 'false').lower() == 'true'
    genre = request.args.get('genre', '')
    search = request.args.get('search', '').lower()
    
    # Select data source
    if use_expanded and data_store.expanded_movies:
        movies = data_store.expanded_movies
    else:
        movies = data_store.movies or []
    
    # Filter
    if genre:
        movies = [m for m in movies if genre in str(m.get('genres', ''))]
    
    if search:
        movies = [m for m in movies if search in str(m.get('title', '')).lower()]
    
    # Pagination
    total = len(movies)
    start = (page - 1) * per_page
    end = start + per_page
    paginated_movies = movies[start:end]
    
    return jsonify({
        'movies': paginated_movies,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page,
        'using_expanded': use_expanded
    })

@app.route('/api/movies/<int:movie_id>')
def get_movie_detail(movie_id):
    """Get movie details (prefer expanded data)"""
    movie = get_movie_by_id(movie_id)
    if movie:
        return jsonify(movie)
    return jsonify({'error': 'Movie not found'}), 404

@app.route('/api/movies/<int:movie_id>/similar')
def get_similar_movies(movie_id):
    """Get similar movies (based on genre similarity)"""
    movie = get_movie_by_id(movie_id)
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404
    
    target_genres = set(parse_genres(movie.get('genres', [])))
    
    # Use expanded dataset to find similar movies
    movies_source = data_store.expanded_movies if data_store.expanded_movies else data_store.movies
    
    similarities = []
    for m in movies_source:
        if m.get('id') == movie_id or m.get('movie_id') == movie_id:
            continue
        
        m_genres = set(parse_genres(m.get('genres', [])))
        sim_score = jaccard_similarity(target_genres, m_genres)
        
        if sim_score > 0:
            similarities.append({
                'movie': m,
                'similarity': round(sim_score * 100, 1),
                'shared_genres': list(target_genres & m_genres)
            })
    
    # Sort by similarity, take top 6
    similarities.sort(key=lambda x: x['similarity'], reverse=True)
    top_similar = similarities[:6]
    
    return jsonify({
        'movie_id': movie_id,
        'source_movie': movie,
        'similar_movies': top_similar
    })

@app.route('/api/movies/genres')
def get_genres():
    """Get all movie genres"""
    genres = set()
    movies_source = data_store.expanded_movies if data_store.expanded_movies else data_store.movies
    
    for movie in movies_source:
        movie_genres = parse_genres(movie.get('genres', []))
        genres.update(movie_genres)
    
    return jsonify({'genres': sorted(list(genres))})

@app.route('/api/movies/search')
def search_movies():
    """Advanced search API"""
    query = request.args.get('q', '').lower()
    year_min = request.args.get('year_min', type=int)
    year_max = request.args.get('year_max', type=int)
    rating_min = request.args.get('rating_min', type=float)
    rating_max = request.args.get('rating_max', type=float)
    genres_filter = request.args.get('genres', '').split(',') if request.args.get('genres') else []
    runtime_min = request.args.get('runtime_min', type=int)
    runtime_max = request.args.get('runtime_max', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Use expanded dataset
    movies = data_store.expanded_movies if data_store.expanded_movies else data_store.movies
    
    results = []
    for movie in movies:
        # Text search
        if query:
            title = str(movie.get('title', '')).lower()
            overview = str(movie.get('overview', '')).lower()
            if query not in title and query not in overview:
                continue
        
        # Year filter
        year = movie.get('release_year')
        if year_min and (not year or year < year_min):
            continue
        if year_max and (not year or year > year_max):
            continue
        
        # Rating filter
        rating = movie.get('vote_average')
        if rating_min is not None and (not rating or rating < rating_min):
            continue
        if rating_max is not None and (not rating or rating > rating_max):
            continue
        
        # Genre filter
        if genres_filter:
            movie_genres = parse_genres(movie.get('genres', []))
            if not any(g in movie_genres for g in genres_filter):
                continue
        
        # Runtime filter
        runtime = movie.get('runtime')
        if runtime_min and (not runtime or runtime < runtime_min):
            continue
        if runtime_max and (not runtime or runtime > runtime_max):
            continue
        
        results.append(movie)
    
    # Pagination
    total = len(results)
    start = (page - 1) * per_page
    end = start + per_page
    paginated = results[start:end]
    
    return jsonify({
        'movies': paginated,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })

# -------------------- Recommendation Related APIs --------------------

@app.route('/api/recommendations/<int:user_id>')
def get_user_recommendations(user_id):
    """Get user recommendations"""
    algorithm = request.args.get('algorithm', 'item_based')
    n = request.args.get('n', 10, type=int)
    
    recommendations = get_recommendations_for_user(user_id, algorithm, n)
    
    return jsonify({
        'user_id': user_id,
        'algorithm': algorithm,
        'recommendations': recommendations
    })

@app.route('/api/recommendations/compare/<int:user_id>')
def compare_recommendations(user_id):
    """Compare recommendations from two algorithms"""
    user_based = get_recommendations_for_user(user_id, 'user_based', 10)
    item_based = get_recommendations_for_user(user_id, 'item_based', 10)
    
    # Calculate overlap
    user_based_ids = {r['movie_id'] for r in user_based}
    item_based_ids = {r['movie_id'] for r in item_based}
    overlap = user_based_ids & item_based_ids
    
    return jsonify({
        'user_id': user_id,
        'user_based_cf': user_based,
        'item_based_cf': item_based,
        'overlap': {
            'count': len(overlap),
            'movie_ids': list(overlap),
            'percentage': round(len(overlap) / max(len(user_based_ids), len(item_based_ids)) * 100, 1) if user_based_ids or item_based_ids else 0
        }
    })

# -------------------- User Related APIs --------------------

@app.route('/api/users')
def get_users():
    """Get user list (using enhanced data)"""
    if data_store.enhanced_user_profiles:
        users = [{
            'user_id': u['user_id'],
            'username': u['username'],
            'avatar_url': u['avatar_url'],
            'activity_level': u['activity_level'],
            'total_ratings': u['total_ratings']
        } for u in data_store.enhanced_user_profiles]
    elif data_store.user_based_recommendations is not None:
        user_ids = sorted(data_store.user_based_recommendations['user_id'].unique())
        users = [{'user_id': int(uid), 'username': f'User {int(uid)}'} for uid in user_ids[:50]]
    else:
        users = [{'user_id': i, 'username': f'User {i}'} for i in range(10)]
    
    return jsonify({'users': users})

@app.route('/api/users/<int:user_id>/profile')
def get_user_profile(user_id):
    """Get enhanced user profile"""
    profile = get_enhanced_user_profile(user_id)
    if profile:
        # Ensure top_rated_movies field exists (extract from rating_history)
        if 'top_rated_movies' not in profile and 'rating_history' in profile:
            # Extract highest rated movies from rating_history
            history = profile['rating_history']
            if history:
                # Sort by rating, take top 3
                sorted_history = sorted(history, key=lambda x: x.get('rating', 0), reverse=True)[:3]
                profile['top_rated_movies'] = [
                    {
                        'movie_id': h.get('movie_id'),
                        'title': h.get('title', f'Movie {h.get("movie_id")}'),
                        'rating': h.get('rating', 0),
                        'poster_url': h.get('poster_url') or f"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&h=150&fit=crop"
                    }
                    for h in sorted_history
                ]
            else:
                profile['top_rated_movies'] = []
        
        # Ensure activity_level is string
        if isinstance(profile.get('activity_level'), (int, float)):
            score = profile['activity_level']
            if score <= 100:
                profile['activity_level'] = 'low'
            elif score <= 200:
                profile['activity_level'] = 'medium'
            elif score <= 300:
                profile['activity_level'] = 'high'
            else:
                profile['activity_level'] = 'very_high'
        
        return jsonify(profile)
    
    # Fallback to base data
    if data_store.user_ratings is not None:
        user_ratings = data_store.user_ratings[data_store.user_ratings['user_id'] == user_id]
        if len(user_ratings) > 0:
            return jsonify({
                'user_id': user_id,
                'username': f'User {user_id}',
                'total_ratings': len(user_ratings),
                'avg_rating': round(user_ratings['rating'].mean(), 2),
                'activity_level': 'medium',
                'rating_bias': 0,
                'genre_preferences': [],
                'rating_distribution': [],
                'top_rated_movies': []
            })
    
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/users/<int:user_id>/ratings')
def get_user_ratings(user_id):
    """Get user rating history"""
    if data_store.user_ratings is None:
        return jsonify({'ratings': []})
    
    user_ratings = data_store.user_ratings[data_store.user_ratings['user_id'] == user_id]
    
    ratings_with_details = []
    for _, row in user_ratings.iterrows():
        movie_id = int(row['movie_id'])
        movie = get_movie_by_id(movie_id)
        
        ratings_with_details.append({
            'movie_id': movie_id,
            'title': movie.get('title', f'Movie {movie_id}') if movie else f'Movie {movie_id}',
            'rating': float(row['rating']),
            'poster_url': movie.get('poster_url') if movie else None
        })
    
    return jsonify({
        'user_id': user_id,
        'ratings': ratings_with_details
    })

@app.route('/api/users/similarity')
def get_user_similarity():
    """Get similar users (using pre-calculated similarity data) - match frontend component format"""
    user_id = request.args.get('user_id', type=int)
    n = request.args.get('n', 5, type=int)
    
    if user_id is None:
        return jsonify({'error': 'user_id is required'}), 400
    
    # Get current user info
    current_profile = get_enhanced_user_profile(user_id)
    similar_users_raw = get_user_similarities(user_id)
    
    # Convert to frontend component expected format
    similar_users = []
    for su in similar_users_raw[:n]:
        # Get similar user's genre preferences for comparison
        similar_profile = get_enhanced_user_profile(su['user_id'])
        
        # Build genre comparison data
        genre_comparison = []
        if current_profile and similar_profile:
            current_genres = {g['genre']: g['score'] for g in current_profile.get('genre_preferences', [])}
            similar_genres = {g['genre']: g['score'] for g in similar_profile.get('genre_preferences', [])}
            
            for genre in su.get('common_genres', []):
                genre_comparison.append({
                    'genre': genre,
                    'user_score': current_genres.get(genre, 0),
                    'similar_user_score': similar_genres.get(genre, 0)
                })
        
        similar_users.append({
            'user_id': str(su['user_id']),
            'username': su['username'],
            'avatar_url': su.get('avatar_url'),
            'similarity_percentage': su['similarity_scores']['overall_similarity'],
            'shared_genres': su.get('common_genres', []),
            'common_movies_count': su.get('common_genres_count', 0) * 3,  # Estimated value
            'genre_comparison': genre_comparison
        })
    
    return jsonify({
        'current_user': {
            'user_id': str(user_id),
            'username': current_profile['username'] if current_profile else f'User {user_id}'
        },
        'similar_users': similar_users
    })

# -------------------- Algorithm Explanation APIs --------------------

@app.route('/api/explain/recommendation')
def explain_recommendation():
    """Explain recommendation reason"""
    user_id = request.args.get('user_id', type=int)
    movie_id = request.args.get('movie_id', type=int)
    algorithm = request.args.get('algorithm', 'user_based')
    
    if user_id is None or movie_id is None:
        return jsonify({'error': 'user_id and movie_id are required'}), 400
    
    movie = get_movie_by_id(movie_id)
    user_profile = get_enhanced_user_profile(user_id)
    
    if algorithm == 'user_based':
        # Find similar users
        similar_users = get_user_similarities(user_id)[:3]
        
        explanation = {
            'algorithm': 'user_based',
            'title': 'Users Like You Enjoyed This',
            'description': f'Based on users with similar taste preferences to yours',
            'user_preferences': user_profile.get('top_genres', []) if user_profile else [],
            'movie_genres': movie.get('genres', []) if movie else [],
            'similar_users': similar_users,
            'reasoning': f"This recommendation is based on the preferences of {len(similar_users)} users who share similar taste patterns with you."
        }
    else:
        # Item-based explanation
        explanation = {
            'algorithm': 'item_based',
            'title': 'Because of Your Watch History',
            'description': 'Movies similar to those you rated highly',
            'user_preferences': user_profile.get('top_genres', []) if user_profile else [],
            'movie_genres': movie.get('genres', []) if movie else [],
            'shared_genres': list(set(user_profile.get('top_genres', [])) & set(movie.get('genres', []))) if user_profile and movie else [],
            'reasoning': "This movie shares genre characteristics with films you've enjoyed in the past."
        }
    
    return jsonify(explanation)

# -------------------- Algorithm Comparison APIs --------------------

@app.route('/api/compare/algorithms')
def compare_algorithms():
    """Compare two algorithms - match frontend component expected format"""
    user_id = request.args.get('user_id', type=int)
    
    user_based = get_recommendations_for_user(user_id, 'user_based', 10) if user_id else []
    item_based = get_recommendations_for_user(user_id, 'item_based', 10) if user_id else []
    
    user_based_ids = {r['movie_id'] for r in user_based}
    item_based_ids = {r['movie_id'] for r in item_based}
    
    overlap = user_based_ids & item_based_ids
    
    # Calculate diversity score (genre coverage)
    def calc_diversity(recs):
        all_genres = set()
        for r in recs:
            all_genres.update(parse_genres(r.get('genres', [])))
        return len(all_genres) / 20  # Normalize to 0-1, assume max 20 genres
    
    # Convert to frontend component expected format
    return jsonify({
        'user_based': {
            'algorithm': 'user_based',
            'recommendations': [
                {
                    'movie_id': r['movie_id'],
                    'title': r['title'],
                    'poster_url': r.get('poster_url', ''),
                    'predicted_rating': r['predicted_rating']
                }
                for r in user_based
            ],
            'metrics': {
                'diversity': calc_diversity(user_based),
                'novelty': 0.7,  # Simulated value
                'coverage': 0.8   # Simulated value
            }
        },
        'item_based': {
            'algorithm': 'item_based',
            'recommendations': [
                {
                    'movie_id': r['movie_id'],
                    'title': r['title'],
                    'poster_url': r.get('poster_url', ''),
                    'predicted_rating': r['predicted_rating']
                }
                for r in item_based
            ],
            'metrics': {
                'diversity': calc_diversity(item_based),
                'novelty': 0.6,  # Simulated value
                'coverage': 0.85  # Simulated value
            }
        },
        'overlap': {
            'count': len(overlap),
            'percentage': round(len(overlap) / max(len(user_based_ids), len(item_based_ids)) * 100, 1) if user_based_ids or item_based_ids else 0
        }
    })

# -------------------- Evaluation and Visualization APIs --------------------

@app.route('/api/evaluation/summary')
def get_evaluation_summary():
    """Get evaluation summary"""
    summary = {
        'metrics': {
            'user_based': {
                'precision_at_10': 0.0,
                'recall_at_10': 0.0,
                'mae': 1.0786
            },
            'item_based': {
                'precision_at_10': 0.0,
                'recall_at_10': 0.0,
                'mae': 0.4410
            }
        },
        'data_stats': {
            'total_users': 6040,
            'total_movies': 3706,
            'total_ratings': 18119,
            'matrix_sparsity': 0.9998
        },
        'conclusion': 'Item-Based CF outperforms User-Based CF in rating prediction accuracy, MAE reduced by 59%'
    }
    return jsonify(summary)

@app.route('/api/evaluation/interactive')
def get_interactive_evaluation():
    """Get interactive evaluation data - match frontend component expected format"""
    eval_type = request.args.get('type', 'all')
    
    result = {}
    
    # Use test prediction data
    if data_store.test_predictions_cosine is not None:
        df = data_store.test_predictions_cosine
        
        # Calculate metrics
        mae = (df['actual_rating'] - df['item_based_pred']).abs().mean()
        rmse = np.sqrt(((df['actual_rating'] - df['item_based_pred']) ** 2).mean())
        
        # Build confusion matrix data (simplified version)
        # Use threshold 3.0 to divide ratings into positive and negative classes
        actual_positive = df['actual_rating'] >= 3.0
        predicted_positive = df['item_based_pred'] >= 3.0
        
        tp = ((actual_positive) & (predicted_positive)).sum()
        fp = ((~actual_positive) & (predicted_positive)).sum()
        tn = ((~actual_positive) & (~predicted_positive)).sum()
        fn = ((actual_positive) & (~predicted_positive)).sum()
        
        # Calculate precision, recall, etc.
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        # Error distribution
        errors = (df['actual_rating'] - df['item_based_pred']).abs()
        error_ranges = ['0-0.5', '0.5-1.0', '1.0-1.5', '1.5-2.0', '2.0+']
        error_counts = [
            ((errors >= 0) & (errors < 0.5)).sum(),
            ((errors >= 0.5) & (errors < 1.0)).sum(),
            ((errors >= 1.0) & (errors < 1.5)).sum(),
            ((errors >= 1.5) & (errors < 2.0)).sum(),
            (errors >= 2.0).sum()
        ]
        
        # ROC curve data (simplified version)
        roc_curve = []
        for threshold in np.linspace(0, 5, 11):
            pred_pos = df['item_based_pred'] >= threshold
            tpr = ((actual_positive) & (pred_pos)).sum() / actual_positive.sum() if actual_positive.sum() > 0 else 0
            fpr = ((~actual_positive) & (pred_pos)).sum() / (~actual_positive).sum() if (~actual_positive).sum() > 0 else 0
            roc_curve.append({'threshold': round(threshold, 1), 'tpr': round(tpr, 3), 'fpr': round(fpr, 3)})
        
        result = {
            'metrics': {
                'mae': round(mae, 4),
                'rmse': round(rmse, 4),
                'precision': round(precision, 4),
                'recall': round(recall, 4),
                'f1_score': round(f1, 4),
                'accuracy': round((tp + tn) / len(df), 4)
            },
            'confusion_matrix': {
                'true_positives': int(tp),
                'false_positives': int(fp),
                'true_negatives': int(tn),
                'false_negatives': int(fn)
            },
            'error_distribution': [
                {'error_range': error_ranges[i], 'count': int(error_counts[i])}
                for i in range(len(error_ranges))
            ],
            'roc_curve': roc_curve,
            'algorithm': 'item_based'
        }
    
    return jsonify(result)

@app.route('/api/evaluation/charts')
def get_evaluation_charts():
    """Get evaluation charts list"""
    charts = []
    
    # Charts from data and results folder
    data_result_dir = EVAL_DIR / "data_and_results"
    if data_result_dir.exists():
        for file in data_result_dir.glob("*.png"):
            charts.append({
                'name': file.stem,
                'path': f'/api/evaluation/chart/{file.name}',
                'category': 'Algorithm Evaluation'
            })
    
    # Visualization charts folder
    viz_dir = EVAL_DIR / "visualization_charts"
    if viz_dir.exists():
        for file in viz_dir.glob("*.png"):
            charts.append({
                'name': file.stem,
                'path': f'/api/evaluation/chart/viz/{file.name}',
                'category': 'Root Cause Analysis'
            })
    
    # Data preprocessing charts
    preprocess_dir = DATA_DIR
    if preprocess_dir.exists():
        for file in preprocess_dir.glob("*.png"):
            charts.append({
                'name': file.stem,
                'path': f'/api/evaluation/chart/preprocess/{file.name}',
                'category': 'Data Preprocessing'
            })
    
    return jsonify({'charts': charts})

@app.route('/api/evaluation/chart/<path:filename>')
def serve_chart(filename):
    """Serve chart file"""
    directory = EVAL_DIR / "data_and_results"
    return send_from_directory(directory, filename)

@app.route('/api/evaluation/chart/viz/<path:filename>')
def serve_viz_chart(filename):
    """Serve visualization chart file"""
    directory = EVAL_DIR / "visualization_charts"
    return send_from_directory(directory, filename)

@app.route('/api/evaluation/chart/preprocess/<path:filename>')
def serve_preprocess_chart(filename):
    """Serve preprocessing chart file"""
    return send_from_directory(DATA_DIR, filename)

# -------------------- Data Insights APIs --------------------

# -------------------- Static File Services --------------------

@app.route('/assets/<path:path>')
def serve_dist_assets(path):
    """Serve frontend built static assets"""
    dist_dir = BASE_DIR / "frontend_new" / "dist" / "assets"
    return send_from_directory(dist_dir, path)

@app.route('/assets/data/<path:filename>')
def serve_assets(filename):
    """Serve static asset files"""
    return send_from_directory(ASSETS_DIR / "data", filename)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    """Serve React frontend app"""
    dist_dir = BASE_DIR / "frontend_new" / "dist"
    
    # If requesting a file, try to serve that file
    if path:
        file_path = dist_dir / path
        if file_path.exists() and file_path.is_file():
            return send_from_directory(dist_dir, path)
    
    # Otherwise return index.html
    return send_from_directory(dist_dir, 'index.html')

# -------------------- Data Insights APIs --------------------

@app.route('/api/insights')
def get_data_insights():
    """Get data insights"""
    # Use expanded dataset
    movies = data_store.expanded_movies if data_store.expanded_movies else data_store.movies
    
    # Basic statistics
    total_movies = len(movies) if movies else 0
    total_users = len(data_store.enhanced_user_profiles) if data_store.enhanced_user_profiles else 0
    total_ratings = len(data_store.user_ratings) if data_store.user_ratings is not None else 0
    
    # Genre distribution
    genre_counts = {}
    for movie in movies:
        for genre in parse_genres(movie.get('genres', [])):
            genre_counts[genre] = genre_counts.get(genre, 0) + 1
    
    genre_distribution = [
        {'genre': genre, 'count': count, 'percentage': round(count / total_movies * 100, 1)}
        for genre, count in sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    
    # Rating distribution - use numeric format to match frontend component
    ratings = [m.get('vote_average') for m in movies if m.get('vote_average')]
    rating_buckets = {0.5: 0, 1.0: 0, 1.5: 0, 2.0: 0, 2.5: 0, 3.0: 0, 3.5: 0, 4.0: 0, 4.5: 0, 5.0: 0}
    for r in ratings:
        # Convert 10-point scale to 5-point scale
        r_5 = r / 2
        # Find closest 0.5 bucket
        bucket = round(r_5 * 2) / 2
        bucket = max(0.5, min(5.0, bucket))
        if bucket in rating_buckets:
            rating_buckets[bucket] += 1
    
    rating_distribution = [
        {'rating': k, 'count': v}
        for k, v in sorted(rating_buckets.items())
    ]
    
    # Year trend - use year format to match frontend component
    years = [m.get('release_year') for m in movies if m.get('release_year')]
    year_counts = {}
    for y in years:
        year_counts[y] = year_counts.get(y, 0) + 1
    
    # Get year distribution, sorted by year
    year_trend = [
        {'year': year, 'movie_count': count}
        for year, count in sorted(year_counts.items())
    ]
    
    # Top 10 high-rated movies - match frontend component format
    top_movies = sorted(
        [m for m in movies if m.get('vote_average')],
        key=lambda x: x.get('vote_average', 0),
        reverse=True
    )[:10]
    
    top_movies_list = [
        {
            'movie_id': m.get('id'),
            'title': m.get('title'),
            'poster_url': m.get('poster_url') or f"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=300&fit=crop",
            'rating': m.get('vote_average'),
            'rating_count': m.get('vote_count', 0)
        }
        for m in top_movies
    ]
    
    return jsonify({
        'stats': {
            'total_movies': total_movies,
            'total_users': total_users,
            'total_ratings': total_ratings,
            'avg_rating': round(np.mean(ratings), 2) if ratings else 0,
            'rating_coverage': round(len(ratings) / total_movies * 100, 1) if total_movies else 0
        },
        'genre_distribution': genre_distribution,
        'rating_distribution': rating_distribution,
        'year_trend': year_trend,
        'top_movies': top_movies_list
    })

# -------------------- Project Timeline APIs --------------------

@app.route('/api/timeline')
def get_project_timeline():
    """Project Timeline - Movie Recommendation System"""
    timeline = [
        {
            'id': 'phase-1',
            'phase': 'Phase 1',
            'title': 'Data Preparation & Preprocessing',
            'start_date': '2026-03-01',
            'end_date': '2026-03-16',
            'status': 'completed',
            'description': 'Downloaded movie recommendation dataset from Kaggle, completed data cleaning, EDA analysis, feature engineering and data splitting. Handled missing ratings, filtered low-activity users and niche movies, constructed user-movie rating sparse matrix.',
            'deliverables': [
                'Kaggle dataset download & local backup',
                'Data cleaning: missing value handling, duplicate removal',
                'EDA analysis: rating distribution, user activity, movie popularity',
                'User-movie rating sparse matrix construction',
                'Train/Test set 8:2 split',
                'cleaned_movies.csv, train_ratings.csv, test_ratings.csv'
            ],
            'team_size': 1,
            'icon': 'database'
        },
        {
            'id': 'phase-2a',
            'phase': 'Phase 2A',
            'title': 'User-Based Collaborative Filtering',
            'start_date': '2026-03-16',
            'end_date': '2026-03-19',
            'status': 'completed',
            'description': 'Implemented user similarity calculation (Cosine Similarity / Pearson Correlation), supporting Top-N similar user selection. Generated Top-K movie recommendations based on weighted average of similar user ratings, optimized sparse matrix computation efficiency.',
            'deliverables': [
                'User similarity calculation module (Cosine/Pearson)',
                'Top-N similar user selection algorithm',
                'User-Based CF core recommendation algorithm',
                'Sparse matrix computation optimization',
                'user_based_cf.py complete code',
                'User-Based recommendation results CSV'
            ],
            'team_size': 1,
            'icon': 'users'
        },
        {
            'id': 'phase-2b',
            'phase': 'Phase 2B',
            'title': 'Item-Based Collaborative Filtering',
            'start_date': '2026-03-16',
            'end_date': '2026-03-19',
            'status': 'completed',
            'description': 'Implemented movie similarity calculation (Cosine/Pearson based on co-rated users), supporting Top-N similar movie selection. Generated Top-K recommendations based on similarity of user-rated movies, ensured reproducible code logic.',
            'deliverables': [
                'Movie similarity calculation module (Cosine/Pearson)',
                'Top-N similar movie selection algorithm',
                'Item-Based CF core recommendation algorithm',
                'Similarity matrix storage & loading',
                'item_based_cf.py complete code',
                'Item-Based recommendation results CSV'
            ],
            'team_size': 1,
            'icon': 'film'
        },
        {
            'id': 'phase-2c',
            'phase': 'Phase 2C',
            'title': 'Z-Score Standardization Optimization',
            'start_date': '2026-03-19',
            'end_date': '2026-03-20',
            'status': 'completed',
            'description': 'Implemented z-score standardization to address rating bias issues. Normalized user ratings by subtracting user mean and dividing by standard deviation, then applied inverse transformation after prediction. Significantly improved MAE metrics for both User-Based and Item-Based CF.',
            'deliverables': [
                'Z-score standardization implementation',
                'User-Based CF with z-score optimization',
                'Item-Based CF with z-score optimization',
                'MAE comparison: Original vs Z-Score',
                'zscore_comparison_chart.png visualization',
                'Performance analysis report'
            ],
            'team_size': 1,
            'icon': 'zap'
        },
        {
            'id': 'phase-3',
            'phase': 'Phase 3',
            'title': 'Algorithm Evaluation & Visualization',
            'start_date': '2026-03-19',
            'end_date': '2026-03-21',
            'status': 'completed',
            'description': 'Loaded recommendation results from both collaborative filtering algorithms and test set ground truth, calculated core evaluation metrics including Precision@K, Recall@K, MAE. Created comparison charts, analyzed model performance and causes of poor recommendations (matrix sparsity, cold start problem).',
            'deliverables': [
                'Precision@K, Recall@K metrics calculation',
                'MAE rating prediction error analysis',
                'Precision@K/Recall@K comparison curves',
                'Algorithm error distribution histogram',
                'Recommendation results visualization',
                'Algorithm comparison analysis report',
                'Matrix sparsity / cold start problem analysis'
            ],
            'team_size': 2,
            'icon': 'chart'
        },
        {
            'id': 'phase-4',
            'phase': 'Phase 4',
            'title': 'Report Writing & GitHub Management',
            'start_date': '2026-03-22',
            'end_date': '2026-03-24',
            'status': 'completed',
            'description': 'Wrote complete technical report according to course assignment requirements, including team information, problem statement, dataset introduction, EDA analysis, preprocessing methods, algorithm validation, evaluation results, limitations and future work. Integrated materials from all teams, unified formatting, ensured clear charts and proper references.',
            'deliverables': [
                'Complete technical report (with charts, code explanation)',
                'Team information & problem statement',
                'Dataset introduction & EDA analysis',
                'Preprocessing & methodology explanation',
                'Validation & evaluation results',
                'Limitations & future work',
                'References organization',
                'GitHub repository management',
                'Report review & final submission'
            ],
            'team_size': 1,
            'icon': 'file'
        },
        {
            'id': 'phase-5',
            'phase': 'Phase 5',
            'title': 'PPT Creation & Presentation Preparation',
            'start_date': '2026-03-25',
            'end_date': '2026-03-27',
            'status': 'completed',
            'description': 'Collected materials from all teams (data processing flowcharts, algorithm principle diagrams, code snippets, evaluation visualization charts, analysis conclusions, etc.), designed 15-20 page PPT including background, problem description, dataset, methodology, experimental results, model analysis, limitations and conclusions. Organized team rehearsals.',
            'deliverables': [
                'PPT structure design (15-20 pages)',
                'Background & problem description',
                'Dataset introduction & EDA presentation',
                'Methodology flow & algorithm principles',
                'Experimental results & visualization charts',
                'Model analysis & conclusions',
                'Limitations & future work',
                'Team rehearsal & feedback revision',
                'PPT finalization & upload',
                'GitHub sync confirmation'
            ],
            'team_size': 1,
            'icon': 'presentation'
        },
        {
            'id': 'phase-6',
            'phase': 'Phase 6',
            'title': 'Full-Stack Web Development & Deployment',
            'start_date': '2026-03-27',
            'end_date': '2026-03-28',
            'status': 'completed',
            'description': 'Built complete movie recommendation system website with Flask backend and React frontend. Implemented user profile visualization, algorithm comparison, interactive evaluation dashboard, data insights, project timeline display. Enhanced user data (1000 user profiles), expanded movie database to 500 films.',
            'deliverables': [
                'Flask backend API service',
                'React + TypeScript + Tailwind frontend',
                'User profile visualization (radar chart, rating distribution)',
                'Algorithm comparison & explanation features',
                'Interactive evaluation dashboard',
                'Data insights & statistical visualization',
                'Project timeline display',
                '1000 enhanced user profile dataset',
                '500 movies expanded database',
                'User similarity social network'
            ],
            'team_size': 1,
            'icon': 'rocket'
        }
    ]
    
    return jsonify({'phases': timeline, 'total_phases': len(timeline), 'completed_phases': len([p for p in timeline if p['status'] == 'completed'])})


# ==================== Start Service ====================

if __name__ == "__main__":
    # Load data
    data_store.load_all()
    
    print("\n" + "="*60)
    print("🎬 MovieRec - Movie Recommendation System API")
    print("="*60)
    print(f"Server: http://127.0.0.1:8080")
    print(f"Frontend: http://127.0.0.1:8080/")
    print(f"="*60 + "\n")
    
    app.run(debug=False, host="0.0.0.0", port=8080)

