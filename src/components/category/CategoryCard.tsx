import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTrackingStore } from '@/stores/trackingStore'
import { useSyncStore } from '@/stores/syncStore'
import type { Category } from '@/types'

interface CategoryCardProps {
  category: Category
  onSelect?: (category: Category) => void
  onEdit?: () => void
  onDelete?: () => void
  onLongPress?: () => void
}

const CategoryCard = React.forwardRef<HTMLDivElement, CategoryCardProps>(
  ({ category, onSelect, onEdit, onDelete, onLongPress }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const [isPressed, setIsPressed] = React.useState(false)
    const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    
    const { session, getCurrentDuration } = useTrackingStore()
    const { onCategoryClick } = useSyncStore()
    
    const isActive = session.categoryId === category.id && session.isRunning
    const duration = getCurrentDuration()
    
    const formatDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }

    const handleCardClick = () => {
      onCategoryClick(category.id)
      onSelect?.(category)
    }

    const handleMouseDown = () => {
      setIsPressed(true)
      longPressTimer.current = setTimeout(() => {
        setIsPressed(false)
        onLongPress?.()
      }, 500)
    }

    const handleMouseUp = () => {
      setIsPressed(false)
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      setIsPressed(false)
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }

    // Default-Farbe wenn keine gewählt (grau)
    const displayColor = category.color || '#9ca3af'
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border p-6 shadow-sm transition-all duration-200',
          'hover:shadow-md hover:border-primary',
          'active:scale-95',
          'min-h-[180px] min-w-[140px]',
          isPressed && 'scale-95 bg-accent',
          isHovered && 'border-primary',
          isActive && 'border-primary bg-primary/5'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleCardClick}
        role="button"
        aria-label={`Category ${category.name}`}
        aria-pressed={isActive}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleCardClick()
          }
        }}
      >
        <div className={cn(
          'text-6xl leading-none select-none transition-colors duration-300',
          isActive && 'text-primary'
        )}>
          {category.emoji}
        </div>
        
        <div className="text-center w-full flex-1 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-foreground">
            {category.name}
          </h3>
          {/* Farb-Balken immer mit gleicher Größe, damit Grid stabil bleibt */}
          <div
            className="mt-2 h-2 w-8 rounded-full mx-auto transition-colors duration-300"
            style={{ 
              backgroundColor: isActive ? '#3b82f6' : displayColor 
            }}
            aria-hidden="true"
          />
        </div>

        {isActive && (
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-sm">
            {formatDuration(duration)}
          </div>
        )}

        <div
          className={cn(
            'absolute right-2 top-2 flex gap-1',
            isHovered ? 'opacity-100' : 'opacity-0',
            isActive && 'opacity-0'
          )}
        >
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.()
            }}
            title="Bearbeiten"
          >
            ✏️
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            title="Löschen"
          >
            🗑️
          </Button>
        </div>

        {isActive && (
          <div className="absolute -bottom-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            Aktiv
          </div>
        )}
      </div>
    )
  }
)

CategoryCard.displayName = 'CategoryCard'

export { CategoryCard }
