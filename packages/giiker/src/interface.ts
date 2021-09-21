import { COLORS, FACES } from '.'

export type Color = typeof COLORS[number]
export type Face = typeof FACES[number]
export type Turn = '\'' | '2' | '2\'' | ''
export type Notation = `${Face}${Turn}`

export interface GiikerOptions {
  filters: BluetoothLEScanFilter[]
}

export interface GiikerMove {
  face: string
  amount: number
  notation: string
}

export interface GiikerRawState {
  cornerPositions: number[]
  cornerOrientations: number[]
  edgePositions: number[]
  edgeOrientations: boolean[]
}

export interface GiikerCellState {
  position: Face[]
  colors: Color[]
}

export interface GiikerState {
  corners: GiikerCellState[]
  edges: GiikerCellState[]
}
