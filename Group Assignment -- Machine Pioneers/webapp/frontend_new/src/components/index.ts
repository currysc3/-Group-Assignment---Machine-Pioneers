// User Profile Components
export { UserProfileCard } from "./UserProfileCard"
export type {
  UserProfile,
  GenrePreference,
  TopRatedMovie,
  RatingDistribution,
} from "./UserProfileCard"

// Recommendation Components
export { SimilarMovies } from "./SimilarMovies"
export type { SimilarMovie } from "./SimilarMovies"

export { AlgorithmExplanation } from "./AlgorithmExplanation"
export type {
  Explanation,
  UserBasedExplanation,
  ItemBasedExplanation,
} from "./AlgorithmExplanation"

export { AlgorithmComparison } from "./AlgorithmComparison"
export type {
  AlgorithmResult,
  MovieRecommendation,
} from "./AlgorithmComparison"

// Evaluation Components
export { EvaluationDashboard } from "./EvaluationDashboard"
export type {
  ConfusionMatrix,
  ErrorDistribution,
  ROCCurve,
  EvaluationMetrics,
} from "./EvaluationDashboard"

// Project Components
export { Timeline, examplePhases } from "./Timeline"
export type { TimelinePhase } from "./Timeline"

// Search Components
export { AdvancedSearch } from "./AdvancedSearch"
export type { SearchFilters } from "./AdvancedSearch"

// Social Components
export { UserSimilarity, generateExampleSimilarUsers } from "./UserSimilarity"
export type { SimilarUser, GenreMatch } from "./UserSimilarity"

// Data Dashboard Components
export { DataInsights, exampleDataInsights } from "./DataInsights"
export type {
  DataStats,
  GenreDistribution,
  RatingDistribution as DataRatingDistribution,
  YearTrend,
  TopMovie,
} from "./DataInsights"

// Movie Detail Components
export {
  MovieDetailModal,
  exampleMovieDetail,
  exampleSimilarMovies,
} from "./MovieDetailModal"
export type { Movie, CastMember, SimilarMovie as DetailSimilarMovie } from "./MovieDetailModal"

// Movie Card Component
export { MovieCard } from "./MovieCard"
