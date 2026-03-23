# MovieRec AI Agent - Intelligent Assistant

🤖 An intelligent assistant for the movie recommendation system based on collaborative filtering algorithms

## Features

The AI Agent can answer various questions about the project, including:

### 1. Movie Search and Recommendation
- 🔍 Search for movie information
- 🎬 Get personalized recommendations
- 📊 View movie details (ratings, genres, cast, directors, etc.)

**Example Questions:**
- "Recommend some movies"
- "Information about Inception"
- "What good action movies are there"

### 2. Algorithm Evaluation Analysis
- 📈 View algorithm performance metrics (MAE, Precision, Recall)
- 📊 Compare User-Based and Item-Based CF
- 🔍 Understand evaluation results and improvement suggestions

**Example Questions:**
- "How are the algorithm evaluation results"
- "What is the MAE"
- "Which algorithm is better"

### 3. Project Information Query
- 📅 View project development timeline
- 📋 Understand completion status of each phase
- 🔬 View data preprocessing information

**Example Questions:**
- "Project timeline"
- "How is the project progress"
- "What phases have been completed"

### 4. Data Analysis
- 📊 View data statistics (number of movies, users, rating distribution)
- 🔍 Understand data sparsity issues
- 📈 View popular genre analysis

**Example Questions:**
- "Data statistics"
- "How many movies are there"
- "How is the data sparsity"

### 5. Collaborative Filtering Principles
- 🤖 Explain collaborative filtering algorithm principles
- 📚 Introduce User-Based and Item-Based CF
- 💡 Explain evaluation metric meanings

**Example Questions:**
- "What is collaborative filtering"
- "What is the algorithm principle"
- "What does MAE mean"

### 6. User Recommendation Query
- 👤 View specific user recommendation results
- 🎯 Get personalized recommendation lists
- 📊 Compare recommendations from different algorithms

**Example Questions:**
- "Recommendations for User 0"
- "What movies are recommended for user 10"

## Usage Instructions

1. Click the 🤖 AI floating button in the bottom right corner
2. Enter your question in the input box
3. Click send or press Enter
4. You can also use quick buttons for fast questioning

## Technical Implementation

- **Frontend**: JavaScript (Vanilla JS)
- **Styles**: CSS3 (Dark theme)
- **API**: Calls project backend RESTful API
- **Data Sources**: 
  - Movie data (`/api/movies`)
  - User data (`/api/users`)
  - Recommendation data (`/api/recommendations`)
  - Evaluation data (`/api/evaluation/summary`)
  - Timeline data (`/api/timeline`)

## File Structure

```
frontend/
├── ai-agent.js      # AI Agent core logic
├── ai-agent.css     # AI Agent styles
├── index.html       # Frontend page (integrated)
└── admin.html       # Admin page (integrated)
```

## Features

- ✅ Intelligent semantic understanding
- ✅ Multi-turn conversation support
- ✅ Quick buttons for fast questioning
- ✅ Movie card click interaction
- ✅ Responsive design (mobile support)
- ✅ Typing animation effects
- ✅ Beautiful dark theme

## Extension Development

To add new Q&A capabilities, modify the `processQuery` method in `ai-agent.js`:

```javascript
async processQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    // Add new keyword matching
    if (this.matchKeywords(lowerQuery, ['new keyword'])) {
        return this.handleNewQuery();
    }
    
    // ... other logic
}
```

## Notes

1. AI Agent requires the backend service to be running normally
2. Project data will be preloaded on first load
3. Movie posters may load slowly due to network issues
4. Some movies may use placeholder images
