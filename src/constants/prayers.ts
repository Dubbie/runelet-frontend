export const PRAYERS_DATA = [
  {
    id: 'protect_from_magic',
    name: 'Protect from Magic',
    imageUrl: '/images/prayers/Protect_from_Magic.webp',
  },
  {
    id: 'protect_from_missiles',
    name: 'Protect from Missiles',
    imageUrl: '/images/prayers/Protect_from_Missiles.webp',
  },
  {
    id: 'protect_from_melee',
    name: 'Protect from Melee',
    imageUrl: '/images/prayers/Protect_from_Melee.webp',
  },
  { id: 'piety', name: 'Piety', imageUrl: '/images/prayers/Piety.webp' },
  { id: 'rigour', name: 'Rigour', imageUrl: '/images/prayers/Rigour.webp' },
  { id: 'augury', name: 'Augury', imageUrl: '/images/prayers/Augury.png' },
]

// A helper map to easily look up prayer data by ID
export const PRAYERS_MAP = new Map(PRAYERS_DATA.map((p) => [p.id, p]))
