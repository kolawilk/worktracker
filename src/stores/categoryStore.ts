import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category } from '@/types'

interface CategoryStore {
  categories: Category[]
  addCategory: (name: string, emoji: string, color?: string) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  restoreCategory: (id: string) => void
  getAllCategories: () => Category[]
  getActiveCategories: () => Category[]
}

const STORAGE_KEY = 'worktracker-categories'

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: [],

      addCategory: (name, emoji, color) => {
        const newCategory: Category = {
          id: crypto.randomUUID(),
          name,
          emoji,
          color,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          categories: [...state.categories, newCategory],
        }))
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        }))
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id
              ? { ...cat, isDeleted: true, deletedAt: new Date().toISOString() }
              : cat
          ),
        }))
      },

      restoreCategory: (id) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, isDeleted: false, deletedAt: undefined } : cat
          ),
        }))
      },

      getAllCategories: () => {
        return get().categories
      },

      getActiveCategories: () => {
        return get().categories.filter((cat) => !cat.isDeleted)
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
)
