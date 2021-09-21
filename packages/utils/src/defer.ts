export interface Deferred<T> extends Promise<T> {
  readonly resolve: (value?: T | PromiseLike<T>) => void;
  readonly reject: (reasom?: any) => void;
}

export function defer<T>(): Deferred<T> {
  let wrappedResolve = null as any;
  let wrappedReject = null as any;
  const p = new Promise(
    (resolve, reject) => ([wrappedResolve, wrappedReject] = [resolve, reject])
  );
  return Object.assign(p, {
    resolve: wrappedResolve,
    reject: wrappedReject,
  }) as any;
}
