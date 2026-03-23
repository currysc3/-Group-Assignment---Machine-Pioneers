#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Movie Poster Cache - Simplified Version
Uses fixed TMDB poster URL mappings
"""

import json
from pathlib import Path

# Poster URL mappings for some common movies (real URLs from TMDB)
POSTER_URLS = {
    # Map movie titles to Unsplash related images
    "default": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop",
    "action": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    "drama": "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop",
    "comedy": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&h=450&fit=crop",
    "horror": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=300&h=450&fit=crop",
    "sci-fi": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=450&fit=crop",
    "romance": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=450&fit=crop",
    "thriller": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop",
    "animation": "https://images.unsplash.com/photo-1535572290543-960a8046f5af?w=300&h=450&fit=crop",
    "documentary": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=300&h=450&fit=crop",
}

def get_poster_url(movie_id, title=None, genres=None):
    """
    Return appropriate poster URL based on movie information
    
    Strategy:
    1. Select related theme images based on genre
    2. Use movie_id to ensure the same movie always returns the same image
    """
    if genres and len(genres) > 0:
        genre = genres[0].lower()
        if 'action' in genre:
            return POSTER_URLS["action"]
        elif 'drama' in genre:
            return POSTER_URLS["drama"]
        elif 'comedy' in genre:
            return POSTER_URLS["comedy"]
        elif 'horror' in genre:
            return POSTER_URLS["horror"]
        elif 'science' in genre or 'sci-fi' in genre:
            return POSTER_URLS["sci-fi"]
        elif 'romance' in genre:
            return POSTER_URLS["romance"]
        elif 'thriller' in genre:
            return POSTER_URLS["thriller"]
        elif 'animation' in genre:
            return POSTER_URLS["animation"]
        elif 'documentary' in genre:
            return POSTER_URLS["documentary"]
    
    # Select different default images based on movie_id
    urls = list(POSTER_URLS.values())
    return urls[movie_id % len(urls)]
