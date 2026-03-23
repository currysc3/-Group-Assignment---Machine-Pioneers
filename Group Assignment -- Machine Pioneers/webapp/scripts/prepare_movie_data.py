#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Movie data preparation script
Features:
1. Extract movies suitable for display from cleaned_movies.csv
2. Fetch movie poster URLs and additional info via TMDB API
3. Generate JSON data files for website display

Usage:
1. Get API Key from TMDB: https://www.themoviedb.org/settings/api
2. Fill in the API Key in config.py
3. Run script: python prepare_movie_data.py
"""

import pandas as pd
import json
import requests
import time
import os
import sys
from pathlib import Path

# PROXIES imported from config.py

# Add parent directory to path to import config
sys.path.insert(0, str(Path(__file__).parent))
try:
    from config import TMDB_API_KEY, PROXIES
except ImportError:
    print("Error: Please create config.py and set TMDB_API_KEY")
    print("Example: TMDB_API_KEY = 'your_api_key_here'")
    sys.exit(1)

# Configuration
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"
POSTER_SIZE = "w500"  # Options: w92, w154, w185, w342, w500, w780, original

# Path configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "数据预处理-核心代码+csv文件+分布图+说明"
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "data"
POSTER_DIR = Path(__file__).parent.parent / "assets" / "posters"

# Ensure output directories exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
POSTER_DIR.mkdir(parents=True, exist_ok=True)


def search_movie_tmdb(title, year=None):
    """
    Search for movie via TMDB API
    
    Args:
        title: Movie title
        year: Release year (optional)
    
    Returns:
        dict: Dictionary containing movie info, or None if not found
    """
    url = f"{TMDB_BASE_URL}/search/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "query": title,
        "language": "zh-CN",  # Get Chinese info
        "include_adult": "false"
    }
    if year:
        params["year"] = year
    
    try:
        response = requests.get(url, params=params, timeout=10, proxies=PROXIES)
        response.raise_for_status()
        data = response.json()
        
        if data["results"]:
            # Return first matching result
            return data["results"][0]
        return None
    except Exception as e:
        print(f"  Search failed '{title}': {e}")
        return None


def get_movie_details_tmdb(tmdb_id):
    """
    Get detailed movie information
    
    Args:
        tmdb_id: TMDB movie ID
    
    Returns:
        dict: Dictionary containing detailed movie info
    """
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
    params = {
        "api_key": TMDB_API_KEY,
        "language": "zh-CN",
        "append_to_response": "credits"  # Include cast and director info
    }
    
    try:
        response = requests.get(url, params=params, timeout=10, proxies=PROXIES)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"  Failed to get details for ID {tmdb_id}: {e}")
        return None


def download_poster(poster_path, movie_id):
    """
    Download movie poster
    
    Args:
        poster_path: TMDB poster path (e.g., /abc123.jpg)
        movie_id: Local movie ID (for filename)
    
    Returns:
        str: Local file path, or None if download failed
    """
    if not poster_path:
        return None
    
    # Build full URL
    poster_url = f"{TMDB_IMAGE_BASE_URL}/{POSTER_SIZE}{poster_path}"
    
    # Local file path
    local_path = POSTER_DIR / f"{movie_id}.jpg"
    
    # Skip if already exists
    if local_path.exists():
        return str(local_path.relative_to(Path(__file__).parent.parent))
    
    try:
        response = requests.get(poster_url, timeout=30, proxies=PROXIES)
        
        with open(local_path, 'wb') as f:
            f.write(response.content)
        
        return str(local_path.relative_to(Path(__file__).parent.parent))
    except Exception as e:
        print(f"  Failed to download poster: {e}")
        return None


def extract_director(details):
    """Extract director from movie details"""
    if 'credits' in details and 'crew' in details['credits']:
        for person in details['credits']['crew']:
            if person.get('job') == 'Director':
                return person.get('name', '')
    return ''


def extract_cast(details, limit=5):
    """Extract main cast from movie details"""
    cast = []
    if 'credits' in details and 'cast' in details['credits']:
        for person in details['credits']['cast'][:limit]:
            cast.append(person.get('name', ''))
    return cast


def select_movies_for_display(movies_df, max_movies=100):
    """
    Select movies suitable for display
    Strategy: Prioritize popular movies with many ratings and high scores
    
    Args:
        movies_df: Movie DataFrame
        max_movies: Maximum number to select
    
    Returns:
        DataFrame: Filtered movies
    """
    print(f"Original movie count: {len(movies_df)}")
    
    # Sort by rating count (assuming vote_count column exists)
    if 'vote_count' in movies_df.columns:
        # Filter out movies with too few ratings
        filtered = movies_df[movies_df['vote_count'] >= 100].copy()
        # Sort by weighted score of rating count and rating
        filtered['score'] = filtered['vote_average'] * filtered['vote_count'] / 1000
        selected = filtered.nlargest(max_movies, 'score')
    else:
        # If no vote_count, sort by rating
        selected = movies_df.nlargest(max_movies, 'vote_average')
    
    print(f"Selected movies for display: {len(selected)}")
    return selected


def prepare_movie_data(max_movies=100, download_posters_flag=True):
    """
    Main function: Prepare movie data
    
    Args:
        max_movies: Maximum number of movies to process
        download_posters_flag: Whether to download posters
    """
    # 1. Read cleaned movie data
    print("=" * 60)
    print("Step 1: Read movie data")
    print("=" * 60)
    
    movies_file = DATA_DIR / "cleaned_movies.csv"
    if not movies_file.exists():
        print(f"Error: File not found {movies_file}")
        return
    
    movies_df = pd.read_csv(movies_file)
    print(f"Successfully read {len(movies_df)} movies")
    
    # 2. Select movies for display
    print("\n" + "=" * 60)
    print("Step 2: Select movies for display")
    print("=" * 60)
    
    selected_movies = select_movies_for_display(movies_df, max_movies)
    
    # 3. Fetch info via TMDB API
    print("\n" + "=" * 60)
    print("Step 3: Fetch movie info via TMDB API")
    print("=" * 60)
    
    movie_data_list = []
    success_count = 0
    fail_count = 0
    
    for idx, (_, movie) in enumerate(selected_movies.iterrows(), 1):
        movie_id = movie['id']
        title = movie['title']
        year = movie.get('release_year')
        
        print(f"\n[{idx}/{len(selected_movies)}] Processing: {title} ({year})")
        
        # Search TMDB
        search_result = search_movie_tmdb(title, year)
        
        if not search_result:
            print(f"  TMDB info not found, using local data")
            # Use local data
            movie_data = {
                "id": int(movie_id),
                "title": title,
                "original_title": movie.get('original_title', title),
                "release_year": int(year) if pd.notna(year) else None,
                "vote_average": float(movie['vote_average']) if pd.notna(movie['vote_average']) else None,
                "genres": eval(movie['genres']) if isinstance(movie['genres'], str) and movie['genres'].startswith('[') else movie['genres'],
                "cast": eval(movie['cast']) if isinstance(movie['cast'], str) and movie['cast'].startswith('[') else [],
                "director": movie.get('director', ''),
                "overview": movie.get('content', ''),
                "poster_url": None,
                "poster_local": None,
                "tmdb_id": None
            }
            fail_count += 1
        else:
            tmdb_id = search_result['id']
            print(f"  Found TMDB ID: {tmdb_id}")
            
            # Get detailed info
            details = get_movie_details_tmdb(tmdb_id)
            
            if details:
                # Download poster
                poster_local = None
                if download_posters_flag and search_result.get('poster_path'):
                    print(f"  Downloading poster...")
                    poster_local = download_poster(search_result['poster_path'], movie_id)
                
                # Build movie data
                movie_data = {
                    "id": int(movie_id),
                    "title": details.get('title') or title,
                    "original_title": details.get('original_title') or movie.get('original_title', title),
                    "release_year": int(year) if pd.notna(year) else (int(details['release_date'][:4]) if details.get('release_date') else None),
                    "vote_average": float(movie['vote_average']) if pd.notna(movie['vote_average']) else details.get('vote_average'),
                    "genres": [g['name'] for g in details.get('genres', [])] or (eval(movie['genres']) if isinstance(movie['genres'], str) and movie['genres'].startswith('[') else []),
                    "cast": extract_cast(details, 5),
                    "director": extract_director(details) or movie.get('director', ''),
                    "overview": details.get('overview') or movie.get('content', ''),
                    "poster_url": f"{TMDB_IMAGE_BASE_URL}/{POSTER_SIZE}{search_result['poster_path']}" if search_result.get('poster_path') else None,
                    "poster_local": poster_local,
                    "tmdb_id": tmdb_id,
                    "runtime": details.get('runtime'),
                    "tagline": details.get('tagline', '')
                }
                success_count += 1
            else:
                # Use basic info from search result
                movie_data = {
                    "id": int(movie_id),
                    "title": search_result.get('title') or title,
                    "original_title": search_result.get('original_title') or movie.get('original_title', title),
                    "release_year": int(year) if pd.notna(year) else (int(search_result['release_date'][:4]) if search_result.get('release_date') else None),
                    "vote_average": float(movie['vote_average']) if pd.notna(movie['vote_average']) else search_result.get('vote_average'),
                    "genres": eval(movie['genres']) if isinstance(movie['genres'], str) and movie['genres'].startswith('[') else [],
                    "cast": [],
                    "director": movie.get('director', ''),
                    "overview": search_result.get('overview') or movie.get('content', ''),
                    "poster_url": f"{TMDB_IMAGE_BASE_URL}/{POSTER_SIZE}{search_result['poster_path']}" if search_result.get('poster_path') else None,
                    "poster_local": download_poster(search_result.get('poster_path'), movie_id) if download_posters_flag else None,
                    "tmdb_id": tmdb_id
                }
                success_count += 1
        
        movie_data_list.append(movie_data)
        
        # Avoid making requests too fast
        time.sleep(0.25)
    
    # 4. Save data
    print("\n" + "=" * 60)
    print("Step 4: Save data")
    print("=" * 60)
    
    # Save as JSON
    output_file = OUTPUT_DIR / "movies_display.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({"movies": movie_data_list}, f, ensure_ascii=False, indent=2)
    print(f"Saved movie data: {output_file}")
    
    # Also save as CSV (for easy viewing)
    output_csv = OUTPUT_DIR / "movies_display.csv"
    df = pd.DataFrame(movie_data_list)
    # Convert lists to strings for CSV storage
    df['genres'] = df['genres'].apply(lambda x: ', '.join(x) if isinstance(x, list) else x)
    df['cast'] = df['cast'].apply(lambda x: ', '.join(x) if isinstance(x, list) else x)
    df.to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f"Saved CSV file: {output_csv}")
    
    # 5. Generate statistics
    print("\n" + "=" * 60)
    print("Processing statistics")
    print("=" * 60)
    print(f"Successfully fetched TMDB info: {success_count} movies")
    print(f"Using local data: {fail_count} movies")
    print(f"Posters downloaded: {sum(1 for m in movie_data_list if m.get('poster_local'))} images")
    print(f"Poster save path: {POSTER_DIR}")
    
    print("\n✅ Data preparation complete!")
    print(f"\nYou can find the prepared data at:")
    print(f"  - JSON data: {output_file}")
    print(f"  - CSV data: {output_csv}")
    print(f"  - Poster folder: {POSTER_DIR}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Prepare movie display data')
    parser.add_argument('--max-movies', type=int, default=100,
                        help='Maximum number of movies to process (default: 100)')
    parser.add_argument('--no-download-posters', action='store_true',
                        help='Do not download posters, only fetch URLs')
    
    args = parser.parse_args()
    
    prepare_movie_data(
        max_movies=args.max_movies,
        download_posters_flag=not args.no_download_posters
    )
