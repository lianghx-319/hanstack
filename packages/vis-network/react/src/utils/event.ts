import { camelCase } from "lodash";
import type { Network, NetworkEvents } from "vis-network";
import type {
  VisNetworkEventCallback,
  VisNetworkEventPropName,
  VisNetworkEvents,
} from "../interface";

/**
 * a list of vis network origin event
 */
const networkEvents: NetworkEvents[] = [
  "afterDrawing",
  "animationFinished",
  "beforeDrawing",
  "blurEdge",
  "blurEdge",
  "click",
  "configChange",
  "controlNodeDragEnd",
  "controlNodeDragging",
  "deselectEdge",
  "deselectNode",
  "doubleClick",
  "dragEnd",
  "dragStart",
  "dragging",
  "hidePopup",
  "hold",
  "hoverEdge",
  "hoverNode",
  "initRedraw",
  "oncontext",
  "release",
  "resize",
  "select",
  "selectEdge",
  "selectNode",
  "showPopup",
  "stabilizationIterationsDone",
  "stabilizationProgress",
  "stabilized",
  "startStabilizing",
];

const onEventMap = new Map<VisNetworkEventPropName, NetworkEvents>();
const onceEventMap = new Map<VisNetworkEventPropName, NetworkEvents>();

/**
 * a list of vis network react component event
 */
export const visNetworkEvents = networkEvents.reduce((arr, eventName) => {
  const onEvent = camelCase(`on ${eventName}`) as VisNetworkEventPropName;
  const onceEvent = camelCase(`once ${eventName}`) as VisNetworkEventPropName;
  onEventMap.set(onEvent, eventName);
  onceEventMap.set(onceEvent, eventName);
  return [...arr, onEvent, onceEvent];
}, [] as VisNetworkEventPropName[]);

export function bindNetworkEvent(network: Network, events: VisNetworkEvents) {
  walkEvents(events, (key, value) => {
    if (onceEventMap.has(key)) {
      network.once(onceEventMap.get(key)!, value);
    } else if (onEventMap.has(key)) {
      network.on(onEventMap.get(key)!, value);
    }
  });

  return () => {
    network.destroy();
  };
}

function walkEvents(
  events: VisNetworkEvents,
  cb: (key: VisNetworkEventPropName, value: VisNetworkEventCallback) => void
) {
  Object.entries(events).forEach(([key, value]) => {
    if (typeof value !== "function") {
      return;
    }
    cb(key as VisNetworkEventPropName, value);
  });
}
