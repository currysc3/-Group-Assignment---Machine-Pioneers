#!/usr/bin/env python3
"""
Fetch English version movie posters from TMDB
Requires TMDB API Key, available at https://www.themoviedb.org/settings/api
"""

import requests
import json
import os
import time
from pathlib import Path

# Configuration
TMDB_API_KEY = "6100318fc3de0fae20545ed9464a64a3"
BASE_DIR = Path(__file__).parent.parent
ASSETS_DIR = BASE_DIR / "assets"
POSTERS_DIR = ASSETS_DIR / "posters"
DATA_DIR = ASSETS_DIR / "data"

# TMDB API configuration
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

def get_movie_details(tmdb_id):
    """Get movie details (English)"""
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
    params = {
        "api_key": TMDB_API_KEY,
        "language": "en-US"  # Force English
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"  Error: Status {response.status_code}")
            return None
    except Exception as e:
        print(f"  Error: {e}")
        return None

def download_poster(tmdb_id, poster_path, output_path):
    """Download poster image"""
    if not poster_path:
        return False
    
    url = f"{TMDB_IMAGE_BASE_URL}{poster_path}"
    
    try:
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                f.write(response.content)
            return True
        return False
    except Exception as e:
        print(f"  Download error: {e}")
        return False

def fetch_english_posters():
    """Fetch English posters for all movies"""
    
    # Read movie data
    movies_file = DATA_DIR / "movies_display.json"
    if not movies_file.exists():
        print(f"Error: Movie data file not found {movies_file}")
        return
    
    with open(movies_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        movies = data.get('movies', [])
    
    print(f"Starting to fetch English posters for {len(movies)} movies...\n")
    
    success_count = 0
    failed_count = 0
    
    for i, movie in enumerate(movies):
        movie_id = movie.get('id')
        tmdb_id = movie.get('tmdb_id', movie_id)
        title = movie.get('title', 'Unknown')
        
        print(f"[{i+1}/{len(movies)}] {title} (TMDB: {tmdb_id})")
        
        # Get movie details
        details = get_movie_details(tmdb_id)
        if not details:
            failed_count += 1
            continue
        
        poster_path = details.get('poster_path')
        if not poster_path:
            print(f"  No poster available")
            failed_count += 1
            continue
        
        # Download poster
        output_file = POSTERS_DIR / f"{movie_id}.jpg"
        if download_poster(tmdb_id, poster_path, output_file):
            print(f"  ✓ Downloaded English poster")
            success_count += 1
        else:
            print(f"  ✗ Download failed")
            failed_count += 1
        
        # Avoid making requests too fast
        time.sleep(0.5)
    
    print(f"\nComplete! Success: {success_count}, Failed: {failed_count}")

if __name__ == "__main__":
    fetch_english_posters()
