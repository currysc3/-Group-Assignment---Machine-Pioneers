# MovieRec - Intelligent Movie Recommendation System Based on Collaborative Filtering

🎬 A fully functional movie recommendation system that implements personalized recommendations based on collaborative filtering algorithms.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

### 🎯 User Features
- **Movie Browsing** - Browse an extensive movie library with search and filter support
- **Movie Details** - View movie posters, ratings, cast, directors, and other detailed information
- **Personalized Recommendations** - Generate personalized recommendations based on collaborative filtering algorithms
- **Algorithm Comparison** - Compare recommendation results between User-Based CF and Item-Based CF

### ⚙️ Admin Dashboard
- **Data Dashboard** - Overview of core system metrics
- **Project Timeline** - Complete project development history display
- **Algorithm Evaluation** - Detailed visualization charts and analysis reports
- **Root Cause Analysis** - In-depth analysis of recommendation system performance bottlenecks

### 🔬 Technical Highlights
- **Collaborative Filtering Algorithms** - Implementation of both User-Based and Item-Based CF algorithms
- **Evaluation Metrics** - Precision@10, Recall@10, MAE
- **Visualization Analysis** - 10+ high-quality analysis charts
- **Modern Interface** - Dark theme + smooth animations

## 🚀 Quick Start

### Method 1: One-Click Deployment (Recommended)

```bash
cd "/Users/pangjieyao/Desktop/Machine Learning/网站开发"
python deploy.py
```

The script will automatically:
- Find available ports (default 8080)
- Install dependencies
- Start frontend and backend services
- Open browser automatically

### Method 2: Manual Start

```bash
cd "/Users/pangjieyao/Desktop/Machine Learning/网站开发"
pip install -r requirements.txt
python start.py
```

### Access the Website

- Frontend: http://127.0.0.1:8080/
- Admin Dashboard: http://127.0.0.1:8080/admin

## 📁 Project Structure

```
网站开发/
├── backend/
│   └── app.py              # Flask backend API
├── frontend/
│   ├── index.html          # Frontend interface
│   ├── admin.html          # Admin dashboard
│   ├── styles.css          # Frontend styles
│   ├── admin.css           # Admin styles
│   ├── app.js              # Frontend logic
│   └── admin.js            # Admin logic
├── assets/
│   ├── data/
│   │   └── movies_display.json    # Movie data
│   └── posters/            # Movie posters
├── scripts/
│   ├── config.py           # Configuration file
│   ├── prepare_movie_data.py      # Data preparation script
│   └── README.md           # Script usage instructions
├── requirements.txt        # Python dependencies
├── start.py               # Startup script
└── README.md              # Project documentation
```

## 📊 Algorithm Evaluation Results

| Algorithm | MAE | Precision@10 | Recall@10 |
|------|-----|--------------|-----------|
| User-Based CF | 1.0786 | 0.0000 | 0.0000 |
| Item-Based CF | 0.4410 | 0.0000 | 0.0000 |

**Conclusion**: Item-Based CF outperforms User-Based CF in rating prediction accuracy, with MAE reduced by 59%.

## 🛠️ Tech Stack

- **Backend**: Python Flask + RESTful API
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Algorithms**: Collaborative Filtering (User-Based & Item-Based)
- **Data**: Pandas + NumPy
- **Visualization**: Matplotlib

## 📈 Project Timeline

1. **Phase 1** (3/1-3/16): Data preparation and preprocessing
2. **Phase 2** (3/16-3/19): Collaborative filtering algorithm implementation
3. **Phase 3** (3/19-3/21): Algorithm evaluation and visualization
4. **Phase 4** (3/21-3/27): Full-stack website development

## 📝 API Endpoints

### Movie Related
- `GET /api/movies` - Get movie list
- `GET /api/movies/<id>` - Get movie details
- `GET /api/movies/genres` - Get movie genres

### Recommendation Related
- `GET /api/recommendations/<user_id>` - Get user recommendations
- `GET /api/recommendations/compare/<user_id>` - Compare algorithm recommendations

### Evaluation Related
- `GET /api/evaluation/summary` - Get evaluation summary
- `GET /api/evaluation/charts` - Get chart list
- `GET /api/timeline` - Get project timeline

## 🤝 Contributors

This project is a course assignment. Team members:
- Data preprocessing
- Collaborative filtering algorithm implementation
- Algorithm evaluation and visualization
- Full-stack website development

## 📄 License

MIT License
