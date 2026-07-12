import { useEffect, useState } from 'react';
import { useApplicationAdapters } from '../application';
import type { NetworkState } from '../application/types';

export interface NetworkStatusState extends NetworkState {
  loading: boolean;
  isOffline: boolean;
  isSupported: boolean;
}

const initialState: NetworkStatusState = {
  isConnected: null,
  isInternetReachable: null,
  loading: true,
  isOffline: false,
  isSupported: false,
};

export function useNetworkStatus(): NetworkStatusState {
  const { network } = useApplicationAdapters();
  const [state, setState] = useState<NetworkStatusState>(() => ({
    ...initialState,
    isSupported: Boolean(network),
  }));

  useEffect(() => {
    if (!network) {
      setState({ ...initialState, loading: false });
      return undefined;
    }

    let active = true;
    const update = (nextState: NetworkState) => {
      if (!active) return;
      setState({
        ...nextState,
        loading: false,
        isSupported: true,
        isOffline:
          nextState.isConnected === false ||
          nextState.isInternetReachable === false,
      });
    };

    void network.getCurrentState().then(update);
    const unsubscribe = network.subscribe(update);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [network]);

  return state;
}
