import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CategoryGrid } from '@/components/category/CategoryGrid'
import { CategoryDialog } from '@/components/category/CategoryDialog'
import { ActiveTracker } from '@/components/tracking/ActiveTracker'
import { WorkDayToolbar } from '@/components/workday/WorkDayToolbar'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTrackingStore } from '@/stores/trackingStore'
import type { Category } from '@/types'
import './App.css'

function App() {
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header mit WorkDayToolbar integriert */}
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

        {/* Active Tracker Section */}
        <ActiveTracker />

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

        <CategoryDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleDialogSubmit}
          initialCategory={editingCategory}
          mode={dialogMode}
        />
      </div>
    </div>
  )
}

export default App
