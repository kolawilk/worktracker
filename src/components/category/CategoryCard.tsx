import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface CategoryCardProps {
  category: Category
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onLongPress?: () => void
}

const CategoryCard = React.forwardRef<HTMLDivElement, CategoryCardProps>(
  ({ category, onSelect, onEdit, onDelete, onLongPress }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const [isPressed, setIsPressed] = React.useState(false)
    const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

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
        onSelect?.()
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

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-6 shadow-sm transition-all duration-200',
          'hover:shadow-md hover:border-primary',
          'active:scale-95',
          isPressed && 'scale-95 bg-accent',
          isHovered && 'border-primary'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        role="button"
        aria-label={`Category ${category.name}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect?.()
          }
        }}
      >
        <div className="text-6xl leading-none select-none">
          {category.emoji}
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {category.name}
          </h3>
          {category.color && (
            <div
              className="mt-2 h-2 w-8 rounded-full mx-auto"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
          )}
        </div>

        <div
          className={cn(
            'absolute right-2 top-2 flex gap-1',
            isHovered ? 'opacity-100' : 'opacity-0'
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
      </div>
    )
  }
)

CategoryCard.displayName = 'CategoryCard'

export { CategoryCard }
