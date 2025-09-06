import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EquipmentSlotName, Item } from '@/interfaces'

type EquippedItems = Record<EquipmentSlotName, Item | null>
type PlayerStats = Record<'attack' | 'strength' | 'defence' | 'ranged' | 'magic' | 'prayer', number>

const createInitialEquippedItems = (): EquippedItems => ({
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

export const useLoadoutStore = defineStore('loadout', () => {
  // --- State ---
  const equippedItems = ref<EquippedItems>(createInitialEquippedItems())
  const playerStats = ref<PlayerStats>({
    attack: 99,
    strength: 99,
    defence: 99,
    ranged: 99,
    magic: 99,
    prayer: 99,
  })

  // --- Actions ---
  function equipItem(item: Item) {
    const stats = item.equipment_stats
    if (!stats) return

    if (stats.slot === '2h') {
      equippedItems.value.weapon = null
      equippedItems.value.shield = null
    } else if (stats.slot === 'weapon' || stats.slot === 'shield') {
      equippedItems.value['2h'] = null
    }

    equippedItems.value[stats.slot] = item
  }

  function unequipItem(slot: EquipmentSlotName) {
    equippedItems.value[slot] = null
  }

  function setPlayerStat(skill: keyof PlayerStats, level: number) {
    if (level >= 1 && level <= 99) {
      playerStats.value[skill] = level
    }
  }

  // --- Getters (Computed) ---
  const totalBonuses = computed(() => {
    const initial = {
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

    for (const item of Object.values(equippedItems.value)) {
      if (!item?.equipment_stats) continue
      for (const key in initial) {
        initial[key as keyof typeof initial] +=
          item.equipment_stats[key as keyof typeof initial] || 0
      }
    }
    return initial
  })

  return {
    // State
    equippedItems,
    playerStats,
    // Actions
    equipItem,
    unequipItem,
    setPlayerStat,
    // Getters
    totalBonuses,
  }
})
