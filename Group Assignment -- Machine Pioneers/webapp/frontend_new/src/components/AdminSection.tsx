import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  BarChart3, 
  ChevronRight,
  Database,
  Activity
} from "lucide-react"

interface TimelinePhase {
  phase: string
  title: string
  date: string
  status: string
  description: string
  deliverables: string[]
}

const navItems = [
  { id: "overview", name: "Overview", icon: LayoutDashboard },
  { id: "movies", name: "Movies", icon: Film },
  { id: "users", name: "Users", icon: Users },
  { id: "evaluation", name: "Evaluation", icon: BarChart3 },
  { id: "timeline", name: "Timeline", icon: Activity },
]

export function AdminSection() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeline, setTimeline] = useState<TimelinePhase[]>([])
  const [stats, setStats] = useState({
    movies: 0,
    users: 0,
    algorithms: 2,
    charts: 0
  })

  useEffect(() => {
    // Fetch timeline
    fetch("/api/timeline")
      .then(r => r.json())
      .then(data => setTimeline(data.timeline || []))

    // Fetch stats
    fetch("/api/movies")
      .then(r => r.json())
      .then(data => setStats(s => ({ ...s, movies: data.movies?.length || 0 })))

    fetch("/api/users")
      .then(r => r.json())
      .then(data => setStats(s => ({ ...s, users: data.users?.length || 0 })))

    fetch("/api/evaluation/charts")
      .then(r => r.json())
      .then(data => setStats(s => ({ ...s, charts: data.charts?.length || 0 })))
  }, [])

  return (
    <section id="admin" className="relative z-10 py-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h2 
            className="text-4xl md:text-5xl tracking-tight text-foreground mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">
            System overview and management
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200",
                    activeTab === item.id
                      ? "liquid-glass text-foreground"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                  <ChevronRight 
                    size={14} 
                    className={cn(
                      "ml-auto transition-transform",
                      activeTab === item.id ? "rotate-90" : ""
                    )} 
                  />
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  icon={Film} 
                  label="Total Movies" 
                  value={stats.movies} 
                />
                <StatCard 
                  icon={Users} 
                  label="Total Users" 
                  value={stats.users} 
                />
                <StatCard 
                  icon={Database} 
                  label="Algorithms" 
                  value={stats.algorithms} 
                />
                <StatCard 
                  icon={BarChart3} 
                  label="Charts" 
                  value={stats.charts} 
                />
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-4">
                {timeline.map((phase) => (
                  <div 
                    key={phase.phase}
                    className="p-6 rounded-2xl liquid-glass"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          {phase.phase}
                        </span>
                        <h3 className="text-lg font-medium text-foreground mt-1">
                          {phase.title}
                        </h3>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs",
                        phase.status === "completed" 
                          ? "bg-green-500/20 text-green-400"
                          : phase.status === "in_progress"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-white/10 text-muted-foreground"
                      )}>
                        {phase.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {phase.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {phase.date}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "evaluation" && (
              <EvaluationAdmin />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType
  label: string
  value: number 
}) {
  return (
    <div className="p-6 rounded-2xl liquid-glass">
      <Icon size={20} className="text-muted-foreground mb-4" />
      <div className="text-3xl font-medium text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

function EvaluationAdmin() {
  const [charts, setCharts] = useState<{name: string, path: string, category: string}[]>([])

  useEffect(() => {
    fetch("/api/evaluation/charts")
      .then(r => r.json())
      .then(data => setCharts(data.charts || []))
  }, [])

  const categories = [...new Set(charts.map(c => c.category))]

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-lg font-medium text-foreground mb-4">{category}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {charts
              .filter(c => c.category === category)
              .map(chart => (
                <div 
                  key={chart.path}
                  className="p-4 rounded-xl liquid-glass group cursor-pointer"
                >
                  <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-black/20">
                    <img 
                      src={chart.path} 
                      alt={chart.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <p className="text-sm text-foreground">{chart.name}</p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
