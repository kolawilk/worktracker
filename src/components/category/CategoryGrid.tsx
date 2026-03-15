import * as React from 'react'
import { CategoryCard } from './CategoryCard'
import type { Category } from '@/types'
import { cn } from '@/lib/utils'

interface CategoryGridProps {
  categories: Category[]
  onSelect?: (category: Category) => void
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
}

const CategoryGrid = React.forwardRef<HTMLDivElement, CategoryGridProps>(
  ({ categories, onSelect, onEdit, onDelete }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid gap-4',
          'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
          'min-[768px]:grid-cols-3'
        )}
        role="list"
        aria-label="Kategorien"
      >
        {categories.map((category) => (
          <div key={category.id} role="listitem">
            <CategoryCard
              category={category}
              onSelect={() => onSelect?.(category)}
              onEdit={() => onEdit?.(category)}
              onDelete={() => onDelete?.(category)}
            />
          </div>
        ))}
      </div>
    )
  }
)

CategoryGrid.displayName = 'CategoryGrid'

export { CategoryGrid }
