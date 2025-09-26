import { ref, computed, watch, type Ref } from 'vue'
import { createNewLoadout } from '@/stores/blueprint' // We still need the data creation helpers
import { enrichItemData } from '@/utils/item-enhancer'
import type {
  Blueprint,
  Loadout,
  Item,
  EquipmentSlotName,
  Spellbook,
  PrayerPreset,
  DragPayload,
  DragSource,
  EquipmentStat,
} from '@/interfaces'

/**
 * A self-contained composable for managing all state and logic of a single blueprint.
 * It is driven by a reactive ref to a blueprint object, making it fully portable
 * and decoupled from any global store.
 *
 * @param initialBlueprint A reactive reference (Ref) to the blueprint data.
 */
export function useBlueprint(initialBlueprint: Ref<Blueprint>) {
  // --- STATE ---
  const blueprint = initialBlueprint
  const activeLoadoutId = ref<string | null>(blueprint.value.loadouts[0]?.id ?? null)
  const dragPayload = ref<DragPayload | null>(null)

  // --- COMPUTED PROPERTIES ---
  const activeLoadout = computed<Loadout | undefined>(() =>
    blueprint.value.loadouts.find((l) => l.id === activeLoadoutId.value),
  )

  const activeEquippedItems = computed(() => activeLoadout.value?.equippedItems)
  const activeInventoryItems = computed(() => activeLoadout.value?.inventoryItems)
  const activePrayerPresets = computed(() => activeLoadout.value?.prayerPresets)
  const activeSpellbook = computed(() => activeLoadout.value?.spellbook)

  const loadoutTabs = computed(() => {
    return blueprint.value.loadouts.map((loadout) => ({
      id: loadout.id,
      label: loadout.name,
    }))
  })

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

  // --- INTERNAL HELPER (UNCHANGED LOGIC) ---
  function _addItemToInventory(item: Item): boolean {
    if (!activeLoadout.value) return false
    const emptyIndex = activeLoadout.value.inventoryItems.findIndex((i) => i === null)
    if (emptyIndex !== -1) {
      activeLoadout.value.inventoryItems[emptyIndex] = enrichItemData(item)
      return true
    }
    return false
  }

  // --- ACTIONS (ALL LOGIC MOVED HERE) ---

  // Dragging
  const startDrag = (source: DragSource, item: Item) => {
    dragPayload.value = { source, item }
  }
  const endDrag = () => {
    dragPayload.value = null
  }

  // Loadout Management
  const addLoadout = (name = 'New Loadout') => {
    const newLoadout = createNewLoadout(name)
    blueprint.value.loadouts.push(newLoadout)
    activeLoadoutId.value = newLoadout.id
  }

  const removeLoadout = (id: string) => {
    if (blueprint.value.loadouts.length <= 1) return
    blueprint.value.loadouts = blueprint.value.loadouts.filter((l) => l.id !== id)
  }

  const renameLoadout = (id: string, newName: string) => {
    const loadout = blueprint.value.loadouts.find((l) => l.id === id)
    if (loadout && newName.trim()) {
      loadout.name = newName.trim()
    }
  }

  const setActiveLoadout = (id: string) => {
    if (blueprint.value.loadouts.some((l) => l.id === id)) {
      activeLoadoutId.value = id
    }
  }

  // Core Item Management
  const equipItem = (itemToEquip: Item, fromInventoryIndex?: number) => {
    if (!activeLoadout.value || !itemToEquip.equipment_stats) return

    const loadout = activeLoadout.value
    const { slot: newItemSlot } = itemToEquip.equipment_stats
    const { equippedItems } = loadout
    const displacedItems = new Set<Item>()
    let primaryDisplacedItem: Item | null = null

    if (newItemSlot === '2h') {
      if (equippedItems.weapon) displacedItems.add(equippedItems.weapon)
      if (equippedItems.shield) displacedItems.add(equippedItems.shield)
      primaryDisplacedItem = equippedItems.weapon
    } else if (newItemSlot === 'weapon') {
      if (equippedItems.weapon) displacedItems.add(equippedItems.weapon)
      primaryDisplacedItem = equippedItems.weapon
    } else if (newItemSlot === 'shield') {
      if (equippedItems.shield) displacedItems.add(equippedItems.shield)
      if (equippedItems.weapon?.equipment_stats?.slot === '2h') {
        displacedItems.add(equippedItems.weapon)
      }
      primaryDisplacedItem = equippedItems.shield
    } else {
      if (equippedItems[newItemSlot]) displacedItems.add(equippedItems[newItemSlot]!)
      primaryDisplacedItem = equippedItems[newItemSlot]
    }

    displacedItems.forEach((item) => {
      const slotToClear = item.equipment_stats?.slot
      if (slotToClear === '2h') {
        equippedItems.weapon = null
      } else if (slotToClear) {
        equippedItems[slotToClear] = null
      }
    })

    const targetSlot = newItemSlot === '2h' ? 'weapon' : newItemSlot
    equippedItems[targetSlot] = itemToEquip
    if (newItemSlot === 'weapon' || newItemSlot === 'shield') {
      equippedItems['2h'] = null
    }

    if (fromInventoryIndex !== undefined) {
      setInventoryItem(fromInventoryIndex, primaryDisplacedItem)
      if (primaryDisplacedItem) {
        displacedItems.delete(primaryDisplacedItem)
      }
    }

    displacedItems.forEach((item) => _addItemToInventory(item))
  }

  const unequipItem = (slot: EquipmentSlotName) => {
    if (!activeLoadout.value) return
    const itemToUnequip = activeLoadout.value.equippedItems[slot]
    if (!itemToUnequip) return

    if (_addItemToInventory(itemToUnequip)) {
      activeLoadout.value.equippedItems[slot] = null
    } else {
      console.warn('Cannot unequip, inventory is full.')
    }
  }

  const addItemToInventory = (item: Item): boolean => {
    // It uses the internal helper, just like the old store did
    return _addItemToInventory(item)
  }

  const setInventoryItem = (index: number, item: Item | null) => {
    if (activeLoadout.value && index >= 0 && index < 28) {
      activeLoadout.value.inventoryItems[index] = enrichItemData(item)
    }
  }

  const moveInventoryItem = (fromIndex: number, toIndex: number) => {
    if (!activeLoadout.value || fromIndex === toIndex) return
    const items = [...activeLoadout.value.inventoryItems]
    const [movedItem] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, movedItem)
    activeLoadout.value.inventoryItems = items
  }

  const equipFromInventory = (item: Item, fromIndex: number) => {
    equipItem(item, fromIndex)
  }

  const swapEquipmentAndInventoryItem = (slot: EquipmentSlotName, invIndex: number) => {
    if (!activeLoadout.value) return

    const loadout = activeLoadout.value
    const itemFromEquip = loadout.equippedItems[slot]
    const itemFromInv = loadout.inventoryItems[invIndex]

    // Place the equipped item into the inventory, ensuring it's enriched.
    loadout.inventoryItems[invIndex] = enrichItemData(itemFromEquip)

    // Now, determine if the inventory item can be equipped in the target slot.
    if (itemFromInv && itemFromInv.equipment_stats?.slot === slot) {
      // If it's a valid swap, use our existing equipItem logic.
      // This correctly handles 1h/2h/shield interactions.
      equipItem(itemFromInv, invIndex)
    } else {
      // If the inventory item isn't valid for that slot (or the slot was empty),
      // just clear the equipment slot.
      loadout.equippedItems[slot] = null
    }
  }

  // Loadout Details Management
  const setSpellbook = (book: Spellbook) => {
    if (activeLoadout.value) {
      activeLoadout.value.spellbook = book
    }
  }

  const addPrayerPreset = (name = 'New Preset') => {
    if (activeLoadout.value) {
      activeLoadout.value.prayerPresets.push({
        id: crypto.randomUUID(),
        name,
        prayers: [],
      })
    }
  }

  const updatePrayerPreset = (id: string, newPreset: Partial<PrayerPreset>) => {
    const preset = activeLoadout.value?.prayerPresets.find((p) => p.id === id)
    if (preset) {
      Object.assign(preset, newPreset)
    }
  }

  const removePrayerPreset = (id: string) => {
    if (activeLoadout.value) {
      activeLoadout.value.prayerPresets = activeLoadout.value.prayerPresets.filter(
        (p) => p.id !== id,
      )
    }
  }

  const updateRunePouch = (inventoryIndex: number, newRunes: (Item | null)[]) => {
    if (!activeLoadout.value) return
    const pouch = activeLoadout.value.inventoryItems[inventoryIndex]
    if (pouch && pouch.rune_pouch_slots) {
      pouch.stored_runes = newRunes
    }
  }

  const updateLoadoutNotes = (newNotes: string) => {
    if (activeLoadout.value) {
      activeLoadout.value.notes = newNotes
    }
  }

  // --- WATCHER ---
  // Ensures the activeLoadoutId is always valid if the loadouts array changes externally.
  watch(
    () => blueprint.value.loadouts,
    (newLoadouts) => {
      const currentLoadoutExists = newLoadouts.some((l) => l.id === activeLoadoutId.value)
      if (!currentLoadoutExists) {
        activeLoadoutId.value = newLoadouts[0]?.id ?? null
      }
    },
    { deep: true },
  )

  // --- PUBLIC API ---
  return {
    // State
    blueprint,
    activeLoadoutId,
    dragPayload,

    // Computed
    activeLoadout,
    activeEquippedItems,
    activeInventoryItems,
    activePrayerPresets,
    activeSpellbook,
    loadoutTabs,
    totalBonuses,

    // Actions
    startDrag,
    endDrag,
    addLoadout,
    removeLoadout,
    renameLoadout,
    setActiveLoadout,
    equipItem,
    unequipItem,
    addItemToInventory,
    setInventoryItem,
    moveInventoryItem,
    equipFromInventory,
    swapEquipmentAndInventoryItem,

    setSpellbook,
    addPrayerPreset,
    updatePrayerPreset,
    removePrayerPreset,
    updateRunePouch,
    updateLoadoutNotes,
  }
}
