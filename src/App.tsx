import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CategoryGrid } from '@/components/category/CategoryGrid'
import { CategoryDialog } from '@/components/category/CategoryDialog'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTrackingStore } from '@/stores/trackingStore'
import { useWorkDayStore } from '@/stores/workDayStore'
import { Link, Routes, Route, useLocation } from 'react-router-dom'
import WeekPage from '@/pages/WeekPage'
import DayPage from '@/pages/DayPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsPage from '@/pages/SettingsPage'
import type { Category } from '@/types'
import { Play, Pause, Square, List, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'
import { FeierabendDialog } from '@/components/workday/FeierabendDialog'
import './App.css'

function App() {
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [isFeierabendDialogOpen, setIsFeierabendDialogOpen] = useState(false)
  const [feierabendFromButton, setFeierabendFromButton] = useState(false)
  const location = useLocation()
  
  const { addCategory, updateCategory, deleteCategory, getActiveCategories } = useCategoryStore()
  const { currentWorkDay, startWorkDay, pauseWorkDay, resumeWorkDay, endWorkDay } = useWorkDayStore()
  useTrackingStore()

  const activeCategories = getActiveCategories()

  // Öffne FeierabendDialog automatisch, wenn Arbeitstag beendet wird
  useEffect(() => {
    if (currentWorkDay && currentWorkDay.endTime && !isFeierabendDialogOpen) {
      // Öffne Dialog nur wenn es nicht vom Button kam
      if (!feierabendFromButton) {
        setIsFeierabendDialogOpen(true)
      }
      // Reset nach Öffnen
      if (isFeierabendDialogOpen) {
        setFeierabendFromButton(false)
      }
    }
  }, [currentWorkDay?.endTime, isFeierabendDialogOpen, feierabendFromButton])

  const isWeekPage = location.pathname === '/week'
  const isDayPage = location.pathname === '/day'
  const isSidebarPage = !isWeekPage && !isDayPage

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
        label: 'Arbeitstag beendet — Klicke Start für neuen Tag',
        colorClass: 'text-blue-600 dark:text-blue-400',
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
    // Beende Arbeitstag
    endWorkDay()
    // Setze Flag, dass der Dialog vom Button kam (kein Spruch anzeigen)
    setFeierabendFromButton(true)
    // Öffne FeierabendDialog manuell (ohne Spruch)
    setIsFeierabendDialogOpen(true)
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
          <Link to="/day" title="Tages-Übersicht">
            <Button 
              variant={location.pathname === '/day' ? 'default' : 'ghost'} 
              className="rounded-xl"
              size="icon"
            >
              <List className="h-5 w-5" />
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
          <Link to="/analytics" title="Analytics Dashboard">
            <Button 
              variant={location.pathname === '/analytics' ? 'default' : 'ghost'} 
              className="rounded-xl"
              size="icon"
            >
              <TrendingUp className="h-5 w-5" />
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
      <div className={isWeekPage || isDayPage ? "p-6" : "pl-[64px] p-6"}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header - kompakt, keine separaten Header-Bereich */}
          {isSidebarPage && (
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
                        : status.status === 'ended'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                  onClick={handleStartPause}
                  disabled={status.status === 'running'}
                  aria-label={status.status === 'running' ? 'Pause' : 'Start'}
                >
                  {status.status === 'running' ? (
                    <Pause className="h-6 w-6" />
                  ) : status.status === 'ended' ? (
                    <Play className="h-6 w-6" />
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
                        ? 'text-blue-600 dark:text-blue-400'
                        : status.status === 'paused'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-foreground'
                    )}>
                      {formatDuration(workTime)}
                    </div>
                    {status.status === 'ended' && (
                      <div className="text-xs text-muted-foreground">Beendet — Klicke Start für neuen Tag</div>
                    )}
                  </div>
                </div>

                {/* Feierabend Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-[48px] w-[48px] rounded-lg transition-all duration-200 flex-shrink-0',
                    'hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300',
                    (status.status === 'not-started' || status.status === 'ended') && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={handleEndWorkDay}
                  disabled={status.status === 'not-started' || status.status === 'ended'}
                  title="Feierabend"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs font-bold">Feierabend</span>
                    <Square className="h-4 w-4" />
                  </div>
                </Button>
              </div>

              {/* Rechts: Neue Kategorie Button, Feierabend Button und Theme Switcher */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleAddCategory} 
                  size="sm"
                  className="h-[48px] rounded-lg"
                >
                  + Neue Kategorie
                </Button>
                <ThemeSwitcher />
              </div>
            </div>
          )}

          {/* Main Content Routes */}
          <Routes>
            <Route 
              path="/day" 
              element={<DayPage />} 
            />
            <Route 
              path="/week" 
              element={<WeekPage />} 
            />
            <Route 
              path="/analytics" 
              element={<AnalyticsPage />} 
            />
            <Route 
              path="/settings" 
              element={<SettingsPage />} 
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
          
          {/* FeierabendDialog */}
          <FeierabendDialog
            isOpen={isFeierabendDialogOpen}
            onClose={() => setIsFeierabendDialogOpen(false)}
            showQuote={!feierabendFromButton}
          />
        </div>
      </div>
    </div>
  )
}

export default App
