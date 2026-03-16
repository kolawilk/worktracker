import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTimeEntryStore } from '@/stores/timeEntryStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { 
  getWeekStart, 
  getWeekEnd,
  formatDuration,
  formatDurationHHMM
} from '@/lib/week'
import { ChevronLeft, ChevronRight, Calendar, Clock, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeekCategory {
  category_id: string
  category_name: string
  category_emoji: string
  category_color?: string
  total_seconds: number
}

function WeeklyReportPage() {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  
  const { timeEntries } = useTimeEntryStore()
  const { getActiveCategories } = useCategoryStore()
  const activeCategories = getActiveCategories()

  // Aktuelle Woche basierend auf Offset
  const weekDates = useMemo(() => {
    const today = new Date()
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + (currentWeekOffset * 7))
    return {
      start: getWeekStart(targetDate),
      end: getWeekEnd(targetDate)
    }
  }, [currentWeekOffset])



  // Einträge für diese Woche filtern
  const weekEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekDates.start && entryDate <= weekDates.end
    })
  }, [timeEntries, weekDates])

  // Kategorien mit Zeit aggregieren
  const categoriesWithTime = useMemo(() => {
    const result: WeekCategory[] = []
    
    for (const category of activeCategories) {
      const totalSeconds = weekEntries
        .filter(entry => entry.categoryId === category.id)
        .reduce((sum, entry) => {
          const start = new Date(entry.startTime).getTime()
          const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
          return sum + Math.floor((end - start) / 1000)
        }, 0)
      
      if (totalSeconds > 0) {
        result.push({
          category_id: category.id,
          category_name: category.name,
          category_emoji: category.emoji,
          category_color: category.color,
          total_seconds: totalSeconds
        })
      }
    }
    
    // Nach Zeit sortieren (absteigend)
    return result.sort((a, b) => b.total_seconds - a.total_seconds)
  }, [activeCategories, weekEntries])

  // Gesamt-Arbeitszeit der Woche
  const totalSeconds = useMemo(() => {
    return weekEntries.reduce((sum, entry) => {
      const start = new Date(entry.startTime).getTime()
      const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
      return sum + Math.floor((end - start) / 1000)
    }, 0)
  }, [weekEntries])

  // Navigation
  const prevWeek = () => setCurrentWeekOffset(prev => prev - 1)
  const nextWeek = () => setCurrentWeekOffset(prev => prev + 1)
  const currentWeek = () => setCurrentWeekOffset(0)

  // Formatierung für Anzeige
  const weekLabel = useMemo(() => {
    const startStr = weekDates.start.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
    const endStr = weekDates.end.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
    return `${startStr} – ${endStr}`
  }, [weekDates])

  const isCurrentWeek = currentWeekOffset === 0

  // Maximale Zeit für Balkenberechnung
  const maxCategorySeconds = useMemo(() => {
    if (categoriesWithTime.length === 0) return 1
    return Math.max(...categoriesWithTime.map(c => c.total_seconds))
  }, [categoriesWithTime])

  // Leere Kategorien (ohne Zeit)
  const emptyCategories = useMemo(() => {
    return activeCategories.filter(cat => 
      !categoriesWithTime.find(c => c.category_id === cat.id)
    )
  }, [activeCategories, categoriesWithTime])

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header mit Navigation - Glass Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-primary/5">
          <div className="absolute inset-0 bg-white/40 dark:bg-black/20" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  Wochen-Auswertung
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {weekLabel}
                </p>
              </div>
              
              {/* Wochen-Navigation */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={prevWeek} 
                  variant="outline" 
                  size="icon"
                  className="h-12 w-12 rounded-xl backdrop-blur-sm bg-white/50 dark:bg-black/30 border-white/30 hover:bg-white/70 dark:hover:bg-black/50 transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <Button 
                  onClick={currentWeek} 
                  variant={isCurrentWeek ? "default" : "outline"}
                  className={cn(
                    "h-12 px-4 rounded-xl font-medium min-w-[100px] transition-all",
                    !isCurrentWeek && "backdrop-blur-sm bg-white/50 dark:bg-black/30 border-white/30 hover:bg-white/70 dark:hover:bg-black/50"
                  )}
                >
                  {isCurrentWeek ? 'Aktuell' : 'Heute'}
                </Button>
                
                <Button 
                  onClick={nextWeek} 
                  variant="outline" 
                  size="icon"
                  className="h-12 w-12 rounded-xl backdrop-blur-sm bg-white/50 dark:bg-black/30 border-white/30 hover:bg-white/70 dark:hover:bg-black/50 transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Gesamt-Statistiken - Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="relative overflow-hidden backdrop-blur-xl bg-white/60 dark:bg-black/40 border-white/30 dark:border-white/10 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Gesamtzeit</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatDurationHHMM(totalSeconds)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden backdrop-blur-xl bg-white/60 dark:bg-black/40 border-white/30 dark:border-white/10 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Aktivitäten</p>
                  <p className="text-2xl font-bold text-foreground">
                    {weekEntries.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden backdrop-blur-xl bg-white/60 dark:bg-black/40 border-white/30 dark:border-white/10 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Kategorien</p>
                  <p className="text-2xl font-bold text-foreground">
                    {categoriesWithTime.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kategorien mit Zeit - Glass Design */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 px-1">
            <span className="h-6 w-1 rounded-full bg-primary" />
            Zeit pro Kategorie
          </h2>
          
          {categoriesWithTime.length === 0 ? (
            <div className="text-center py-16 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-black/30 border border-white/20 dark:border-white/10 border-dashed">
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">Keine Einträge für diese Woche</p>
              <p className="text-muted-foreground/70 text-sm mt-1">
                Starte Tracking, um hier Daten zu sehen
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoriesWithTime.map((cat) => {
                const percentage = Math.round((cat.total_seconds / maxCategorySeconds) * 100)
                const weekPercentage = Math.round((cat.total_seconds / Math.max(totalSeconds, 1)) * 100)
                
                return (
                  <Card 
                    key={cat.category_id} 
                    className="group relative overflow-hidden backdrop-blur-xl bg-white/60 dark:bg-black/40 border-white/30 dark:border-white/10 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        {/* Emoji */}
                        <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-3xl shadow-inner">
                          {cat.category_emoji}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg truncate pr-4">{cat.category_name}</h3>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-sm text-muted-foreground">{weekPercentage}%</span>
                              <span className="text-xl font-bold text-primary">
                                {formatDurationHHMM(cat.total_seconds)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="relative h-3 w-full bg-muted/50 rounded-full overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: cat.category_color || 'hsl(var(--primary))',
                                boxShadow: cat.category_color ? `0 0 10px ${cat.category_color}50` : '0 0 10px hsl(var(--primary) / 0.5)'
                              }}
                            />
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDuration(cat.total_seconds)} • {weekPercentage}% der Woche
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Leere Kategorien (ausgegraut) */}
        {emptyCategories.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 px-1">
              <span className="h-4 w-1 rounded-full bg-muted-foreground/30" />
              Leere Kategorien
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {emptyCategories.map(cat => (
                <div 
                  key={cat.id}
                  className="flex items-center gap-3 p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-black/20 border border-white/20 dark:border-white/5 opacity-60 hover:opacity-80 transition-opacity"
                >
                  <span className="text-2xl grayscale">{cat.emoji}</span>
                  <span className="text-sm text-muted-foreground truncate">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WeeklyReportPage
