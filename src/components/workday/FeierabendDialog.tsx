import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Button } from '@/components/ui/button'
import { Clock, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useWorkDayStore } from '@/stores/workDayStore'
import { useTimeEntryStore } from '@/stores/timeEntryStore'
import { useCategoryStore } from '@/stores/categoryStore'

// Feierabend-Sprüche mit einem Schuss Humor
const FEIERABEND_SPRUECHE = [
  "Feierabend! Zeit, den Laptop zu schließen und das Leben zu öffnen.",
  "Pfeiffen, Trillerpfeiffen, Feierabend!",
  "Der Arbeitstag ist vorbei — die Freizeit kann beginnen!",
  "Tschüss Büro, hallo Sofa!",
  "Arbeit beendet, Entspannung aktiviert.",
  "Gute Arbeit, heute warst du produktiv!",
  "Der Tag ist gesungen — jetzt wird gekocht!",
  "Bis morgen, alter Freund — Arbeit macht nur halb so viel Spaß wie Freizeit!",
  "Du hast es geschafft! Der Tag ist beendet.",
  "Feierabend bedeutet: Keine Emails, keine Meetings — nur Du.",
]

interface FeierabendDialogProps {
  isOpen: boolean
  onClose: () => void
  showQuote?: boolean  // Wenn true, Spruch anzeigen (beim automatischen Beenden)
}

interface CategoryData {
  name: string
  value: number
  color: string
  emoji: string
}

export function FeierabendDialog({ isOpen, onClose, showQuote = true }: FeierabendDialogProps) {
  const { currentWorkDay } = useWorkDayStore()
  const { timeEntries } = useTimeEntryStore()
  const { categories } = useCategoryStore()
  
  const [quote, setQuote] = useState<string>("")

  useEffect(() => {
    // Zufälligen Spruch auswählen, wenn Dialog geöffnet wird
    if (isOpen && showQuote) {
      const randomIndex = Math.floor(Math.random() * FEIERABEND_SPRUECHE.length)
      setQuote(FEIERABEND_SPRUECHE[randomIndex])
    }
  }, [isOpen, showQuote])

  // Zeitverteilung pro Kategorie berechnen
  const getCategoryData = (): CategoryData[] => {
    const categoryMap = new Map<string, { name: string; value: number; color: string; emoji: string }>()
    
    // Alle Kategorien initialisieren mit 0
    categories.forEach(cat => {
      if (!cat.isDeleted) {
        categoryMap.set(cat.id, {
          name: cat.name,
          value: 0,
          color: cat.color || '#8884d8',
          emoji: cat.emoji
        })
      }
    })
    
    // Zeit für jeden Eintrag zählen (nur aktueller Tag)
    if (currentWorkDay) {
      const today = currentWorkDay.date
      const currentDate = new Date(today).toISOString().split('T')[0]
      
      timeEntries.forEach(entry => {
        // Nur Einträge vom aktuellen Tag berücksichtigen
        const entryDate = new Date(entry.date).toISOString().split('T')[0]
        if (entryDate === currentDate) {
          const catData = categoryMap.get(entry.categoryId)
          if (catData) {
            // Dauer berechnen
            const start = new Date(entry.startTime).getTime()
            const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
            const duration = Math.floor((end - start) / 1000) // in Sekunden
            catData.value += duration
          }
        }
      })
    }
    
    // Nur Kategorien mit Zeit > 0 zurückgeben
    return Array.from(categoryMap.values())
      .filter(cat => cat.value > 0)
      .sort((a, b) => b.value - a.value) // Sortieren nach Zeit (höchste zuerst)
  }

  const categoryData = getCategoryData()
  
  // Gesamtarbeitszeit in Sekunden
  const getTotalWorkTimeSeconds = (): number => {
    if (!currentWorkDay) return 0
    const start = new Date(currentWorkDay.startTime).getTime()
    const end = currentWorkDay.endTime ? new Date(currentWorkDay.endTime).getTime() : Date.now()
    const grossTime = end - start
    const pauseTimeMs = currentWorkDay.totalPauseMinutes * 60000
    return Math.floor((grossTime - pauseTimeMs) / 1000)
  }

  const totalWorkSeconds = getTotalWorkTimeSeconds()

  // Formatierungsfunktion für Sekunden in hh:mm:ss
  const formatSeconds = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Feierabend! 🎉</h2>
            <p className="text-muted-foreground mt-2">
              Der Arbeitstag ist beendet
            </p>
          </div>
        </DialogHeader>

        {/* Feierabend-Spruch (nur bei automatischem Beenden) */}
        {showQuote && quote && (
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-lg italic font-medium text-primary">
              "{quote}"
            </p>
          </div>
        )}

        {/* Zeitverteilung Diagramm */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zeitverteilung</CardTitle>
            <CardDescription>Wie hast du deine Zeit verteilt?</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="rgba(0,0,0,0.1)"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatSeconds(Number(value))}
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => {
                        const data = categoryData.find(d => d.name === value)
                        return data ? `${data.emoji} ${value} (${formatSeconds(data.value)})` : value
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Keine Zeitangaben für diesen Tag</p>
                <p className="text-sm mt-2">Starte Kategorien, um Zeit zu tracken!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gesamtarbeitszeit */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Gesamtarbeitszeit</CardTitle>
              </div>
              {currentWorkDay && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(currentWorkDay.startTime).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">
                {formatSeconds(totalWorkSeconds)}
              </div>
              <p className="text-sm text-muted-foreground">
                {totalWorkSeconds > 3600 
                  ? `${Math.floor(totalWorkSeconds / 3600)} Stunden` 
                  : `${Math.floor(totalWorkSeconds / 60)} Minuten`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Buttons */}
        <div className="flex flex-col gap-2">
          <Button onClick={onClose} className="w-full" size="lg">
            👍 Alles klar, danke!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FeierabendDialog
