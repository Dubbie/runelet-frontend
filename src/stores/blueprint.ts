import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EquipmentSlotName, Item, EquipmentStat } from '@/interfaces'

// --- TYPE DEFINITIONS ---
// These interfaces define the shape of our data.

export type Spellbook = 'standard' | 'ancient' | 'lunar' | 'arceuus'

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

type PlayerStats = Record<'attack' | 'strength' | 'defence' | 'ranged' | 'magic' | 'prayer', number>

// --- HELPER FUNCTIONS ---
// These create the default state for our objects.

const createInitialEquippedItems = (): Record<EquipmentSlotName, Item | null> => ({
  head: null,
  cape: null,
  neck: null,
  ammo: null,
  weapon: null,
  body: null,
  shield: null,
  legs: null,
  hands: null,
  feet: null,
  ring: null,
  '2h': null,
})

const createNewLoadout = (name: string): Loadout => ({
  id: crypto.randomUUID(),
  name,
  notes: '',
  equippedItems: createInitialEquippedItems(),
  inventoryItems: Array(28).fill(null),
  prayerPresets: [],
  spellbook: 'standard',
})

const createInitialBlueprint = (): Blueprint => ({
  id: null,
  title: 'Untitled Blueprint',
  description: '',
  loadouts: [createNewLoadout('Default Loadout')],
})

// --- THE STORE ---

