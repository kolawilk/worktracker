import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CategoryGrid } from '@/components/category/CategoryGrid'
import { CategoryDialog } from '@/components/category/CategoryDialog'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTrackingStore } from '@/stores/trackingStore'
import { useWorkDayStore } from '@/stores/workDayStore'
import { Link, Routes, Route, useLocation } from 'react-router-dom'
import WeekPage from '@/pages/WeekPage'
import type { Category } from '@/types'
import { Play, Pause, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import './App.css'

function App() {
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const location = useLocation()
  
  const { addCategory, updateCategory, deleteCategory, getActiveCategories } = useCategoryStore()
  const { currentWorkDay, startWorkDay, pauseWorkDay, resumeWorkDay, endWorkDay } = useWorkDayStore()
  useTrackingStore()

  const activeCategories = getActiveCategories()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleAddCategory = () => {
    setEditingCategory(undefined)
    setDialogMode('create')
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setDialogMode('edit')
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = (category: Category) => {
    if (confirm(`Kategorie "${category.name}" wirklich löschen?`)) {
      deleteCategory(category.id)
    }
  }

  const handleDialogSubmit = (name: string, emoji: string, color?: string) => {
    if (dialogMode === 'create') {
      addCategory(name, emoji, color)
    } else if (editingCategory) {
      updateCategory(editingCategory.id, { name, emoji, color })
    }
  }

  const handleSelectCategory = (_category: Category) => {
    // Tracking wird in CategoryCard direkt über die Store-Funktionen gestartet/gestoppt
  }

  const isWeekPage = location.pathname === '/week'

  // WorkDay Status & Helper Functions (inline für Header)
  const getStatus = () => {
    if (!currentWorkDay) {
      return {
        status: 'not-started' as const,
        label: 'Arbeitstag nicht gestartet',
        colorClass: 'text-muted-foreground',
      }
    }
    
    if (currentWorkDay.endTime) {
      return {
        status: 'ended' as const,
        label: 'Arbeitstag beendet',
        colorClass: 'text-gray-500 dark:text-gray-400',
      }
    }
    
    if (currentWorkDay.isPaused) {
      return {
        status: 'paused' as const,
        label: 'Pausiert',
        colorClass: 'text-yellow-600 dark:text-yellow-400',
      }
    }
    
    return {
      status: 'running' as const,
      label: 'Arbeitstag läuft',
      colorClass: 'text-green-600 dark:text-green-400',
    }
  }

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalWorkTime = () => {
    if (!currentWorkDay) return 0
    const start = new Date(currentWorkDay.startTime).getTime()
    const end = currentWorkDay.endTime 
      ? new Date(currentWorkDay.endTime).getTime() 
      : Date.now()
    const grossTime = end - start
    const pauseTimeMs = currentWorkDay.totalPauseMinutes * 60000
    return grossTime - pauseTimeMs
  }

  const workTime = getTotalWorkTime()
  const status = getStatus()

  const handleStartPause = () => {
    if (status.status === 'not-started') {
      startWorkDay()
    } else if (status.status === 'running') {
      pauseWorkDay()
    } else if (status.status === 'paused') {
      resumeWorkDay()
    }
  }

  const handleEndWorkDay = () => {
    endWorkDay()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <nav>
          <Link to="/" title="Übersicht">
            <Button 
              variant={location.pathname === '/' ? 'default' : 'ghost'} 
              className="rounded-xl"
              size="icon"
            >
              🏠
            </Button>
          </Link>
          <Link to="/week" title="Wochen-Auswertung">
            <Button 
              variant={location.pathname === '/week' ? 'default' : 'ghost'} 
              className="rounded-xl"
              size="icon"
            >
              📊
            </Button>
          </Link>
          <Link to="/settings" title="Einstellungen">
            <Button 
              variant={location.pathname === '/settings' ? 'default' : 'ghost'} 
              className="rounded-xl"
              size="icon"
            >
              ⚙️
            </Button>
          </Link>
        </nav>
      </nav>

      {/* Hauptinhalt mit Platz für Sidebar */}
      <div className={isWeekPage ? "p-6" : "pl-[64px] p-6"}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header - kompakt, keine separaten Header-Bereich */}
          {!isWeekPage && (
            <div className="flex items-center justify-between py-3 px-4 border-b">
              {/* Links: Titel */}
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span>⏱️</span> Worktracker
              </h1>
              
              {/* Mitte: Arbeitstag-Steuerung inline integriert */}
              <div className="flex items-center gap-2">
                {/* Start/Pause Button */}
                <Button
                  variant="default"
                  size="icon"
                  className={cn(
                    'h-[48px] w-[48px] rounded-lg transition-all duration-200 flex-shrink-0',
                    status.status === 'not-started' || status.status === 'paused'
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                      : status.status === 'running'
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-md'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                  onClick={handleStartPause}
                  disabled={status.status === 'ended'}
                  aria-label={status.status === 'running' ? 'Pause' : 'Start'}
                >
                  {status.status === 'running' ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>

                {/* Zeit-Anzeige - dezente Farbe */}
                <div className="flex items-center justify-center px-2 min-w-[100px]">
                  <div className="text-center">
                    <div className={cn(
                      'font-mono font-semibold text-lg transition-all duration-300',
                      status.status === 'ended'
                        ? 'text-muted-foreground'
                        : status.status === 'paused'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-foreground'
                    )}>
                      {formatDuration(workTime)}
                    </div>
                  </div>
                </div>

                {/* Stopp Button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className={cn(
                    'h-[48px] w-[48px] rounded-lg transition-all duration-200 flex-shrink-0',
                    'hover:bg-red-700 shadow-md',
                    (status.status === 'not-started' || status.status === 'ended') && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={handleEndWorkDay}
                  disabled={status.status === 'not-started' || status.status === 'ended'}
                  aria-label="Arbeitstag beenden"
                >
                  <Square className="h-6 w-6" />
                </Button>
              </div>

              {/* Rechts: Neue Kategorie Button */}
              <Button 
                onClick={handleAddCategory} 
                size="sm"
                className="h-[48px] rounded-lg"
              >
                + Neue Kategorie
              </Button>
            </div>
          )}

          {/* Main Content Routes */}
          <Routes>
            <Route 
              path="/week" 
              element={<WeekPage />} 
            />
            <Route 
              path="/" 
              element={
                <>
                  {activeCategories.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl">
                      <p className="text-muted-foreground text-lg">
                        Noch keine Kategorien vorhanden
                      </p>
                      <p className="text-muted-foreground">
                        Erstelle deine erste Kategorie, um mit dem Tracking zu beginnen
                      </p>
                      <Button onClick={handleAddCategory} className="mt-4" variant="outline">
                        + Neue Kategorie erstellen
                      </Button>
                    </div>
                  ) : (
                    <CategoryGrid
                      categories={activeCategories}
                      onSelect={handleSelectCategory}
                      onEdit={handleEditCategory}
                      onDelete={handleDeleteCategory}
                    />
                  )}
                  
                  {/* Footer mit Credits */}
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Made with ❤️ and help from my AI friends
                    </p>
                  </div>
                </>
              }
            />
          </Routes>

          <CategoryDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSubmit={handleDialogSubmit}
            initialCategory={editingCategory}
            mode={dialogMode}
          />
        </div>
      </div>
    </div>
  )
}

export default App
