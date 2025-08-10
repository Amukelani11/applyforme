"use client"

import { createContext, useContext } from 'react'

export interface TourStep {
  path: string
  title: string
  content: string
  selector?: string
}

export interface TourContextValue {
  steps: TourStep[]
  isOpen: boolean
  stepIndex: number
  start: () => void
  next: () => void
  prev: () => void
  skip: () => void
  complete: () => void
}

export const TourContext = createContext<TourContextValue | null>(null)

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}


