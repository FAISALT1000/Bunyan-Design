import type {
  NavigationAdapter,
  NavigationTarget,
} from '@bunyan/design-system';

export interface PreviewScreenParams extends Record<string, unknown> {
  PreviewHome: undefined;
  ComponentDetail: {
    component: string;
  };
}

export interface PreviewLayout {
  root: string;
}

export interface PreviewNavigationOptions {
  title?: string;
}

export type PreviewNavigationCommand =
  | 'push'
  | 'pop'
  | 'popTo'
  | 'popToRoot'
  | 'setAppRoot'
  | 'showModal'
  | 'dismissModal'
  | 'dismissAllModals'
  | 'showOverlay'
  | 'dismissOverlay'
  | 'mergeOptions'
  | 'setStackRoot';

export interface PreviewNavigationEvent {
  command: PreviewNavigationCommand;
  componentId?: string;
  screen?: string;
}

type Listener = (event: PreviewNavigationEvent) => void;

const listeners = new Set<Listener>();

function emit(event: PreviewNavigationEvent) {
  listeners.forEach(listener => listener(event));
}

function screenFromTarget(
  target: NavigationTarget<PreviewScreenParams, PreviewNavigationOptions>,
) {
  return target.name;
}

export const previewNavigationEvents = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export const previewNavigationAdapter: NavigationAdapter<
  PreviewScreenParams,
  PreviewLayout,
  PreviewNavigationOptions,
  string
> = {
  async push(componentId, target) {
    emit({ command: 'push', componentId, screen: screenFromTarget(target) });
    return `${String(target.name)}-component`;
  },
  async pop(componentId) {
    emit({ command: 'pop', componentId });
  },
  async popTo(componentId) {
    emit({ command: 'popTo', componentId });
  },
  async popToRoot(componentId) {
    emit({ command: 'popToRoot', componentId });
  },
  async setAppRoot(layout) {
    emit({ command: 'setAppRoot', screen: layout.root });
  },
  async showModal(target) {
    emit({ command: 'showModal', screen: screenFromTarget(target) });
    return `${String(target.name)}-modal`;
  },
  async dismissModal(componentId) {
    emit({ command: 'dismissModal', componentId });
  },
  async dismissAllModals() {
    emit({ command: 'dismissAllModals' });
  },
  async showOverlay(target) {
    emit({ command: 'showOverlay', screen: screenFromTarget(target) });
    return `${String(target.name)}-overlay`;
  },
  async dismissOverlay(componentId) {
    emit({ command: 'dismissOverlay', componentId });
  },
  mergeOptions(componentId) {
    emit({ command: 'mergeOptions', componentId });
  },
  async setStackRoot(componentId, targets) {
    emit({
      command: 'setStackRoot',
      componentId,
      screen: targets.map(target => target.name).join(', '),
    });
  },
};
