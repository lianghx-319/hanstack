import { isEqual, noop, omit, pick } from 'lodash';
import React, {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { DataSet } from 'vis-data';
import { Edge, Network, Node, Options } from 'vis-network';
import type {
  EdgeOptionsExtend,
  NodeOptionsExtend,
  VisNetworkConfigure,
  VisNetworkData,
  VisNetworkEvents,
  VisNetworkLayout,
} from './interface';
import { diffData, idIsEqual, updateData } from './utils/diff';
import { bindNetworkEvent, visNetworkEvents } from './utils/event';

export interface VisNetworkProps extends Options, Partial<VisNetworkEvents> {
  data: VisNetworkData;
  // vis network options
  edges?: EdgeOptionsExtend;
  configure?: VisNetworkConfigure;
  layout?: VisNetworkLayout;
  nodes?: NodeOptionsExtend;

  // div props
  className?: string;
  style?: CSSProperties;
}

export interface VisNetworkRefs {
  /**
   * container dom
   */
  container: HTMLDivElement | null;
  /**
   * nodes wrapped with Vis DataSet
   */
  nodes: DataSet<Node>;
  /**
   * edges wrapped with Vis DataSet
   */
  edges: DataSet<Edge>;
  /**
   * vis network instance;
   */
  network: Network | undefined;
}

/**
 * @docs https://visjs.github.io/vis-network/docs/network/
 */
export const VisNetwork = forwardRef<
  VisNetworkRefs,
  PropsWithChildren<VisNetworkProps>
>(Component);

const defaultStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
};

function Component(
  props: PropsWithChildren<VisNetworkProps>,
  ref: ForwardedRef<VisNetworkRefs>,
) {
  const _events = pick(props, visNetworkEvents) as VisNetworkEvents;
  const { data, style = {}, className, children, ..._options } = omit(
    props,
    visNetworkEvents,
  );
  const nodes = useRef(new DataSet(data.nodes));
  const edges = useRef(new DataSet(data.edges));
  const events = useRef(_events);
  const network = useRef<Network>();
  const container = useRef<HTMLDivElement | null>(null);
  const options = useRef(_options);

  useImperativeHandle(
    ref,
    () => ({
      nodes: nodes.current,
      edges: edges.current,
      container: container.current,
      network: network.current,
    }),
    [],
  );

  const setNetwork = useCallback((dom: HTMLDivElement) => {
    container.current = dom;
    if (!network.current) {
      network.current = new Network(
        dom,
        { nodes: nodes.current, edges: edges.current },
        options.current,
      );
    }
  }, []);

  useEffect(() => {
    // update nodes
    updateData(
      nodes.current,
      diffData(data.nodes, nodes.current.get(), idIsEqual),
    );

    // update edges
    updateData(edges.current, diffData(data.edges, edges.current.get()));
  }, [data]);

  // update events ref
  useEffect(() => {
    const isChanged = !isEqual(events.current, _events);
    if (isChanged) {
      events.current = _events;
    }
  }, [_events]);

  useEffect(() => {
	  const isChanged = !isEqual(options.current, _options);
	  if (isChanged) {
		  options.current = _options;
		  network.current?.setOptions(options.current);
	  }
  }, [_options])

  // bind events
  useEffect(() => {
    let unbind = noop;
    if (network.current) {
      unbind = bindNetworkEvent(network.current, events.current);
    }
    return unbind;
  }, [events.current, network.current]);

  return (
    <div style={{ ...defaultStyle, ...style }} className={className}>
      <div ref={setNetwork} style={defaultStyle}></div>
      {children}
    </div>
  );
}
