import * as React from 'react'
import { useEffect } from 'react'
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
    const [displayDuration, setDisplayDuration] = React.useState(0)
    const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    
    const { session, getCurrentDuration } = useTrackingStore()
    const { onCategoryClick } = useSyncStore()
    
    const isActive = session.categoryId === category.id && session.isRunning
    
    // 🔥 FIX: Aktualisiere Kategorie-Zeit alle 100ms automatisch, nicht nur bei Hover
    useEffect(() => {
      if (!isActive) return
      
      const updateInterval = setInterval(() => {
        setDisplayDuration(getCurrentDuration())
      }, 100)  // 100ms für flüssige Anzeige (10 FPS für Timer)
      
      return () => clearInterval(updateInterval)
    }, [isActive, getCurrentDuration])
    
    // Initialwert setzen
    useEffect(() => {
      if (isActive) {
        setDisplayDuration(getCurrentDuration())
      }
    }, [isActive, getCurrentDuration])
    
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

    // Glass-Chic: Border-Farbe mit Transparenz für elegantes Design
    const borderColorStyle = category.color 
      ? { borderColor: `${category.color}80`, borderWidth: '3px' } // 50% opacity (80 in hex)
      : undefined

    return (
      <div
        ref={ref}
        style={borderColorStyle}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border p-6 shadow-sm transition-all duration-200',
          'min-h-[180px] min-w-[140px]',
          'bg-white/5 backdrop-blur-sm', // Glassmorphism base
          isPressed && 'scale-95 bg-accent/80',
          isActive && 'shadow-lg bg-primary/10 border-primary/60',
          !isActive && !category.color && 'hover:shadow-md hover:border-gray-300/50 border-gray-200/30',
          !isActive && category.color && 'hover:shadow-md hover:brightness-105'
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
          'text-6xl leading-none select-none',
          isActive && 'text-primary opacity-100',
          !isActive && 'opacity-80'
        )}>
          {category.emoji}
        </div>
        
        <div className="text-center w-full flex-1 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-foreground">
            {category.name}
          </h3>
        </div>

        {isActive && (
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-sm">
            {formatDuration(displayDuration)}
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
