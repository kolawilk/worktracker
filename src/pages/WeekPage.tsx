import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTimeEntryStore } from '@/stores/timeEntryStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { 
  getWeekStart, 
  getWeekEnd, 
  formatISOWeek, 
  getRelativeWeek,
  getWeekDates,
  formatDuration,
  formatDurationHHMM
} from '@/lib/week'

interface WeekCategory {
  category_id: string
  category_name: string
  category_emoji: string
  category_color?: string
  total_seconds: number
}

function WeekPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const weekParam = searchParams.get('week') || formatISOWeek(new Date())
  
  const { timeEntries } = useTimeEntryStore()
  const { categories } = useCategoryStore()

  // Kalndarwoche berechnen
  const weekDates = useMemo(() => {
    try {
      return getWeekDates(weekParam)
    } catch (e) {
      // Fallback auf aktuelle Woche
      return {
        start: getWeekStart(new Date()),
        end: getWeekEnd(new Date())
      }
    }
  }, [weekParam])

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
    
    for (const category of categories) {
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
  }, [categories, weekEntries])

  // Gesamt-Arbeitszeit der Woche
  const totalSeconds = useMemo(() => {
    return weekEntries.reduce((sum, entry) => {
      const start = new Date(entry.startTime).getTime()
      const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
      return sum + Math.floor((end - start) / 1000)
    }, 0)
  }, [weekEntries])

  // Navigation
  const prevWeek = () => {
    const newWeek = getRelativeWeek(weekParam, -1)
    setSearchParams({ week: newWeek })
  }

  const nextWeek = () => {
    const newWeek = getRelativeWeek(weekParam, 1)
    setSearchParams({ week: newWeek })
  }

  const currentWeek = () => {
    setSearchParams({ week: formatISOWeek(new Date()) })
  }

  // Formatierung für Anzeige
  const weekLabel = useMemo(() => {
    const startStr = weekDates.start.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
    const endStr = weekDates.end.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
    return `${startStr} - ${endStr}`
  }, [weekDates])

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header mit Navigation */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl">
                📊 Wochen-Auswertung
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Woche {weekParam} — {weekLabel}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={prevWeek} variant="outline" size="sm" disabled={weekParam === formatISOWeek(new Date())}>
                ← Vorherige Woche
              </Button>
              <Button onClick={currentWeek} variant="outline" size="sm">
                Heute
              </Button>
              <Button onClick={nextWeek} variant="outline" size="sm">
                Nächste Woche →
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-center md:justify-start gap-4 md:gap-8">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Gesamtzeit</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {formatDuration(totalSeconds)}
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Aktivitäten</p>
                <p className="text-2xl md:text-3xl font-bold">
                  {weekEntries.length}
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Kategorien</p>
                <p className="text-2xl md:text-3xl font-bold">
                  {categoriesWithTime.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kategorien mit Zeit */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Zeit pro Kategorie
          </h2>
          
          {categoriesWithTime.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl bg-muted/20">
              <p className="text-muted-foreground text-lg">Keine Einträge für diese Woche</p>
              <p className="text-muted-foreground text-sm mt-2">
                Starte Tracking, um hier Daten zu sehen
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {categoriesWithTime.map((cat) => (
                <Card key={cat.category_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{cat.category_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate">{cat.category_name}</h3>
                          <span className="text-lg font-bold text-primary whitespace-nowrap">
                            {formatDurationHHMM(cat.total_seconds)}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${cat.category_color ? `bg-[${cat.category_color}]` : 'bg-primary'}`}
                            style={{
                              width: `${Math.min((cat.total_seconds / Math.max(totalSeconds, 1)) * 100, 100)}%`,
                              backgroundColor: cat.category_color || undefined
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDuration(cat.total_seconds)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Kategorien ohne Zeit (ausgegraut) */}
        {categories.length > categoriesWithTime.length && (
          <div className="space-y-3 pt-4 border-t">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Leere Kategorien
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories
                .filter(cat => !categoriesWithTime.find(c => c.category_id === cat.id))
                .map(cat => (
                  <div 
                    key={cat.id}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30"
                  >
                    <span className="text-2xl opacity-50">{cat.emoji}</span>
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

export default WeekPage
