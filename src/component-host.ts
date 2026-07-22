import {
  DOT_COMPONENT_BRIDGE_PROTOCOL,
  DOT_COMPONENT_BRIDGE_VERSION,
  type DotComponentFrameMessage,
} from './component-srcdoc';

type BridgeSession = {
  artifactId: string;
  iframe: HTMLIFrameElement;
  port: MessagePort;
};

export type DotComponentHostOptions = {
  getInputs: (artifactId: string) => { inputs: Record<string, unknown>; revision: number };
  onEmit: (artifactId: string, portId: string, value: unknown) => void;
  onReady?: (artifactId: string) => void;
  onError?: (artifactId: string, message: string) => void;
};

function findRequestingIframe(source: MessageEventSource | null) {
  return [...document.querySelectorAll<HTMLIFrameElement>('iframe[data-dot-artifact-id]')].find(
    (iframe) => iframe.contentWindow === source,
  );
}

function isBridgeRequest(value: unknown) {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return (
    message.source === 'dot-component' &&
    message.protocol === DOT_COMPONENT_BRIDGE_PROTOCOL &&
    message.type === 'dot:bridge-request' &&
    message.version === DOT_COMPONENT_BRIDGE_VERSION
  );
}

function serializableClone(value: unknown) {
  try {
    return structuredClone(value);
  } catch {
    // Vue wraps artifact runtime state in proxies, which structuredClone cannot
    // copy directly. JSON is exactly the bridge's permitted value surface.
    try {
      const encoded = JSON.stringify(value);
      return encoded === undefined ? undefined : JSON.parse(encoded);
    } catch {
      return undefined;
    }
  }
}

export class DotComponentHost {
  readonly #options: DotComponentHostOptions;
  readonly #sessions = new Set<BridgeSession>();
  readonly #handleWindowMessage = (event: MessageEvent) => {
    if (!isBridgeRequest(event.data)) return;

    const iframe = findRequestingIframe(event.source);
    const artifactId = iframe?.dataset.dotArtifactId;
    if (!iframe || !artifactId || !event.source || typeof event.source !== 'object' || !('postMessage' in event.source)) return;

    for (const existing of this.#sessions) {
      if (existing.iframe !== iframe) continue;
      existing.port.close();
      this.#sessions.delete(existing);
    }

    const channel = new MessageChannel();
    const session: BridgeSession = { artifactId, iframe, port: channel.port1 };
    this.#sessions.add(session);
    channel.port1.onmessage = (portEvent) => this.#handlePortMessage(session, portEvent.data);
    channel.port1.onmessageerror = () => this.#options.onError?.(artifactId, 'The component sent an unreadable message.');
    channel.port1.start();

    const { inputs, revision } = this.#options.getInputs(artifactId);
    (event.source as Window).postMessage(
      {
        source: 'dot-host',
        protocol: DOT_COMPONENT_BRIDGE_PROTOCOL,
        type: 'dot:bridge-connect',
        version: DOT_COMPONENT_BRIDGE_VERSION,
        inputs: serializableClone(inputs) ?? {},
        revision,
      },
      { targetOrigin: '*', transfer: [channel.port2] },
    );
  };

  constructor(options: DotComponentHostOptions) {
    this.#options = options;
    window.addEventListener('message', this.#handleWindowMessage);
  }

  sendInputs(artifactId: string, inputs: Record<string, unknown>, revision: number) {
    const safeInputs = serializableClone(inputs);
    if (safeInputs === undefined) {
      this.#options.onError?.(artifactId, 'Connected inputs must be serializable.');
      return;
    }

    for (const session of this.#sessions) {
      if (session.artifactId !== artifactId || !session.iframe.isConnected) continue;
      session.port.postMessage({
        protocol: DOT_COMPONENT_BRIDGE_PROTOCOL,
        type: 'dot:inputs',
        version: DOT_COMPONENT_BRIDGE_VERSION,
        inputs: safeInputs,
        revision,
      });
    }

    this.#prune();
  }

  disposeArtifact(artifactId: string) {
    for (const session of this.#sessions) {
      if (session.artifactId !== artifactId) continue;
      session.port.close();
      this.#sessions.delete(session);
    }
  }

  dispose() {
    window.removeEventListener('message', this.#handleWindowMessage);
    for (const session of this.#sessions) session.port.close();
    this.#sessions.clear();
  }

  #handlePortMessage(session: BridgeSession, value: unknown) {
    if (!value || typeof value !== 'object') return;
    const message = value as DotComponentFrameMessage;
    if (message.protocol !== DOT_COMPONENT_BRIDGE_PROTOCOL || message.version !== DOT_COMPONENT_BRIDGE_VERSION) return;

    if (message.type === 'dot:ready') {
      const { inputs, revision } = this.#options.getInputs(session.artifactId);
      this.sendInputs(session.artifactId, inputs, revision);
      this.#options.onReady?.(session.artifactId);
      return;
    }

    if (message.type === 'dot:emit' && typeof message.portId === 'string') {
      this.#options.onEmit(session.artifactId, message.portId.slice(0, 80), message.value);
      return;
    }

    if (message.type === 'dot:error') {
      this.#options.onError?.(session.artifactId, String(message.message || 'Component runtime error').slice(0, 500));
    }
  }

  #prune() {
    for (const session of this.#sessions) {
      if (session.iframe.isConnected) continue;
      session.port.close();
      this.#sessions.delete(session);
    }
  }
}
