import type { Spellbook } from '@/stores/blueprint'

export interface SpellbookData {
  id: Spellbook
  name: string
  imageUrl: string
}

export const SPELLBOOKS_DATA: SpellbookData[] = [
  {
    id: 'standard',
    name: 'Standard spellbook',
    imageUrl: '/images/spellbooks/standard.webp',
  },
  {
    id: 'arceuus',
    name: 'Arceuus spellbook',
    imageUrl: '/images/spellbooks/arceuus.png',
  },
  {
    id: 'ancient',
    name: 'Ancient spellbook',
    imageUrl: '/images/spellbooks/ancient.webp',
  },
  {
    id: 'lunar',
    name: 'Lunar spellbook',
    imageUrl: '/images/spellbooks/lunar.webp',
  },
]

// A helper map to easily look up prayer data by ID
export const SPELLBOOKS_MAP = new Map(SPELLBOOKS_DATA.map((p) => [p.id, p]))
