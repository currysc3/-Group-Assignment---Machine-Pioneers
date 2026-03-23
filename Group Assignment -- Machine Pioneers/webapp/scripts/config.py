#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Configuration file

Usage:
1. Visit https://www.themoviedb.org/settings/api to get an API Key
2. Replace 'your_api_key_here' below with your actual API Key
3. Save the file

Note: Do not commit files containing real API Keys to public repositories!
"""

# TMDB API Key
# Can be found at https://www.themoviedb.org/settings/api after registration
# API Key is usually a combination of letters and numbers, e.g.: 1234567890abcdef1234567890abcdef
TMDB_API_KEY = '6100318fc3de0fae20545ed9464a64a3'

# Poster size configuration
# Options: "w92", "w154", "w185", "w342", "w500", "w780", "original"
# w500 is recommended, balancing clarity and file size
POSTER_SIZE = "w500"

# Request delay (seconds)
# To avoid triggering API limits, there will be a delay between each request
REQUEST_DELAY = 0.25

# Proxy configuration (if needed to access external network)
# Uncomment below and modify to your proxy address
# PROXIES = {
#     'http': 'http://127.0.0.1:7890',
#     'https': 'http://127.0.0.1:7890'
# }
PROXIES = None  # Default: no proxy
