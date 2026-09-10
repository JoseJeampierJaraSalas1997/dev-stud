import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * The design system's type scale lives in the `text-*` namespace alongside
 * colours (`text-label-sm` vs `text-primary`). tailwind-merge only knows the
 * stock scale, so without this it classifies every one of these as a text
 * COLOUR and silently drops the size when a colour is merged in after it —
 * e.g. cn('text-label-sm', 'text-primary') loses the 9px entirely.
 */
const TYPE_SCALE = [
  'display-lg',
  'display-lg-mobile',
  'headline-lg',
  'headline-md',
  'headline-sm',
  'body-lg',
  'body-md',
  'body-sm',
  'label-lg',
  'label-md',
  'label-sm',
] as const

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...TYPE_SCALE] }],
      'font-family': [{ font: [...TYPE_SCALE] }],
    },
  },
})

/** Merge conditional class lists, letting later Tailwind utilities win. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
