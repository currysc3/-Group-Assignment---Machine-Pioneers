#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Movie data preparation script - Offline version (no TMDB API required)
Features:
1. Extract movies suitable for display from cleaned_movies.csv
2. Generate JSON data files for website display using local data
3. Posters can use local placeholder images or be added manually later

Usage:
python prepare_movie_data_offline.py
"""

import pandas as pd
import json
import ast
from pathlib import Path

# Path configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "数据预处理-核心代码+csv文件+分布图+说明"
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "data"
POSTER_DIR = Path(__file__).parent.parent / "assets" / "posters"

# Ensure output directories exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
POSTER_DIR.mkdir(parents=True, exist_ok=True)


def safe_eval(val):
    """Safely parse string to Python object"""
    if pd.isna(val):
        return []
    if isinstance(val, str):
        try:
            return ast.literal_eval(val)
        except:
            return [val]
    return val


def select_movies_for_display(movies_df, max_movies=100):
    """
    Select movies suitable for display
    Strategy: Prioritize popular movies with many ratings and high scores
    """
    print(f"Original movie count: {len(movies_df)}")
    
    # Sort by rating count
    if 'vote_count' in movies_df.columns:
        filtered = movies_df[movies_df['vote_count'] >= 100].copy()
        filtered['score'] = filtered['vote_average'] * filtered['vote_count'] / 1000
        selected = filtered.nlargest(max_movies, 'score')
    else:
        selected = movies_df.nlargest(max_movies, 'vote_average')
    
    print(f"Selected movies for display: {len(selected)}")
    return selected


def prepare_movie_data_offline(max_movies=100):
    """
    Main function: Prepare movie data (offline version)
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
    
    # 3. Process movie data
    print("\n" + "=" * 60)
    print("Step 3: Process movie data")
    print("=" * 60)
    
    movie_data_list = []
    
    for idx, (_, movie) in enumerate(selected_movies.iterrows(), 1):
        movie_id = movie['id']
        title = movie['title']
        year = movie.get('release_year')
        
        print(f"[{idx}/{len(selected_movies)}] Processing: {title} ({year})")
        
        # Parse genres
        genres = safe_eval(movie.get('genres', []))
        if isinstance(genres, list):
            genres = [g.strip() for g in genres if g]
        
        # Parse cast
        cast = safe_eval(movie.get('cast', []))
        if isinstance(cast, list):
            cast = [c.strip() for c in cast if c][:5]  # Only take first 5 actors
        
        # Build movie data
        movie_data = {
            "id": int(movie_id),
            "title": title,
            "original_title": movie.get('original_title', title),
            "release_year": int(year) if pd.notna(year) else None,
            "vote_average": float(movie['vote_average']) if pd.notna(movie['vote_average']) else None,
            "vote_count": int(movie['vote_count']) if pd.notna(movie.get('vote_count')) else None,
            "genres": genres,
            "cast": cast,
            "director": movie.get('director', ''),
            "overview": movie.get('content', ''),
            "poster_url": None,  # Offline version: no poster URL
            "poster_local": None,  # Offline version: no local poster
            "tmdb_id": None,
            "runtime": None,
            "tagline": ""
        }
        
        movie_data_list.append(movie_data)
    
    # 4. Save data
    print("\n" + "=" * 60)
    print("Step 4: Save data")
    print("=" * 60)
    
    # Save as JSON
    output_file = OUTPUT_DIR / "movies_display.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({"movies": movie_data_list}, f, ensure_ascii=False, indent=2)
    print(f"Saved movie data: {output_file}")
    
    # Also save as CSV
    output_csv = OUTPUT_DIR / "movies_display.csv"
    df = pd.DataFrame(movie_data_list)
    df['genres'] = df['genres'].apply(lambda x: ', '.join(x) if isinstance(x, list) else x)
    df['cast'] = df['cast'].apply(lambda x: ', '.join(x) if isinstance(x, list) else x)
    df.to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f"Saved CSV file: {output_csv}")
    
    # 5. Generate statistics
    print("\n" + "=" * 60)
    print("Processing statistics")
    print("=" * 60)
    print(f"Successfully processed: {len(movie_data_list)} movies")
    print(f"\n⚠️  Note: This is the offline version, poster info is empty")
    print(f"   To get posters, please:")
    print(f"   1. Use VPN/proxy to access TMDB API")
    print(f"   2. Run prepare_movie_data.py script")
    print(f"   3. Or manually download posters to {POSTER_DIR} folder")
    
    print("\n✅ Data preparation complete!")
    print(f"\nYou can find the prepared data at:")
    print(f"  - JSON data: {output_file}")
    print(f"  - CSV data: {output_csv}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Prepare movie display data (offline version)')
    parser.add_argument('--max-movies', type=int, default=100,
                        help='Maximum number of movies to process (default: 100)')
    
    args = parser.parse_args()
    
    prepare_movie_data_offline(max_movies=args.max_movies)
