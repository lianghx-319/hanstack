import type { MouseEvent } from "react";
import type {
  ArrowHead,
  Edge,
  EdgeOptions,
  IdType,
  NetworkEvents,
  Node,
  NodeOptions,
  Position,
} from "vis-network/peer/esm/vis-network";

export type Join<
  A extends string,
  B extends string,
  S extends string = ", "
> = `${A}${S}${B}`;

export type Combine<T, S extends string = ", "> = T extends [
  infer U,
  ...infer rest
]
  ? U extends string
    ? `${U}` | Join<U, Combine<rest, S>, S> | Combine<rest, S>
    : never
  : never;

export type VisNetworkEventPropName = `${
  | "on"
  | "once"}${Capitalize<NetworkEvents>}`;

/**
 * Vis Network event callback params
 */
export interface VisNetWorkEventParams {
  edges: IdType[];
  nodes: IdType[];
  event: MouseEvent<HTMLCanvasElement>;
  items?: {
    edgeId?: IdType;
    nodeId?: IdType;
    labelId?: IdType;
  };
  pointer: {
    DOM: Position;
    canvas: Position;
  };
}

/**
 * Vis Network event callback
 */
export type VisNetworkEventCallback = (params: VisNetWorkEventParams) => void;
export type VisNetworkEvents = Record<
  VisNetworkEventPropName,
  VisNetworkEventCallback
>;
/**
 * Vis Network arrow short option
 */
export type ArrowShort = Combine<["to", "middle", "from"]>;

/**
 * Vis Network Component Data
 */
export interface VisNetworkData {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Vis Network arrow type
 */
export type ArrowType = "arrow" | "bar" | "circle" | "image";

export interface ArrowHeadExtend extends ArrowHead {
  type?: ArrowType;
}

export interface EdgeOptionsExtend extends EdgeOptions {
  arrows?:
    | ArrowShort
    | {
        to?: boolean | ArrowHeadExtend;
        middle?: boolean | ArrowHeadExtend;
        from?: boolean | ArrowHeadExtend;
      };
}

export interface NodeOptionsExtend extends NodeOptions {
  shape?:
    | "ellipse"
    | "circle"
    | "database"
    | "box"
    | "text"
    | "custom"
    | "image"
    | "circularImage"
    | "diamond"
    | "dot"
    | "star"
    | "triangle"
    | "triangleDown"
    | "square"
    | "icon"
    | "hexagon";
}

// https://visjs.github.io/vis-network/docs/network/configure.html#
export interface VisNetworkConfigure {
  enabled?: boolean;
  filter?:
    | ((...args: any[]) => boolean)
    | boolean
    | Combine<["nodes", "edges"]>;
  showButton?: boolean;
}

// https://visjs.github.io/vis-network/docs/network/layout.html?keywords=seed#
export interface VisNetworkLayout {
  randomSeed?: number | string;
  improvedLayout?: boolean;
  clusterThreshold?: number;
  hierarchical?:
    | boolean
    | {
        enabled?: boolean;
        levelSeparation?: number;
        nodeSpacing?: number;
        treeSpacing?: number;
        blockShifting?: boolean;
        edgeMinimization?: boolean;
        parentCentralization?: boolean;
        direction?:
          | "up-down"
          | "down-up"
          | "left-right"
          | "right-left"
          | "UD"
          | "DU"
          | "LR"
          | "RL";
        sortMethod?: "hubsize" | "directed";
        shakeTowards?: "roots" | "leaves";
      };
}
