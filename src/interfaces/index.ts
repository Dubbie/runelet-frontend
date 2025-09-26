export type EquipmentSlotName =
  | 'head'
  | 'cape'
  | 'neck'
  | 'ammo'
  | 'weapon'
  | 'body'
  | 'shield'
  | 'legs'
  | 'hands'
  | 'feet'
  | 'ring'
  | '2h'

export interface ItemRequirement {
  type: 'skill' | 'quest'
  name: string
  level: number | null
}

export interface EquipmentStat {
  slot: EquipmentSlotName
  attack_stab: number
  attack_slash: number
  attack_crush: number
  attack_magic: number
  attack_ranged: number
  defence_stab: number
  defence_slash: number
  defence_crush: number
  defence_magic: number
  defence_ranged: number
  melee_strength: number
  ranged_strength: number
  magic_damage: number
  prayer: number
  speed: number | null
}

export interface Item {
  uuid: string
  item_id: number
  name: string
  examine: string
  image_url: string | null
  flags: {
    is_members: boolean
    is_tradeable: boolean
    is_equipable: boolean
    is_stackable: boolean
    is_noteable: boolean
  }
  wiki_url: string
  equipment_stats: EquipmentStat | null
  requirements: ItemRequirement[]
  rune_pouch_slots?: number
  stored_runes?: (Item | null)[]
}

export interface ApiResponseMeta {
  current_page: number
  from: number
  last_page: number
  path: string
  per_page: number
  to: number
  total: number
}

export interface ApiResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: ApiResponseMeta
}

export type Spellbook = 'standard' | 'ancient' | 'lunar' | 'arceuus'
export type DragSource = 'inventory' | 'item-search' | 'equipment'

export interface DragPayload {
  source: DragSource
  item: Item
}

export interface PrayerPreset {
  id: string // Unique client-side ID
  name: string
  prayers: string[] // Array of prayer names/IDs
}

export interface Loadout {
  id: string // Unique client-side ID
  name: string
  notes: string
  equippedItems: Record<EquipmentSlotName, Item | null>
  inventoryItems: (Item | null)[] // Array of 28 items
  prayerPresets: PrayerPreset[]
  spellbook: Spellbook
}

export interface Blueprint {
  id: string | null // Null for a new, unsaved blueprint
  title: string
  description: string
  loadouts: Loadout[]
}
