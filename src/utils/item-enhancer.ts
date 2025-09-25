import type { Item } from '@/interfaces'

const RUNE_POUCH_DATA: Record<number, { slots: number }> = {
  12791: { slots: 3 }, // Rune Pouch
  24416: { slots: 3 }, // Rune Pouch (i)
  30692: { slots: 3 }, // Rune Pouch (castle wars)
  27086: { slots: 3 }, // Rune Pouch (emir's arena)
  23650: { slots: 3 }, // Rune Pouch (lms)

  27281: { slots: 4 }, // Divine Rune Pouch
  27509: { slots: 4 }, // Divine Rune Pouch (i)
}

/**
 * Enriches a standard item object with special properties, like those for a rune pouch.
 * This function should be called whenever an item is added to the blueprint.
 * @param item The original item object from the API.
 * @returns The item object, potentially with new properties.
 */
export function enrichItemData(item: Item | null): Item | null {
  if (!item) {
    return null
  }

  console.log('Enriching item', item)

  const pouchData = RUNE_POUCH_DATA[item.item_id]

  if (pouchData) {
    console.log('item is rune pouch', item, pouchData)

    // This is a rune pouch! Add our special properties.
    return {
      ...item,
      rune_pouch_slots: pouchData.slots,
      // Initialize with an empty array of the correct size
      stored_runes: item.stored_runes || Array(pouchData.slots).fill(null),
    }
  }

  // If it's not a special item, return it as-is.
  return item
}
