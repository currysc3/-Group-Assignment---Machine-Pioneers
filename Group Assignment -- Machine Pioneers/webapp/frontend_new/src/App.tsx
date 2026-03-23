import { useState, useEffect } from "react"
import "./styles/globals.css"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  UserProfileCard,
  AlgorithmComparison,
  EvaluationDashboard,
  Timeline,
  UserSimilarity,
  DataInsights,
  MovieDetailModal,
  MovieCard,
} from "./components"

// Types
interface Movie {
  movie_id: number
  title: string
  poster_url: string
  poster_local?: string | null | undefined
  release_year?: number
  rating?: number
  vote_average?: number
  predicted_rating?: number
  genres?: string | string[]
  overview?: string
  cast?: string[]
  director?: string
  tagline?: string
  runtime?: number
}

// Main App with fade transition between Landing and Content
function App() {
  const [showContent, setShowContent] = useState(false)
  const [isFading, setIsFading] = useState(false)

  const handleBeginJourney = () => {
    setIsFading(true)
    setTimeout(() => {
      setShowContent(true)
      setIsFading(false)
    }, 800)
  }

  const handleBackToHome = () => {
    setIsFading(true)
    setTimeout(() => {
      setShowContent(false)
      setIsFading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[hsl(201,100%,13%)]">
      {/* Landing Page */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-700 ease-in-out ${
          showContent ? "opacity-0 pointer-events-none" : "opacity-100"
        } ${isFading ? "opacity-0" : ""}`}
      >
        <LandingPage onBegin={handleBeginJourney} />
      </div>

      {/* Content Page */}
      <div 
        className={`transition-opacity duration-700 ease-in-out ${
          showContent ? "opacity-100" : "opacity-0 pointer-events-none"
        } ${isFading && showContent ? "opacity-0" : ""}`}
      >
        <ContentPage onBack={handleBackToHome} />
      </div>
    </div>
  )
}

// Landing Page Component
function LandingPage({ onBegin }: { onBegin: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-[hsl(201,100%,13%)]/60" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div 
          className="text-3xl tracking-tight text-white"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          MovieRec<sup className="text-xs">®</sup>
        </div>
        <button 
          onClick={onBegin}
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white hover:scale-[1.03] transition-transform"
        >
          Enter
        </button>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 flex-1">
        <h1 
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-white animate-fade-rise"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where <em className="not-italic text-white/60">dreams</em> rise{" "}
          <em className="not-italic text-white/60">through the silence.</em>
        </h1>
        <p className="text-white/60 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          Intelligent film recommendations powered by collaborative filtering algorithms.
        </p>
        <button 
          onClick={onBegin}
          className="liquid-glass rounded-full px-14 py-5 text-base text-white mt-12 animate-fade-rise-delay-2 hover:scale-[1.03] transition-transform cursor-pointer"
        >
          Begin Journey
        </button>
      </div>
    </section>
  )
}

// Content Page Component
function ContentPage({ onBack }: { onBack: () => void }) {
  const [activeSection, setActiveSection] = useState("movies")
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [selectedUserId, setSelectedUserId] = useState(0)

  const navItems = [
    { id: "movies", name: "Movies" },
    { id: "recommendations", name: "For You" },
    { id: "insights", name: "Insights" },
    { id: "comparison", name: "Compare" },
    { id: "evaluation", name: "Evaluation" },
    { id: "timeline", name: "Timeline" },
    { id: "community", name: "Community" },
  ]

  return (
    <div className="min-h-screen bg-[hsl(201,100%,13%)]">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[hsl(201,100%,13%)]/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-7xl mx-auto">
          <button 
            onClick={onBack}
            className="text-xl sm:text-2xl tracking-tight text-white hover:opacity-80 transition-opacity"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            MovieRec<sup className="text-xs">®</sup>
          </button>
          
          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap transition-all ${
                  activeSection === item.id 
                    ? "liquid-glass text-white" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <button 
            onClick={onBack}
            className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors hidden sm:block"
          >
            Back
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {activeSection === "movies" && <MoviesSection onSelectMovie={setSelectedMovie} />}
        {activeSection === "recommendations" && (
          <RecommendationsSection 
            onSelectMovie={setSelectedMovie} 
            selectedUserId={selectedUserId}
            onUserChange={setSelectedUserId}
          />
        )}
        {activeSection === "insights" && <DataInsightsSection />}
        {activeSection === "comparison" && <ComparisonSection userId={selectedUserId} />}
        {activeSection === "evaluation" && <EvaluationDashboardSection />}
        {activeSection === "timeline" && <TimelineSection />}
        {activeSection === "community" && <CommunitySection userId={selectedUserId} />}
      </main>

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}

      <Footer />
    </div>
  )
}

// Movies Section with Pagination
function MoviesSection({ onSelectMovie }: { onSelectMovie: (movie: Movie) => void }) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const per_page = 24

  useEffect(() => {
    fetch(`/api/movies?page=${currentPage}&per_page=${per_page}&expanded=true`)
      .then(r => r.json())
      .then(data => {
        setMovies(data.movies || [])
        setTotalPages(data.total_pages || 1)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [currentPage])

  if (loading) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 
            className="text-4xl md:text-5xl tracking-tight text-white mb-3"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Discover Cinema
          </h2>
          <p className="text-white/50 max-w-xl">
            Explore our curated collection of films from around the world
          </p>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.movie_id}
              movie={movie}
              onClick={onSelectMovie}
              index={index}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  currentPage === page 
                    ? "bg-white text-[hsl(201,100%,13%)]" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

// Recommendations Section
function RecommendationsSection({ 
  onSelectMovie, 
  selectedUserId, 
  onUserChange 
}: { 
  onSelectMovie: (movie: Movie) => void
  selectedUserId: number
  onUserChange: (id: number) => void
}) {
  const [recs, setRecs] = useState<Movie[]>([])
  const [algorithm] = useState("user_based")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/recommendations/${selectedUserId}?algorithm=${algorithm}&n=10`)
      .then(r => r.json())
      .then(data => {
        setRecs(data.recommendations || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedUserId, algorithm])

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl tracking-tight text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Personalized For You
          </h2>
        </div>

        <UserProfileCard userId={selectedUserId} />

        <div className="flex justify-center gap-4 mb-8">
          {[0,1,2,3,4,5,6,7,8,9].map(id => (
            <button
              key={id}
              onClick={() => onUserChange(id)}
              className={`w-10 h-10 rounded-full ${selectedUserId === id ? 'bg-white text-[hsl(201,100%,13%)]' : 'bg-white/10 text-white'}`}
            >
              {id}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {recs.map((movie, index) => (
              <MovieCard key={movie.movie_id} movie={movie} onClick={onSelectMovie} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Other Sections
function DataInsightsSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl text-white text-center mb-12" style={{ fontFamily: "'Instrument Serif', serif" }}>Data Insights</h2>
        <DataInsights />
      </div>
    </section>
  )
}

function ComparisonSection({ userId }: { userId: number }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl text-white text-center mb-12" style={{ fontFamily: "'Instrument Serif', serif" }}>Algorithm Comparison</h2>
        <AlgorithmComparison userId={userId} />
      </div>
    </section>
  )
}

function EvaluationDashboardSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl text-white text-center mb-12" style={{ fontFamily: "'Instrument Serif', serif" }}>Interactive Evaluation</h2>
        <EvaluationDashboard />
      </div>
    </section>
  )
}

function TimelineSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl text-white text-center mb-12" style={{ fontFamily: "'Instrument Serif', serif" }}>Project Timeline</h2>
        <Timeline />
      </div>
    </section>
  )
}

function CommunitySection({ userId }: { userId: number }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl text-white text-center mb-12" style={{ fontFamily: "'Instrument Serif', serif" }}>Community</h2>
        <UserSimilarity userId={userId} />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto text-center">
        <div className="text-2xl text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
          MovieRec<sup className="text-xs">®</sup>
        </div>
        <p className="text-white/60">Intelligent film recommendations powered by collaborative filtering</p>
        <p className="text-white/40 text-sm mt-8">© 2026 MovieRec. Built with precision and passion.</p>
      </div>
    </footer>
  )
}

export default App
