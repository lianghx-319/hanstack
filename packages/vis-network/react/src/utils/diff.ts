import { differenceWith, isEqual } from "lodash";
import type { DataSet } from "vis-data";
import type { Edge, Node } from "vis-network";

export interface Patch<T extends Node | Edge> {
  removed: T[];
  added: T[];
  changed: T[];
}

/**
 * update Nodes or Edges
 * @param dataset - vis dataset instance
 * @param patch - patches
 */
export function updateData<T extends Node | Edge>(
  dataset: DataSet<T>,
  patch?: Patch<T>
) {
  if (patch) {
    dataset.add(patch.added);
    dataset.remove(patch.removed);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    dataset.update(patch.changed);
  }
}

/**
 * diff Nodes or Edges
 * @param newData - Node Array or Edge Array
 * @param oldData - Node Array or Edge Array
 * @param equal - function to judge to item is equal
 * @returns diff patch if changed
 */
export function diffData<T extends Node | Edge>(
  newData: T[],
  oldData: T[],
  equal = isEqual
): Patch<T> | undefined {
  const isChanged = !isEqual(newData, oldData);
  if (isChanged) {
    const removed = differenceWith(oldData, newData, equal);
    const added = differenceWith(newData, oldData, equal);
    const changed = differenceWith(
      differenceWith(newData, oldData, isEqual),
      added
    );

    return { removed, added, changed };
  }
  return undefined;
}

/**
 * If two node's id is equal
 * @param n1 - node 1
 * @param n2 - node 2
 * @returns boolean
 */
export function idIsEqual(n1: Node, n2: Node): boolean {
  return n1?.id === n2?.id;
}
