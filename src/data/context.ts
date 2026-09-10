import { createContext } from 'react'
import type { DataSource } from './types'

/** Lives apart from the provider so the provider file only exports components. */
export const DataSourceContext = createContext<DataSource | null>(null)
