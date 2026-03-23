# MovieRec: Collaborative Filtering Movie Recommendation System

A comprehensive movie recommendation system implementing User-Based and Item-Based Collaborative Filtering algorithms with Z-Score standardization optimization.

## 📋 Project Overview

This project implements a full-stack movie recommendation system with:
- **Collaborative Filtering Algorithms**: User-Based and Item-Based CF with cosine similarity and Pearson correlation
- **Z-Score Optimization**: Normalization technique improving prediction accuracy by 25%
- **Interactive Web Application**: React frontend with Flask backend
- **Comprehensive Evaluation**: Multiple metrics (MAE, RMSE, Precision@K, Recall@K)
- **Data Visualization**: 11+ analytical charts

## 📊 Key Results

| Algorithm | MAE | Improvement |
|-----------|-----|-------------|
| User-Based CF (Original) | 1.0786 | - |
| User-Based CF (Z-Score) | 0.8094 | 25% ↓ |
| Item-Based CF | 0.4410 | 59% vs User-Based |

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/MovieRec.git
cd MovieRec/webapp

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
cd frontend_new
npm install
cd ..

# Start the application
python start.py
```

### Access the Application
- Frontend: http://localhost:8080
- Backend API: http://localhost:8080/api

## 📁 Repository Structure

```
MovieRec/
├── webapp/                    # Web application (Flask + React)
│   ├── backend/               # Flask REST API
│   │   ├── app.py             # Main API server
│   │   ├── poster_cache.py    # Poster caching utilities
│   │   └── movie_poster_cache.py
│   ├── frontend_new/          # React frontend
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   │   ├── MovieCard.tsx
│   │   │   │   ├── EvaluationDashboard.tsx
│   │   │   │   ├── AlgorithmComparison.tsx
│   │   │   │   └── ...
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── assets/                # Data files
│   │   └── data/
│   │       ├── movies_display.json
│   │       ├── movies_display_expanded.json
│   │       ├── enhanced_user_profiles.json
│   │       └── user_similarities.json
│   ├── scripts/               # Utility scripts
│   │   ├── prepare_movie_data.py
│   │   ├── fetch_english_posters.py
│   │   └── config.py
│   ├── requirements.txt       # Python dependencies
│   ├── start.py              # Startup script
│   └── README.md             # Webapp specific docs
├── visualizations/            # 11 analysis charts
│   ├── vote_avg_dist.png
│   ├── genre_dist.png
│   ├── release_year_dist.png
│   ├── Primary Issue Extreme Data Sparsity.png
│   ├── Algorithm Strengths & Weaknesses Comparison.png
│   ├── Tertiary Issue Modest Diversity.png
│   ├── Secondary Issue Cold Start Problem.png
│   └── Issue Impact Heatmap.png
└── README.md                 # This file
```

## 📈 Visualizations Included

1. **Movie rating distribution** - Overall rating patterns
2. **Genre distribution** - Popular genres analysis
3. **Release year trends** - Temporal distribution
4. **Matrix sparsity analysis** - Data density visualization
5. **Z-score optimization comparison** - Before/after MAE
6. **Error distribution histograms** - Prediction accuracy
7. **Actual vs predicted scatter plots** - Correlation analysis
8. **Algorithm strengths comparison** - Multi-dimensional evaluation
9. **Recommendation diversity analysis** - Genre coverage
10. **Cold start risk distribution** - User interaction patterns
11. **Root cause impact heatmap** - Issue severity analysis

## 🔬 Dataset

- **Source**: MovieLens dataset
- **Size**: 6,040 users, 3,706 movies, 1,810,189 ratings
- **Matrix Sparsity**: 99.98%
- **Rating Scale**: 1-5 stars

## 🛠️ Tech Stack

- **Backend**: Python Flask + RESTful API
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Visualization**: Recharts, Matplotlib
- **Data**: Pandas, NumPy

## 📊 API Endpoints

### Movie Endpoints
- `GET /api/movies` - Get movie list with pagination
- `GET /api/movies/<id>` - Get movie details
- `GET /api/movies/<id>/similar` - Get similar movies

### Recommendation Endpoints
- `GET /api/recommendations/<user_id>` - Get personalized recommendations
- `GET /api/recommendations/compare/<user_id>` - Compare algorithms

### Evaluation Endpoints
- `GET /api/evaluation/summary` - Get evaluation metrics
- `GET /api/evaluation/interactive` - Get detailed evaluation data
- `GET /api/evaluation/charts` - Get available charts

### User Endpoints
- `GET /api/users/<id>/profile` - Get user profile
- `GET /api/users/<id>/similar` - Get similar users

## 🎯 Features

### User Features
- Browse movie catalog with search and filters
- View detailed movie information (poster, cast, ratings)
- Get personalized recommendations
- Compare User-Based vs Item-Based CF results

### Admin/Evaluation Features
- Interactive evaluation dashboard
- Algorithm performance comparison
- Data insights visualization
- Project timeline display

## 📝 Algorithm Implementation

### Z-Score Standardization
```python
def _zscore_normalize(self, matrix):
    """Normalize ratings by user mean and std"""
    normalized = matrix.copy().toarray()
    for i in range(n_users):
        user_ratings = normalized[i]
        mask = user_ratings > 0
        if np.sum(mask) > 0:
            mean = self.user_mean_ratings[i]
            std = self.user_std_ratings[i]
            if std > 0:
                normalized[i][mask] = (user_ratings[mask] - mean) / std
    return csr_matrix(normalized)
```

## 👥 Team Members

- Data Preprocessing
- Collaborative Filtering Algorithm Implementation
- Algorithm Evaluation and Visualization
- Full-Stack Web Development

## 📄 License

MIT License

## 🙏 Acknowledgments

- MovieLens dataset provided by GroupLens Research
- Built with Flask, React, and Recharts
