import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CategoryGrid } from '@/components/category/CategoryGrid'
import { CategoryDialog } from '@/components/category/CategoryDialog'
import { ActiveTracker } from '@/components/tracking/ActiveTracker'
import { WorkDayToolbar } from '@/components/workday/WorkDayToolbar'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTrackingStore } from '@/stores/trackingStore'
import { Link, Routes, Route, useLocation } from 'react-router-dom'
import WeekPage from '@/pages/WeekPage'
import type { Category } from '@/types'
import './App.css'

function App() {
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const location = useLocation()
  
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore()
  useTrackingStore()

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
          {/* Header mit WorkDayToolbar integriert */}
          {!isWeekPage && (
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-2xl font-bold text-foreground">
                ⏱️ Worktracker
              </h1>
              
              {/* WorkDayToolbar integriert in Header mitte */}
              <WorkDayToolbar />
              
              <Button onClick={handleAddCategory} size="sm">
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
                  {categories.length === 0 ? (
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
                      categories={categories}
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

          <ActiveTracker />

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