export const useBlueprintStore = defineStore('blueprint', () => {
  // --- STATE ---
  const blueprint = ref<Blueprint>(createInitialBlueprint())
  const activeLoadoutId = ref<string | null>(blueprint.value.loadouts[0]?.id ?? null)
  const playerStats = ref<PlayerStats>({
    attack: 99,
    strength: 99,
    defence: 99,
    ranged: 99,
    magic: 99,
    prayer: 99,
  })

  // --- GETTERS (COMPUTED) ---

  // Find the currently active loadout object from the blueprint's array.
  const activeLoadout = computed(() =>
    blueprint.value.loadouts.find((l) => l.id === activeLoadoutId.value),
  )

  // Getters for the active loadout's properties for easier access in components.
  const activeEquippedItems = computed(() => activeLoadout.value?.equippedItems)
  const activeInventoryItems = computed(() => activeLoadout.value?.inventoryItems)
  const activePrayerPresets = computed(() => activeLoadout.value?.prayerPresets)
  const activeSpellbook = computed(() => activeLoadout.value?.spellbook)

  // The total bonus calculation, now dynamically based on the active loadout.
  const totalBonuses = computed(() => {
    const initialBonuses: Omit<EquipmentStat, 'slot' | 'speed' | 'attack_range'> = {
      attack_stab: 0,
      attack_slash: 0,
      attack_crush: 0,
      attack_magic: 0,
      attack_ranged: 0,
      defence_stab: 0,
      defence_slash: 0,
      defence_crush: 0,
      defence_magic: 0,
      defence_ranged: 0,
      melee_strength: 0,
      ranged_strength: 0,
      magic_damage: 0,
      prayer: 0,
    }

    if (!activeLoadout.value) return initialBonuses

    for (const item of Object.values(activeLoadout.value.equippedItems)) {
      if (!item?.equipment_stats) continue
      for (const key in initialBonuses) {
        initialBonuses[key as keyof typeof initialBonuses] +=
          item.equipment_stats[key as keyof typeof initialBonuses] || 0
      }
    }
    return initialBonuses
  })

  // --- ACTIONS ---

  // Blueprint-level Actions
  function setBlueprintTitle(title: string) {
    blueprint.value.title = title
  }
  function setBlueprintDescription(description: string) {
    blueprint.value.description = description
  }

  // Loadout Management Actions
  function addLoadout(name = 'New Loadout') {
    const currentActiveLoadout = activeLoadout.value

    if (currentActiveLoadout) {
      // 1. Perform a deep clone of the active loadout to prevent shared references.
      const clonedLoadout = JSON.parse(JSON.stringify(currentActiveLoadout))

      // 2. Create the new loadout object by overriding the ID and name.
      const newLoadout: Loadout = {
        ...clonedLoadout,
        id: crypto.randomUUID(),
        name: `${currentActiveLoadout.name} (Copy)`, // Suggest a default name
      }

      // 3. Find the index of the current loadout to insert the new one after it.
      const currentIndex = blueprint.value.loadouts.findIndex(
        (l) => l.id === currentActiveLoadout.id,
      )
      blueprint.value.loadouts.splice(currentIndex + 1, 0, newLoadout)

      // 4. Set the new loadout as active.
      activeLoadoutId.value = newLoadout.id
    } else {
      // Fallback to old behavior if for some reason there's no active loadout.
      const newLoadout = createNewLoadout(name)
      blueprint.value.loadouts.push(newLoadout)
      activeLoadoutId.value = newLoadout.id
    }
  }

  function removeLoadout(id: string) {
    if (blueprint.value.loadouts.length <= 1) {
      console.warn('Cannot delete the last loadout. The blueprint must have at least one.')
      return // Exit the function immediately
    }

    blueprint.value.loadouts = blueprint.value.loadouts.filter((l) => l.id !== id)
    // If we deleted the active loadout, switch to the first one available
    if (activeLoadoutId.value === id) {
      activeLoadoutId.value = blueprint.value.loadouts[0]?.id ?? null
    }
  }

  function renameLoadout(id: string, newName: string) {
    const loadout = blueprint.value.loadouts.find((l) => l.id === id)
    if (loadout && newName.trim()) {
      loadout.name = newName.trim()
    }
  }

  function setActiveLoadout(id: string) {
    if (blueprint.value.loadouts.some((l) => l.id === id)) {
      activeLoadoutId.value = id
    }
  }

  // Active Loadout Modification Actions
  function equipItem(item: Item, inventorySlotIndex?: number) {
    const loadout = activeLoadout.value
    if (!loadout || !item.equipment_stats) return

    const slot = item.equipment_stats.slot

    // 2H / Shield handling
    if (slot === '2h') {
      loadout.equippedItems.weapon = null
      loadout.equippedItems.shield = null
    } else if (slot === 'weapon' || slot === 'shield') {
      loadout.equippedItems['2h'] = null
    }

    // Perform the swap: move old item to inventory if the slot is full
    const oldItem = loadout.equippedItems[slot]
    if (oldItem) {
      const targetIndex = inventorySlotIndex ?? loadout.inventoryItems.findIndex((i) => i === null)
      if (targetIndex !== -1) {
        loadout.inventoryItems[targetIndex] = oldItem
      }
    }

    loadout.equippedItems[slot] = item
  }

  function unequipItem(slot: EquipmentSlotName) {
    const loadout = activeLoadout.value
    if (!loadout) return

    const itemToUnequip = loadout.equippedItems[slot]
    if (!itemToUnequip) return

    // Find first empty inventory slot and place it there
    const emptyIndex = loadout.inventoryItems.findIndex((i) => i === null)
    if (emptyIndex !== -1) {
      loadout.inventoryItems[emptyIndex] = itemToUnequip
      loadout.equippedItems[slot] = null
    } else {
      // Optional: Handle full inventory case (e.g., show a notification)
      console.warn('Cannot unequip, inventory is full.')
    }
  }

  function setInventoryItem(index: number, item: Item | null) {
    const loadout = activeLoadout.value
    if (loadout && index >= 0 && index < 28) {
      loadout.inventoryItems[index] = item
    }
  }

  function setSpellbook(book: Spellbook) {
    if (activeLoadout.value) {
      activeLoadout.value.spellbook = book
    }
  }

  function addPrayerPreset(name = 'New Preset') {
    if (activeLoadout.value) {
      activeLoadout.value.prayerPresets.push({
        id: crypto.randomUUID(),
        name,
        prayers: [],
      })
    }
  }

  function updatePrayerPreset(id: string, newPreset: Partial<PrayerPreset>) {
    const preset = activeLoadout.value?.prayerPresets.find((p) => p.id === id)
    if (preset) {
      Object.assign(preset, newPreset)
    }
  }

  function removePrayerPreset(id: string) {
    if (activeLoadout.value) {
      activeLoadout.value.prayerPresets = activeLoadout.value.prayerPresets.filter(
        (p) => p.id !== id,
      )
    }
  }

  function setPlayerStat(skill: keyof PlayerStats, level: number) {
    if (level >= 1 && level <= 99) {
      playerStats.value[skill] = level
    }
  }

  return {
    // State
    blueprint,
    activeLoadoutId,
    playerStats,
    // Getters
    activeLoadout,
    activeEquippedItems,
    activeInventoryItems,
    activePrayerPresets,
    activeSpellbook,
    totalBonuses,
    // Actions
    setBlueprintTitle,
    setBlueprintDescription,
    addLoadout,
    removeLoadout,
    renameLoadout,
    setActiveLoadout,
    equipItem,
    unequipItem,
    setInventoryItem,
    setSpellbook,
    addPrayerPreset,
    updatePrayerPreset,
    removePrayerPreset,
    setPlayerStat,
  }
})
