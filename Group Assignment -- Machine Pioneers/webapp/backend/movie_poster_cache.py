#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Movie Poster Cache Management
Fetch movie poster URLs via TMDB API
"""

import json
import os
from pathlib import Path

# TMDB image base URL
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"
POSTER_SIZE = "w500"

class MoviePosterCache:
    """Movie poster cache class"""
    
    def __init__(self):
        self.cache_file = Path(__file__).parent / "poster_cache.json"
        self.cache = {}
        self.movies_data = {}
        self.load_cache()
        self.load_movies_data()
    
    def load_cache(self):
        """Load cache"""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    self.cache = json.load(f)
                print(f"✓ Loaded {len(self.cache)} poster cache entries")
            except Exception as e:
                print(f"⚠️  Failed to load cache: {e}")
                self.cache = {}
        else:
            self.cache = {}
    
    def save_cache(self):
        """Save cache"""
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"⚠️  Failed to save cache: {e}")
    
    def load_movies_data(self):
        """Load movie data (for finding posters)"""
        # Load cleaned_movies.csv to get movie information
        try:
            import pandas as pd
            data_dir = Path(__file__).parent.parent.parent / "数据预处理-核心代码+csv文件+分布图+说明"
            movies_file = data_dir / "cleaned_movies.csv"
            
            if movies_file.exists():
                df = pd.read_csv(movies_file)
                for _, row in df.iterrows():
                    self.movies_data[int(row['id'])] = {
                        'title': row.get('title', ''),
                        'original_title': row.get('original_title', ''),
                        'release_year': row.get('release_year')
                    }
                print(f"✓ Loaded {len(self.movies_data)} movie base data entries")
        except Exception as e:
            print(f"⚠️  Failed to load movie data: {e}")
    
    def get_poster_url(self, movie_id, title=None):
        """
        Get movie poster URL
        
        Priority:
        1. Locally cached TMDB URL
        2. Poster URL from movies_display.json
        3. Build TMDB search URL (fallback)
        """
        movie_id = int(movie_id)
        
        # 1. Check cache
        cache_key = str(movie_id)
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # 2. Check movies_display.json
        try:
            assets_dir = Path(__file__).parent.parent / "assets" / "data"
            movies_file = assets_dir / "movies_display.json"
            if movies_file.exists():
                with open(movies_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for movie in data.get('movies', []):
                        if movie['id'] == movie_id and movie.get('poster_url'):
                            self.cache[cache_key] = movie['poster_url']
                            self.save_cache()
                            return movie['poster_url']
        except Exception:
            pass
        
        # 3. Return None, let frontend use placeholder
        return None
    
    def get_poster_url_or_placeholder(self, movie_id, title=None):
        """Get poster URL or return placeholder URL"""
        url = self.get_poster_url(movie_id, title)
        if url:
            return url
        
        # Use Unsplash movie-related placeholder (more aesthetically pleasing)
        # Select different images based on movie_id to ensure the same movie always displays the same image
        image_keywords = [
            "movie,cinema,film",
            "movie,theater,popcorn",
            "film,camera,action",
            "cinema,screen,dark",
            "movie,poster,art",
            "film,reel,vintage",
            "cinema,seats,empty",
            "movie,night,entertainment",
            "film,light,projection",
            "cinema,audience,watching"
        ]
        keyword_idx = movie_id % len(image_keywords)
        keyword = image_keywords[keyword_idx]
        
        # Use Unsplash Source to get random images
        return f"https://source.unsplash.com/300x450/?{keyword}"

# Global cache instance
poster_cache = MoviePosterCache()
