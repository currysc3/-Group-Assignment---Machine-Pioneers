#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch TMDB poster URLs for movies in recommendation data

Usage:
    python fetch_posters_for_recommendations.py

Description:
    This script reads movies from recommendation data, fetches poster URLs via TMDB API,
    and saves them to a cache file for backend use.
"""

import pandas as pd
import json
import requests
import time
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
from movie_poster_cache import poster_cache, TMDB_IMAGE_BASE_URL, POSTER_SIZE

# Configuration
TMDB_BASE_URL = "https://api.themoviedb.org/3"

try:
    from config import TMDB_API_KEY
except ImportError:
    print("Error: Please set TMDB_API_KEY in config.py")
    print("Example: TMDB_API_KEY = 'your_api_key_here'")
    sys.exit(1)

# Path configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
CF_DIR = PROJECT_ROOT / "协同过滤算法-核心代码+推荐结果+说明"

def search_movie_tmdb(title, year=None):
    """Search for movie via TMDB API"""
    url = f"{TMDB_BASE_URL}/search/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "query": title,
        "language": "zh-CN",
        "include_adult": "false"
    }
    if year:
        params["year"] = year
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data["results"]:
            return data["results"][0]
        return None
    except Exception as e:
        print(f"  Search failed '{title}': {e}")
        return None

def fetch_posters_for_recommendations():
    """Fetch posters for movies in recommendation data"""
    print("=" * 60)
    print("Fetching poster URLs for recommended movies")
    print("=" * 60)
    
    # Read recommendation data
    ub_file = CF_DIR / "user_based_recommendations_k10_cosine.csv"
    ib_file = CF_DIR / "item_based_recommendations_k10_cosine.csv"
    
    all_movie_ids = set()
    movie_titles = {}
    
    if ub_file.exists():
        df = pd.read_csv(ub_file)
        all_movie_ids.update(df['movie_id'].unique())
        for _, row in df.iterrows():
            movie_titles[int(row['movie_id'])] = row.get('title', '')
    
    if ib_file.exists():
        df = pd.read_csv(ib_file)
        all_movie_ids.update(df['movie_id'].unique())
        for _, row in df.iterrows():
            movie_titles[int(row['movie_id'])] = row.get('title', '')
    
    print(f"\nFound {len(all_movie_ids)} recommended movies")
    
    # Filter out movies already in cache
    missing_movies = []
    for movie_id in all_movie_ids:
        if str(movie_id) not in poster_cache.cache:
            missing_movies.append((movie_id, movie_titles.get(movie_id, '')))
    
    print(f"Need to fetch posters: {len(missing_movies)} movies")
    print(f"Already cached: {len(all_movie_ids) - len(missing_movies)} movies\n")
    
    if not missing_movies:
        print("✓ All movie posters are cached")
        return
    
    # Fetch posters
    success_count = 0
    fail_count = 0
    
    for idx, (movie_id, title) in enumerate(missing_movies, 1):
        print(f"[{idx}/{len(missing_movies)}] Searching: {title} (ID: {movie_id})")
        
        # Search TMDB
        result = search_movie_tmdb(title)
        
        if result and result.get('poster_path'):
            poster_url = f"{TMDB_IMAGE_BASE_URL}/{POSTER_SIZE}{result['poster_path']}"
            poster_cache.cache[str(movie_id)] = poster_url
            print(f"  ✓ Found poster: {poster_url[:60]}...")
            success_count += 1
        else:
            print(f"  ✗ Poster not found")
            fail_count += 1
        
        # Avoid making requests too fast
        time.sleep(0.25)
    
    # Save cache
    poster_cache.save_cache()
    
    print("\n" + "=" * 60)
    print("Processing complete")
    print("=" * 60)
    print(f"Success: {success_count} movies")
    print(f"Failed: {fail_count} movies")
    print(f"Total cached: {len(poster_cache.cache)} movies")

if __name__ == "__main__":
    fetch_posters_for_recommendations()
