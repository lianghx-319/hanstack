export const UUID = {
  SERVICE: '0000aadb-0000-1000-8000-00805f9b34fb',
  CHARACTERISTIC: '0000aadc-0000-1000-8000-00805f9b34fb',

  SYSTEM_SERVICE: '0000aaaa-0000-1000-8000-00805f9b34fb',
  SYSTEM_READ: '0000aaab-0000-1000-8000-00805f9b34fb',
  SYSTEM_WRITE: '0000aaac-0000-1000-8000-00805f9b34fb',
}

// face indices
const B = 0
const D = 1
const L = 2
const U = 3
const R = 4
const F = 5

export const FACES = ['B', 'D', 'L', 'U', 'R', 'F'] as const

export const TURNS = {
  0: 1,
  1: 2,
  2: -1,
  8: -2,
}

// color indices
const b = 0
const y = 1
const o = 2
const w = 3
const r = 4
const g = 5

export const COLORS = [
  'blue',
  'yellow',
  'orange',
  'white',
  'red',
  'green',
] as const

export const CORNER_COLORS = [
  [y, r, g],
  [r, w, g],
  [w, o, g],
  [o, y, g],
  [r, y, b],
  [w, r, b],
  [o, w, b],
  [y, o, b],
]

export const CORNER_LOCATIONS = [
  [D, R, F],
  [R, U, F],
  [U, L, F],
  [L, D, F],
  [R, D, B],
  [U, R, B],
  [L, U, B],
  [D, L, B],
]

export const EDGE_LOCATIONS = [
  [F, D],
  [F, R],
  [F, U],
  [F, L],
  [D, R],
  [U, R],
  [U, L],
  [D, L],
  [B, D],
  [B, R],
  [B, U],
  [B, L],
]

export const EDGE_COLORS = [
  [g, y],
  [g, r],
  [g, w],
  [g, o],
  [y, r],
  [w, r],
  [w, o],
  [y, o],
  [b, y],
  [b, r],
  [b, w],
  [b, o],
]
