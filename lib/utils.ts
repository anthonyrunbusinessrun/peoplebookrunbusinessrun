import { clsx, type ClassValue } from 'clsx'
export const cn = (...i: ClassValue[]) => clsx(i)
export const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
export const getStatusBadge = (s: string) =>
  s === 'Open' ? 'badge-open' : s === 'Filled' ? 'badge-filled' : 'badge-onhold'
