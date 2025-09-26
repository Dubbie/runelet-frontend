import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EquipmentSlotName, Item, EquipmentStat } from '@/interfaces'
import { enrichItemData } from '@/utils/item-enhancer'

// --- TYPE DEFINITIONS ---
// These interfaces define the shape of our data.

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

export const createNewLoadout = (name: string): Loadout => ({
  id: crypto.randomUUID(),
  name,
  notes: '',
  equippedItems: createInitialEquippedItems(),
  inventoryItems: Array(28).fill(null),
  prayerPresets: [],
  spellbook: 'standard',
})

export const createInitialBlueprint = (): Blueprint => ({
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
  const dragPayload = ref<DragPayload | null>(null)

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

  // ===================================================================
  // --- INTERNAL HELPER ACTIONS ---
  // ===================================================================

  /**
   * Internal helper to add an item to the first available inventory slot.
   * This is the single source of truth for this logic.
   * @returns {boolean} - True if successful, false if inventory is full.
   */
  function _addItemToInventory(item: Item): boolean {
    const loadout = activeLoadout.value
    if (!loadout) return false

    const emptyIndex = loadout.inventoryItems.findIndex((i) => i === null)
    if (emptyIndex !== -1) {
      loadout.inventoryItems[emptyIndex] = enrichItemData(item)
      return true
    }
    return false
  }

  // ===================================================================
  // --- PUBLIC ACTIONS ---
  // ===================================================================
  // Dragging
  function startDrag(source: DragSource, item: Item) {
    dragPayload.value = { source, item }
  }

  function endDrag() {
    dragPayload.value = null
  }

  // Blueprint
  function setBlueprintTitle(title: string) {
    blueprint.value.title = title
  }
  function setBlueprintDescription(description: string) {
    blueprint.value.description = description
  }

  // Loadout Management
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

  // ===================================================================
  // --- CORE ITEM MANAGEMENT ---
  // ===================================================================
  /**
   * The single, authoritative action for equipping an item.
   * It handles all logic for 1H/2H/Shield interactions and correctly
   * performs swaps when an item is equipped from the inventory.
   *
   * @param itemToEquip The item to put on.
   * @param fromInventoryIndex (Optional) The inventory index the item is coming from.
   */
  function equipItem(itemToEquip: Item, fromInventoryIndex?: number) {
    const loadout = activeLoadout.value
    if (!loadout || !itemToEquip.equipment_stats) return

    const { slot: newItemSlot } = itemToEquip.equipment_stats
    const { equippedItems } = loadout

    // Use a Set to automatically prevent duplication bugs.
    const displacedItems = new Set<Item>()
    let primaryDisplacedItem: Item | null = null

    // 1. Determine which items will be displaced based on CLEAR rules.
    if (newItemSlot === '2h') {
      // Rule: A 2H weapon displaces whatever is in the weapon AND shield slots.
      if (equippedItems.weapon) displacedItems.add(equippedItems.weapon)
      if (equippedItems.shield) displacedItems.add(equippedItems.shield)
      primaryDisplacedItem = equippedItems.weapon // The main swap target is the weapon
    } else if (newItemSlot === 'weapon') {
      // Rule: A 1H weapon displaces whatever is in the weapon slot.
      if (equippedItems.weapon) displacedItems.add(equippedItems.weapon)
      primaryDisplacedItem = equippedItems.weapon
    } else if (newItemSlot === 'shield') {
      // Rule: A shield displaces an existing shield AND any equipped 2H weapon.
      if (equippedItems.shield) displacedItems.add(equippedItems.shield)
      // Check if the EQUIPPED WEAPON is a 2H item.
      if (equippedItems.weapon && equippedItems.weapon.equipment_stats?.slot === '2h') {
        displacedItems.add(equippedItems.weapon)
      }
      primaryDisplacedItem = equippedItems.shield
    } else {
      // Rule: Any other item displaces what's in its own slot.
      if (equippedItems[newItemSlot]) displacedItems.add(equippedItems[newItemSlot]!)
      primaryDisplacedItem = equippedItems[newItemSlot]
    }

    // 2. Clear all affected slots before equipping the new item.
    displacedItems.forEach((item) => {
      const slotToClear = item.equipment_stats?.slot
      if (slotToClear === '2h') {
        equippedItems.weapon = null
      } else if (slotToClear) {
        equippedItems[slotToClear] = null
      }
    })

    // 3. Equip the new item. A 2H weapon goes into the 'weapon' slot.
    const targetSlot = newItemSlot === '2h' ? 'weapon' : newItemSlot
    equippedItems[targetSlot] = itemToEquip
    // If we equipped a 1H weapon or shield, ensure the 2H slot is clear (it's not used for display).
    if (newItemSlot === 'weapon' || newItemSlot === 'shield') {
      equippedItems['2h'] = null
    }

    // 4. Handle the displaced items.
    if (fromInventoryIndex !== undefined) {
      // If this was a swap, the primary displaced item goes back to the specific inventory slot.
      setInventoryItem(fromInventoryIndex, primaryDisplacedItem)
      // Remove it from the set so it's not added to inventory twice.
      if (primaryDisplacedItem) {
        displacedItems.delete(primaryDisplacedItem)
      }
    }

    // Any remaining displaced items (e.g., a shield from a 2H equip) go to the first empty slot.
    displacedItems.forEach((item) => _addItemToInventory(item))
  }

  /**
   * Unequips an item from a slot and moves it to the inventory.
   */
  function unequipItem(slot: EquipmentSlotName) {
    const loadout = activeLoadout.value
    const itemToUnequip = loadout?.equippedItems[slot]
    if (!loadout || !itemToUnequip) return

    if (_addItemToInventory(itemToUnequip)) {
      loadout.equippedItems[slot] = null
    } else {
      console.warn('Cannot unequip, inventory is full.')
    }
  }

  /**
   * Adds an item to the first available inventory slot.
   * Public-facing wrapper for the internal helper.
   */
  function addItemToInventory(item: Item): boolean {
    return _addItemToInventory(item)
  }

  /**
   * Sets or clears an item at a specific inventory index.
   */
  function setInventoryItem(index: number, item: Item | null) {
    const loadout = activeLoadout.value
    if (loadout && index >= 0 && index < 28) {
      // 2. Enrich the item before placing it in the state.
      loadout.inventoryItems[index] = enrichItemData(item)
    }
  }

  /**
   * Moves an item from one inventory slot to another.
   */
  function moveInventoryItem(fromIndex: number, toIndex: number) {
    const loadout = activeLoadout.value
    if (!loadout || fromIndex === toIndex) return
    const items = [...loadout.inventoryItems]
    const [movedItem] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, movedItem)
    loadout.inventoryItems = items
  }

  /**
   * Swaps an item between an equipment slot and a specific inventory slot.
   */
  function swapEquipmentAndInventoryItem(slot: EquipmentSlotName, invIndex: number) {
    const loadout = activeLoadout.value
    if (!loadout) return
    const itemFromEquip = loadout.equippedItems[slot]
    const itemFromInv = loadout.inventoryItems[invIndex]

    // 3. We only need to enrich the item coming FROM equipment, as the
    // one from inventory is already enriched.
    loadout.inventoryItems[invIndex] = enrichItemData(itemFromEquip)

    if (itemFromInv && itemFromInv.equipment_stats?.slot === slot) {
      loadout.equippedItems[slot] = itemFromInv
    } else {
      loadout.equippedItems[slot] = null
    }
  }
  /**
   * Equips an item from a specific inventory slot, swapping with the equipped item.
   */
  function equipFromInventory(item: Item, fromIndex: number) {
    equipItem(item, fromIndex)
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

  function updateRunePouch(inventoryIndex: number, newRunes: (Item | null)[]) {
    const loadout = activeLoadout.value
    if (!loadout) return

    const pouch = loadout.inventoryItems[inventoryIndex]

    // Verify that the item is indeed a pouch before updating
    if (pouch && pouch.rune_pouch_slots) {
      pouch.stored_runes = newRunes
    } else {
      console.warn('Attempted to update runes on a non-pouch item.')
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
    dragPayload,
    // Getters
    activeLoadout,
    activeEquippedItems,
    activeInventoryItems,
    activePrayerPresets,
    activeSpellbook,
    totalBonuses,
    // Actions
    startDrag,
    endDrag,
    setBlueprintTitle,
    setBlueprintDescription,
    addLoadout,
    removeLoadout,
    renameLoadout,
    setActiveLoadout,
    equipItem,
    unequipItem,
    swapEquipmentAndInventoryItem,
    addItemToInventory,
    setInventoryItem,
    moveInventoryItem,
    equipFromInventory,
    setSpellbook,
    addPrayerPreset,
    updatePrayerPreset,
    removePrayerPreset,
    setPlayerStat,
    updateRunePouch,
  }
})
