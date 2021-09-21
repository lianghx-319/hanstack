import { defer, Deferred } from '@hanstack/utils'
import mitt from 'mitt'
import {
  COLORS,
  CORNER_COLORS,
  CORNER_LOCATIONS,
  EDGE_COLORS,
  EDGE_LOCATIONS,
  FACES,
  TURNS,
  UUID,
} from './constants'
import {
  GiikerMove,
  GiikerOptions,
  GiikerRawState,
  GiikerState,
  Notation,
} from './interface'

export class Giiker {
  private readonly bluetooth: Bluetooth

  private readonly emitter = mitt<{ move: GiikerMove; disconnected: void }>()

  private readonly pendingDisconnect: Deferred<void> = defer<void>()

  private readonly pendingConnect: Deferred<Giiker> = defer<Giiker>()

  private device: BluetoothDevice | null = null

  private systemService: BluetoothRemoteGATTService | undefined

  private rawState: GiikerRawState = {
    cornerPositions: [],
    cornerOrientations: [],
    edgePositions: [],
    edgeOrientations: [],
  }

  constructor(bluetooth?: Bluetooth) {
    if (!window?.navigator?.bluetooth)
      throw new Error('Web Bluetooth API is not accesible')

    this.bluetooth = bluetooth || window.navigator.bluetooth
  }

  get on() {
    return this.emitter.on
  }

  /**
   * Returns the current state of the cube as arrays of corners and edges.
   *
   * Example how to interpret the state:
   *
   * Corner:
   * ```
   *   {
   *     position: ['D', 'R', 'F'],
   *     colors: ['yellow', 'red', 'green']
   *   }
   * ```
   * The corner in position DRF has the colors yellow on D, red on R and green ON F.
   *
   * Edge:
   * ```
   *   {
   *     position: ['F', 'U'],
   *     colors: ['green', 'white']
   *   }
   * ```
   * The edge in position FU has the colors green on F and white on U.
   */
  get state() {
    const state: GiikerState = {
      corners: [],
      edges: [],
    }
    this.rawState.cornerPositions.forEach((cp, index) => {
      const mappedColors = this.mapCornerColors(
        CORNER_COLORS[cp - 1],
        this.rawState.cornerOrientations[index],
        index,
      )
      state.corners.push({
        position: CORNER_LOCATIONS[index].map(f => FACES[f]),
        colors: mappedColors.map(c => COLORS[c]),
      })
    })
    this.rawState.edgePositions.forEach((ep, index) => {
      const mappedColors = this.mapEdgeColors(
        EDGE_COLORS[ep - 1],
        this.rawState.edgeOrientations[index],
      )
      state.edges.push({
        position: EDGE_LOCATIONS[index].map(f => FACES[f]),
        colors: mappedColors.map(c => COLORS[c]),
      })
    })
    return state
  }

  /**
   * search & connect Cube
   */
  connect(
    options: GiikerOptions = {
      filters: [
        {
          namePrefix: 'Gi',
        },
      ],
    },
  ) {
    this.init(options)
    return this.pendingConnect
  }

  /**
   * manual disconnect to giiker
   */
  disconnect() {
    if (!this.device) return Promise.resolve()

    this.device.gatt?.disconnect()
    return this.pendingDisconnect
  }

  /**
   * Returns a promise that will resolve to the battery level
   */
  async getBatteryLevel() {
    const pendingReadBattery = defer<number>()
    await this.pendingConnect
    const readCharacteristic = await this.systemService?.getCharacteristic(
      UUID.SYSTEM_READ,
    )
    const writeCharacteristic = await this.systemService?.getCharacteristic(
      UUID.SYSTEM_WRITE,
    )
    await readCharacteristic?.startNotifications()
    const data = new Uint8Array([0xB5]).buffer
    writeCharacteristic?.writeValue(data)

    const listener = (event: Event) => {
      // @ts-ignore
      const value = event.target?.value
      readCharacteristic?.removeEventListener(
        'characteristicvaluechanged',
        listener,
      )
      readCharacteristic?.stopNotifications()
      pendingReadBattery.resolve(value.getUint8(1))
    }

    readCharacteristic?.addEventListener(
      'characteristicvaluechanged',
      listener,
    )

    return pendingReadBattery
  }

