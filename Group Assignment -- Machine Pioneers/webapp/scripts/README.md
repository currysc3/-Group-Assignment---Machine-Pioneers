# Website Development - Data Preparation Scripts Usage Guide

## Directory Structure

```
网站开发/
├── scripts/                    # Data preparation scripts
│   ├── config.py              # Configuration file (needs API Key)
│   ├── prepare_movie_data.py  # Main script: prepare movie data
│   └── README.md              # This file
├── assets/                     # Static resources
│   ├── data/                  # Generated data files
│   │   ├── movies_display.json
│   │   └── movies_display.csv
│   └── posters/               # Downloaded movie posters
│       ├── 19995.jpg
│       ├── 285.jpg
│       └── ...
├── backend/                    # Backend code (future development)
└── frontend/                   # Frontend code (future development)
```

## Quick Start

### Step 1: Get TMDB API Key

1. Visit https://www.themoviedb.org/settings/api
2. Log in to your account
3. Click "Create" or "Request API Key"
4. Select "Developer" type
5. Fill in application info (can be for personal use)
6. Copy the generated API Key (a combination of letters and numbers)

### Step 2: Configure API Key

Open `config.py` file and replace `your_api_key_here` with your actual API Key:

```python
TMDB_API_KEY = '1234567890abcdef1234567890abcdef'  # Replace with your real API Key
```

### Step 3: Install Dependencies

Make sure you have installed the required Python packages:

```bash
cd "/Users/pangjieyao/Desktop/Machine Learning/网站开发/scripts"
pip install pandas requests
```

### Step 4: Run Script

```bash
python prepare_movie_data.py
```

Optional parameters:
- `--max-movies N`: Process up to N movies (default 100)
- `--no-download-posters`: Do not download posters, only fetch URLs

Examples:
```bash
# Process 50 movies
python prepare_movie_data.py --max-movies 50

# Only get data, do not download posters
python prepare_movie_data.py --no-download-posters
```

## Output Files Description

### 1. movies_display.json

JSON file containing all movie information, format as follows:

```json
{
  "movies": [
    {
      "id": 19995,
      "title": "Avatar",
      "original_title": "Avatar",
      "release_year": 2009,
      "vote_average": 7.2,
      "genres": ["Action", "Adventure", "Fantasy", "Sci-Fi"],
      "cast": ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
      "director": "James Cameron",
      "overview": "Movie synopsis...",
      "poster_url": "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
      "poster_local": "assets/posters/19995.jpg",
      "tmdb_id": 19995,
      "runtime": 162,
      "tagline": "Enter a new world"
    }
  ]
}
```

### 2. movies_display.csv

CSV format movie data, convenient for viewing and editing in Excel.

### 3. posters/ Folder

Contains downloaded movie poster images, filename format: `{movie_id}.jpg`.

## Usage in Website

### Frontend Display Example (HTML + JavaScript)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Movie Recommendation System</title>
</head>
<body>
    <div id="movie-list"></div>
    
    <script>
        // Load movie data
        fetch('assets/data/movies_display.json')
            .then(response => response.json())
            .then(data => {
                const movieList = document.getElementById('movie-list');
                data.movies.forEach(movie => {
                    const card = document.createElement('div');
                    card.className = 'movie-card';
                    card.innerHTML = `
                        <img src="${movie.poster_local || movie.poster_url}" 
                             alt="${movie.title}" 
                             onerror="this.src='default-poster.jpg'">
                        <h3>${movie.title}</h3>
                        <p>${movie.release_year} | ${movie.vote_average} rating</p>
                        <p>${movie.genres.join(', ')}</p>
                        <p>Director: ${movie.director}</p>
                    `;
                    movieList.appendChild(card);
                });
            });
    </script>
</body>
</html>
```

### Backend API Example (Python Flask)

```python
from flask import Flask, jsonify, send_from_directory
import json

app = Flask(__name__)

# Load movie data
with open('assets/data/movies_display.json', 'r', encoding='utf-8') as f:
    movies_data = json.load(f)

@app.route('/api/movies')
def get_movies():
    return jsonify(movies_data)

@app.route('/api/movies/<int:movie_id>')
def get_movie(movie_id):
    movie = next((m for m in movies_data['movies'] if m['id'] == movie_id), None)
    if movie:
        return jsonify(movie)
    return jsonify({'error': 'Movie not found'}), 404

@app.route('/assets/posters/<path:filename>')
def serve_poster(filename):
    return send_from_directory('assets/posters', filename)

if __name__ == '__main__':
    app.run(debug=True)
```

## Notes

1. **API Limits**: TMDB free API has request rate limits, script has set 0.25 second delay
2. **Poster Copyright**: Downloaded posters are for personal learning use only, do not use for commercial purposes
3. **Data Updates**: If movie data is updated, you can rerun the script
4. **API Key Security**: Do not commit code containing real API Keys to public repositories

## Troubleshooting

### Issue: "Error: Please create config.py and set TMDB_API_KEY"

Solution: Make sure config.py file exists and TMDB_API_KEY is set to a valid API Key

### Issue: "Search failed" or "Failed to get details"

Possible causes:
- API Key invalid or expired
- Network connection issues
- TMDB API service temporarily unavailable

Solution: Check if API Key is correct, check network connection, retry later

### Issue: Poster download failed

Possible causes:
- Network connection issues
- Insufficient disk space

Solution: Check network connection, check disk space, or add `--no-download-posters` parameter to skip download

## Future Development Suggestions

1. **Backend Development**: Use Flask or FastAPI to build API service
2. **Frontend Development**: Use Vue.js or React to build user interface
3. **Recommendation Display**: Integrate collaborative filtering algorithm recommendation results
4. **User System**: Add user login and rating functionality
5. **Search Function**: Implement movie search and filtering