  private async init(
    options: GiikerOptions = {
      filters: [
        {
          namePrefix: 'Gi',
        },
      ],
    },
  ) {
    this.device = await this.bluetooth.requestDevice({
      filters: options.filters,
      optionalServices: [UUID.SERVICE, UUID.SYSTEM_SERVICE],
    })
    const server = await this.device?.gatt?.connect()
    const service = await server?.getPrimaryService(UUID.SERVICE)
    const characteristic = await service?.getCharacteristic(
      UUID.CHARACTERISTIC,
    )
    await characteristic?.startNotifications()
    const value = await characteristic?.readValue()
    this.rawState = this.parseCubeValue(value).state
    characteristic?.addEventListener(
      'characteristicvaluechanged',
      this.onCharacteristicValueChanged.bind(this),
    )

    this.systemService = await server?.getPrimaryService(UUID.SYSTEM_SERVICE)
    this.device.addEventListener(
      'gattserverdisconnected',
      this.onDisconnected.bind(this),
    )

    this.pendingConnect.resolve(this)
    return this.pendingConnect
  }

  private onDisconnected() {
    this.device = null
    this.emitter.emit('disconnected')
    this.pendingDisconnect.resolve()
  }

  private onCharacteristicValueChanged(event?: Event) {
    // @ts-ignore
    const value = event?.target?.value
    const { state, moves } = this.parseCubeValue(value)
    this.rawState = state
    this.emitter.emit('move', moves[0])
  }

  private parseCubeValue(value?: DataView) {
    const state: GiikerRawState = {
      cornerPositions: [],
      cornerOrientations: [],
      edgePositions: [],
      edgeOrientations: [],
    }
    const moves: GiikerMove[] = []
    if (!value) return { state, moves }

    for (let i = 0; i < value.byteLength; i++) {
      const move = value.getUint8(i)
      const highNibble = move >> 4
      const lowNibble = move & 0b1111
      if (i < 4) {
        state.cornerPositions.push(highNibble, lowNibble)
      }
      else if (i < 8) {
        state.cornerOrientations.push(highNibble, lowNibble)
      }
      else if (i < 14) {
        state.edgePositions.push(highNibble, lowNibble)
      }
      else if (i < 16) {
        state.edgeOrientations.push(!!(move & 0b10000000))
        state.edgeOrientations.push(!!(move & 0b01000000))
        state.edgeOrientations.push(!!(move & 0b00100000))
        state.edgeOrientations.push(!!(move & 0b00010000))
        if (i === 14) {
          state.edgeOrientations.push(!!(move & 0b00001000))
          state.edgeOrientations.push(!!(move & 0b00000100))
          state.edgeOrientations.push(!!(move & 0b00000010))
          state.edgeOrientations.push(!!(move & 0b00000001))
        }
      }
      else {
        moves.push(this.parseMove(highNibble, lowNibble))
      }
    }
    return { state, moves }
  }

  private parseMove(faceIndex: number, turnIndex: number): GiikerMove {
    const face = FACES[faceIndex - 1]
    // @ts-ignore
    const amount = TURNS[turnIndex - 1]
    let notation: Notation = face

    switch (amount) {
      case 2:
        notation = `${face}2`
        break
      case -1:
        notation = `${face}'`
        break
      case -2:
        notation = `${face}2'`
        break
    }

    return { face, amount, notation }
  }

  private mapCornerColors(
    colors: number[],
    orientation: number,
    position: number,
  ) {
    const actualColors = []

    if (orientation !== 3) {
      if (position === 0 || position === 2 || position === 5 || position === 7)
        orientation = 3 - orientation
    }

    switch (orientation) {
      case 1:
        actualColors[0] = colors[1]
        actualColors[1] = colors[2]
        actualColors[2] = colors[0]
        break
      case 2:
        actualColors[0] = colors[2]
        actualColors[1] = colors[0]
        actualColors[2] = colors[1]
        break
      case 3:
        actualColors[0] = colors[0]
        actualColors[1] = colors[1]
        actualColors[2] = colors[2]
        break
    }

    return actualColors
  }

  private mapEdgeColors(colors: number[], orientation: boolean) {
    const actualColors = [...colors]
    if (orientation) actualColors.reverse()

    return actualColors
  }
}
