/**
 * Framework-free dataflow for Dot's living connections.
 *
 * The runtime deliberately knows nothing about Vue or artifacts themselves. A
 * host registers ports, connects their addresses, and mirrors `subscribe()`
 * snapshots into whichever reactive system it uses.
 */

export type SerializablePrimitive = null | boolean | number | string;

export type SerializableValue =
  | SerializablePrimitive
  | { readonly [key: string]: SerializableValue }
  | readonly SerializableValue[];

export type LivingPortType =
  | 'text'
  | 'image'
  | 'video'
  | 'data'
  | 'event'
  | 'component'
  | 'any';

export type LivingPortDirection = 'input' | 'output';
export type LivingConnectionPolicy = 'live' | 'event' | 'breathe';
export type LivingConnectionStatus = 'resting' | 'flowing' | 'blocked';

export type LivingBlockCode =
  | 'source-port-missing'
  | 'target-port-missing'
  | 'source-not-output'
  | 'target-not-input'
  | 'incompatible-types'
  | 'invalid-value'
  | 'cycle-detected'
  | 'max-hops-exceeded'
  | 'delivery-budget-exceeded'
  | 'subscriber-error';

export type LivingPortAddress = {
  readonly artifactId: string;
  readonly portId: string;
};

export type LivingValueValidator = (
  value: SerializableValue,
) => boolean | string;

export type LivingPortDefinition = LivingPortAddress & {
  readonly direction: LivingPortDirection;
  readonly type: LivingPortType;
  readonly validate?: LivingValueValidator;
};

export type LivingConnectionDefinition = {
  readonly id: string;
  readonly from: LivingPortAddress;
  readonly to: LivingPortAddress;
  readonly meaning?: string;
  readonly policy?: LivingConnectionPolicy;
};

export type LivingConnectionPatch = {
  readonly from?: LivingPortAddress;
  readonly to?: LivingPortAddress;
  readonly meaning?: string;
  readonly policy?: LivingConnectionPolicy;
};

export type LivingEmitOptions = {
  readonly metadata?: SerializableValue;
};

export type LivingPacket<T extends SerializableValue = SerializableValue> = {
  /** Unique packet instance. Deliveries get a new id and retain their parent. */
  readonly id: string;
  /** Shared by every synchronous descendant of one root emission. */
  readonly flowId: string;
  readonly parentPacketId?: string;
  readonly source: LivingPortAddress;
  readonly target?: LivingPortAddress;
  readonly connectionId?: string;
  readonly type: LivingPortType;
  readonly value: T;
  readonly metadata?: SerializableValue;
  /** Revision of the source output port. */
  readonly revision: number;
  /** Revision of the traversed connection, when this is a delivery packet. */
  readonly connectionRevision?: number;
  readonly emittedAt: number;
  readonly deliveredAt?: number;
  readonly hops: number;
  readonly path: readonly string[];
};

export type LivingBlockedReason = {
  readonly code: LivingBlockCode;
  readonly message: string;
  readonly at: number;
};

export type LivingPortSnapshot = LivingPortAddress & {
  readonly direction: LivingPortDirection;
  readonly type: LivingPortType;
  readonly revision: number;
  readonly lastPacket?: LivingPacket;
};

export type LivingConnectionSnapshot = {
  readonly id: string;
  readonly from: LivingPortAddress;
  readonly to: LivingPortAddress;
  readonly meaning: string;
  readonly policy: LivingConnectionPolicy;
  readonly status: LivingConnectionStatus;
  readonly revision: number;
  readonly lastPacket?: LivingPacket;
  readonly hasPending: boolean;
  readonly pendingPacket?: LivingPacket;
  readonly blockedReason?: LivingBlockedReason;
};

export type LivingRuntimeSnapshot = {
  readonly version: number;
  readonly ports: readonly LivingPortSnapshot[];
  readonly connections: readonly LivingConnectionSnapshot[];
};

export type LivingRuntimeFaultPhase =
  | 'input-subscriber'
  | 'state-subscriber';

export type LivingRuntimeFault = {
  readonly phase: LivingRuntimeFaultPhase;
  readonly error: Error;
  readonly connectionId?: string;
  readonly address?: LivingPortAddress;
};

export type LivingRuntimeOptions = {
  /** Maximum connections a packet lineage may traverse. Defaults to 32. */
  readonly maxHops?: number;
  /** Global backstop for explosive fan-out within one dispatch. Defaults to 1000. */
  readonly maxDeliveriesPerFlush?: number;
  readonly now?: () => number;
  readonly createId?: (kind: 'flow' | 'packet') => string;
  /** Must defer the callback; defaults to `queueMicrotask`. */
  readonly schedule?: (callback: () => void) => void;
  readonly onError?: (fault: LivingRuntimeFault) => void;
};

export type LivingDeliveryContext = {
  readonly connection: LivingConnectionSnapshot;
  readonly emit: <T extends SerializableValue>(
    source: LivingPortAddress,
    value: T,
    options?: LivingEmitOptions,
  ) => LivingPacket<T>;
};

export type LivingInputSubscriber = (
  packet: LivingPacket,
  context: LivingDeliveryContext,
) => void;

export type LivingStateSubscriber = (snapshot: LivingRuntimeSnapshot) => void;

type RuntimePort = {
  definition: LivingPortDefinition;
  registration: number;
  revision: number;
  lastPacket?: LivingPacket;
};

type FlowTrace = {
  readonly flowId: string;
  readonly path: readonly string[];
  readonly parentPacketId?: string;
};

type QueuedDelivery = {
  readonly connectionId: string;
  readonly packet: LivingPacket;
  readonly trace: FlowTrace;
  readonly release: boolean;
};

type RuntimeConnection = {
  id: string;
  from: LivingPortAddress;
  to: LivingPortAddress;
  meaning: string;
  policy: LivingConnectionPolicy;
  status: LivingConnectionStatus;
  revision: number;
  activityToken: number;
  lastPacket?: LivingPacket;
  pending?: QueuedDelivery;
  blockedReason?: LivingBlockedReason;
};

const STRUCTURAL_BLOCKS: ReadonlySet<LivingBlockCode> = new Set([
  'source-port-missing',
  'target-port-missing',
  'source-not-output',
  'target-not-input',
  'incompatible-types',
]);

let generatedIdSequence = 0;

function defaultCreateId(kind: 'flow' | 'packet'): string {
  generatedIdSequence += 1;
  return `${kind}-${Date.now().toString(36)}-${generatedIdSequence.toString(36)}`;
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer.`);
  }
}

function freezeAddress(address: LivingPortAddress): LivingPortAddress {
  if (
    typeof address.artifactId !== 'string' ||
    address.artifactId.trim().length === 0 ||
    typeof address.portId !== 'string' ||
    address.portId.trim().length === 0
  ) {
    throw new TypeError('Port addresses require non-empty artifactId and portId strings.');
  }

  return Object.freeze({
    artifactId: address.artifactId,
    portId: address.portId,
  });
}

export function livingPortKey(address: LivingPortAddress): string {
  return JSON.stringify([address.artifactId, address.portId]);
}

function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
}

function isSerializableInner(value: unknown, ancestors: WeakSet<object>): boolean {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object') return false;
  if (ancestors.has(value)) return false;

  ancestors.add(value);
  let valid = true;

  if (Array.isArray(value)) {
    valid = value.every((entry) => isSerializableInner(entry, ancestors));
  } else if (isPlainObject(value)) {
    const keys = Reflect.ownKeys(value);
    valid = keys.every(
      (key) =>
        typeof key === 'string' &&
        Object.prototype.propertyIsEnumerable.call(value, key) &&
        isSerializableInner((value as Record<string, unknown>)[key], ancestors),
    );
  } else {
    valid = false;
  }

  ancestors.delete(value);
  return valid;
}

/** True for finite, acyclic JSON-like values with no class instances. */
export function isSerializableValue(value: unknown): value is SerializableValue {
  return isSerializableInner(value, new WeakSet());
}

function cloneAndFreeze<T extends SerializableValue>(value: T): T {
  if (Array.isArray(value)) {
    const clone = value.map((entry) => cloneAndFreeze(entry));
    return Object.freeze(clone) as T;
  }

  if (value !== null && typeof value === 'object') {
    // A null prototype keeps JSON keys such as "__proto__" inert data instead
    // of letting an emitted packet mutate the clone's object prototype.
    const clone = Object.create(null) as Record<string, SerializableValue>;
    for (const [key, entry] of Object.entries(value)) {
      clone[key] = cloneAndFreeze(entry);
    }
    return Object.freeze(clone) as T;
  }

  return value;
}

function immutableSerializable<T extends SerializableValue>(value: T): T {
  if (!isSerializableValue(value)) {
    throw new TypeError(
      'Living packets only accept finite, acyclic JSON-like serializable values.',
    );
  }
  return cloneAndFreeze(value);
}

export function livingTypesAreCompatible(
  source: LivingPortType,
  target: LivingPortType,
): boolean {
  return (
    source === target ||
    source === 'any' ||
    target === 'any' ||
    (source === 'component' && target === 'data')
  );
}

function baseValueMatchesType(
  value: SerializableValue,
  type: LivingPortType,
): boolean {
  return type !== 'text' || typeof value === 'string';
}

function freezePacket<T extends SerializableValue>(
  packet: LivingPacket<T>,
): LivingPacket<T> {
  return Object.freeze(packet);
}

/**
 * Routes immutable packets between registered artifact ports.
 *
 * Mutations and packet dispatches are microtask-batched. Input callbacks may
 * emit downstream values synchronously; those emissions inherit the active
 * flow trace, allowing cycles and depth explosions to be stopped.
 */
export class LivingRuntime {
  private readonly maxHops: number;
  private readonly maxDeliveriesPerFlush: number;
  private readonly now: () => number;
  private readonly createId: (kind: 'flow' | 'packet') => string;
  private readonly schedule: (callback: () => void) => void;
  private readonly onError?: (fault: LivingRuntimeFault) => void;

  private readonly ports = new Map<string, RuntimePort>();
  private readonly connections = new Map<string, RuntimeConnection>();
  private readonly outgoing = new Map<string, Set<string>>();
  private readonly incoming = new Map<string, Set<string>>();
  private readonly inputSubscribers = new Map<string, Set<LivingInputSubscriber>>();
  private readonly stateSubscribers = new Set<LivingStateSubscriber>();
  private readonly deliveryQueue: QueuedDelivery[] = [];
  private readonly settlingConnections = new Map<string, number>();

  private registrationSequence = 0;
  private version = 0;
  private batchDepth = 0;
  private dispatchScheduled = false;
  private notifyScheduled = false;
  private settleScheduled = false;
  private isDispatching = false;
  private activeTrace?: FlowTrace;

  constructor(options: LivingRuntimeOptions = {}) {
    this.maxHops = options.maxHops ?? 32;
    this.maxDeliveriesPerFlush = options.maxDeliveriesPerFlush ?? 1000;
    assertPositiveInteger(this.maxHops, 'maxHops');
    assertPositiveInteger(
      this.maxDeliveriesPerFlush,
      'maxDeliveriesPerFlush',
    );

    this.now = options.now ?? Date.now;
    this.createId = options.createId ?? defaultCreateId;
    // Browser queueMicrotask is a host method in some engines and throws when
    // later invoked as an unbound class field. Keep the call rooted globally.
    this.schedule = options.schedule ?? ((callback) => queueMicrotask(callback));
    this.onError = options.onError;
  }

  /**
   * Register or replace a runtime port. Re-registering the same compatible
   * address preserves its revision and last packet (useful across remounts).
   */
  registerPort(definition: LivingPortDefinition): () => void {
    const address = freezeAddress(definition);
    const key = livingPortKey(address);
    const previous = this.ports.get(key);
    const registration = ++this.registrationSequence;
    const compatibleReplacement =
      previous?.definition.direction === definition.direction &&
      previous.definition.type === definition.type;

    this.ports.set(key, {
      definition: Object.freeze({
        ...address,
        direction: definition.direction,
        type: definition.type,
        ...(definition.validate ? { validate: definition.validate } : {}),
      }),
      registration,
      revision: compatibleReplacement ? previous.revision : 0,
      ...(compatibleReplacement && previous.lastPacket
        ? { lastPacket: previous.lastPacket }
        : {}),
    });

    this.refreshConnectionsForPort(key);
    this.touch();

    return () => {
      const current = this.ports.get(key);
      if (current?.registration !== registration) return;
      this.ports.delete(key);
      this.refreshConnectionsForPort(key);
      this.touch();
    };
  }

  connect(definition: LivingConnectionDefinition): LivingConnectionSnapshot {
    if (definition.id.trim().length === 0) {
      throw new TypeError('Connection ids must be non-empty strings.');
    }
    if (this.connections.has(definition.id)) {
      throw new Error(`Connection "${definition.id}" already exists.`);
    }

    const connection: RuntimeConnection = {
      id: definition.id,
      from: freezeAddress(definition.from),
      to: freezeAddress(definition.to),
      meaning: definition.meaning?.trim() ?? '',
      policy: definition.policy ?? 'live',
      status: 'resting',
      revision: 0,
      activityToken: 0,
    };

    this.connections.set(connection.id, connection);
    this.addToIndex(this.outgoing, livingPortKey(connection.from), connection.id);
    this.addToIndex(this.incoming, livingPortKey(connection.to), connection.id);
    this.applyStructuralStatus(connection, true);
    this.touch();
    return this.snapshotConnection(connection);
  }

  updateConnection(
    id: string,
    patch: LivingConnectionPatch,
  ): LivingConnectionSnapshot {
    const connection = this.requireConnection(id);
    const endpointChanged = patch.from !== undefined || patch.to !== undefined;

    if (patch.from !== undefined) {
      this.removeFromIndex(this.outgoing, livingPortKey(connection.from), id);
      connection.from = freezeAddress(patch.from);
      this.addToIndex(this.outgoing, livingPortKey(connection.from), id);
    }
    if (patch.to !== undefined) {
      this.removeFromIndex(this.incoming, livingPortKey(connection.to), id);
      connection.to = freezeAddress(patch.to);
      this.addToIndex(this.incoming, livingPortKey(connection.to), id);
    }
    if (patch.meaning !== undefined) connection.meaning = patch.meaning.trim();
    if (patch.policy !== undefined) connection.policy = patch.policy;

    if (endpointChanged) connection.pending = undefined;
    this.applyStructuralStatus(connection, true);

    if (connection.policy !== 'breathe' && connection.pending) {
      const pending = connection.pending;
      connection.pending = undefined;
      this.enqueue({ ...pending, release: true });
    }

    this.touch();
    return this.snapshotConnection(connection);
  }

  disconnect(id: string): boolean {
    const connection = this.connections.get(id);
    if (!connection) return false;

    this.connections.delete(id);
    this.removeFromIndex(this.outgoing, livingPortKey(connection.from), id);
    this.removeFromIndex(this.incoming, livingPortKey(connection.to), id);
    this.settlingConnections.delete(id);
    this.touch();
    return true;
  }

  /** Emit from an output port. The returned packet is deeply immutable. */
  emit<T extends SerializableValue>(
    source: LivingPortAddress,
    value: T,
    options: LivingEmitOptions = {},
  ): LivingPacket<T> {
    const sourceAddress = freezeAddress(source);
    const port = this.ports.get(livingPortKey(sourceAddress));
    if (!port) {
      throw new Error(
        `Cannot emit from missing port ${sourceAddress.artifactId}:${sourceAddress.portId}.`,
      );
    }
    if (port.definition.direction !== 'output') {
      throw new Error(
        `Cannot emit from input port ${sourceAddress.artifactId}:${sourceAddress.portId}.`,
      );
    }

    const immutableValue = immutableSerializable(value);
    const validationProblem = this.valueValidationProblem(
      port.definition,
      immutableValue,
    );
    if (validationProblem) throw new TypeError(validationProblem);

    const immutableMetadata =
      options.metadata === undefined
        ? undefined
        : immutableSerializable(options.metadata);
    const inherited = this.activeTrace;
    const flowId = inherited?.flowId ?? this.createId('flow');
    const path = Object.freeze([...(inherited?.path ?? [])]);
    const revision = port.revision + 1;
    const packet = freezePacket<T>({
      id: this.createId('packet'),
      flowId,
      ...(inherited?.parentPacketId
        ? { parentPacketId: inherited.parentPacketId }
        : {}),
      source: sourceAddress,
      type: port.definition.type,
      value: immutableValue,
      ...(immutableMetadata === undefined ? {} : { metadata: immutableMetadata }),
      revision,
      emittedAt: this.now(),
      hops: path.length,
      path,
    });

    port.revision = revision;
    port.lastPacket = packet;
    this.enqueueOutgoing(packet, {
      flowId,
      path,
      ...(inherited?.parentPacketId
        ? { parentPacketId: inherited.parentPacketId }
        : {}),
    });
    this.touch();
    return packet;
  }

  /** Release the latest packet held by one `breathe` connection. */
  breathe(connectionId: string): boolean {
    const connection = this.requireConnection(connectionId);
    if (!connection.pending) return false;

    const pending = connection.pending;
    connection.pending = undefined;
    this.enqueue({ ...pending, release: true });
    this.touch();
    return true;
  }

  /** Release every pending `breathe` connection feeding an input address. */
  breatheInto(target: LivingPortAddress): number {
    const ids = this.incoming.get(livingPortKey(freezeAddress(target)));
    if (!ids) return 0;

    let released = 0;
    this.batch(() => {
      for (const id of ids) {
        const connection = this.connections.get(id);
        if (!connection?.pending) continue;
        const pending = connection.pending;
        connection.pending = undefined;
        this.enqueue({ ...pending, release: true });
        this.touch();
        released += 1;
      }
    });
    return released;
  }

  subscribeInput(
    target: LivingPortAddress,
    subscriber: LivingInputSubscriber,
  ): () => void {
    const key = livingPortKey(freezeAddress(target));
    let subscribers = this.inputSubscribers.get(key);
    if (!subscribers) {
      subscribers = new Set();
      this.inputSubscribers.set(key, subscribers);
    }
    subscribers.add(subscriber);

    return () => {
      const current = this.inputSubscribers.get(key);
      if (!current) return;
      current.delete(subscriber);
      if (current.size === 0) this.inputSubscribers.delete(key);
    };
  }

  subscribe(
    subscriber: LivingStateSubscriber,
    options: { readonly immediate?: boolean } = {},
  ): () => void {
    this.stateSubscribers.add(subscriber);
    if (options.immediate !== false) subscriber(this.getSnapshot());
    return () => this.stateSubscribers.delete(subscriber);
  }

  /**
   * Defer dispatch and state notification until a synchronous group of changes
   * completes. This is convenient around Vue actions that update several ports.
   */
  batch<T>(work: () => T): T {
    this.batchDepth += 1;
    try {
      return work();
    } finally {
      this.batchDepth -= 1;
      if (this.batchDepth === 0) {
        this.requestDispatch();
        this.requestNotification();
      }
    }
  }

  getSnapshot(): LivingRuntimeSnapshot {
    return Object.freeze({
      version: this.version,
      ports: Object.freeze(
        [...this.ports.values()].map((port) => this.snapshotPort(port)),
      ),
      connections: Object.freeze(
        [...this.connections.values()].map((connection) =>
          this.snapshotConnection(connection),
        ),
      ),
    });
  }

  getConnection(id: string): LivingConnectionSnapshot | undefined {
    const connection = this.connections.get(id);
    return connection ? this.snapshotConnection(connection) : undefined;
  }

  getPort(address: LivingPortAddress): LivingPortSnapshot | undefined {
    const port = this.ports.get(livingPortKey(address));
    return port ? this.snapshotPort(port) : undefined;
  }

  getLastPacket(address: LivingPortAddress): LivingPacket | undefined {
    return this.ports.get(livingPortKey(address))?.lastPacket;
  }

  private enqueueOutgoing(packet: LivingPacket, trace: FlowTrace): void {
    const ids = this.outgoing.get(livingPortKey(packet.source));
    if (!ids) return;
    for (const connectionId of ids) {
      this.enqueue({ connectionId, packet, trace, release: false });
    }
  }

  private enqueue(delivery: QueuedDelivery): void {
    this.deliveryQueue.push(delivery);
    this.requestDispatch();
  }

  private requestDispatch(): void {
    if (
      this.batchDepth > 0 ||
      this.isDispatching ||
      this.dispatchScheduled ||
      this.deliveryQueue.length === 0
    ) {
      return;
    }

    this.dispatchScheduled = true;
    this.schedule(() => this.drainDeliveries());
  }

  private drainDeliveries(): void {
    this.dispatchScheduled = false;
    if (this.isDispatching) return;

    this.isDispatching = true;
    let delivered = 0;
    try {
      while (this.deliveryQueue.length > 0) {
        if (delivered >= this.maxDeliveriesPerFlush) {
          this.blockRemainingForBudget();
          break;
        }
        const next = this.deliveryQueue.shift();
        if (!next) break;
        this.processDelivery(next);
        delivered += 1;
      }
    } finally {
      this.isDispatching = false;
      this.scheduleSettling();
      this.requestDispatch();
    }
  }

  private processDelivery(delivery: QueuedDelivery): void {
    const connection = this.connections.get(delivery.connectionId);
    if (!connection) return;

    if (delivery.trace.path.includes(connection.id)) {
      if (
        this.setBlocked(
          connection,
          'cycle-detected',
          `Flow ${delivery.trace.flowId} tried to traverse ${connection.id} twice.`,
        )
      ) {
        this.touch();
      }
      return;
    }

    if (delivery.trace.path.length >= this.maxHops) {
      if (
        this.setBlocked(
          connection,
          'max-hops-exceeded',
          `Flow ${delivery.trace.flowId} exceeded the ${this.maxHops}-hop limit.`,
        )
      ) {
        this.touch();
      }
      return;
    }

    if (connection.policy === 'breathe' && !delivery.release) {
      connection.pending = delivery;
      const structuralProblem = this.structuralProblem(connection);
      if (structuralProblem) {
        this.setBlocked(
          connection,
          structuralProblem.code,
          structuralProblem.message,
        );
      } else {
        connection.status = 'resting';
        connection.blockedReason = undefined;
      }
      this.touch();
      return;
    }

    const structuralProblem = this.structuralProblem(connection);
    if (structuralProblem) {
      if (
        this.setBlocked(
          connection,
          structuralProblem.code,
          structuralProblem.message,
        )
      ) {
        this.touch();
      }
      return;
    }

    const targetPort = this.ports.get(livingPortKey(connection.to));
    if (!targetPort) return;
    const validationProblem = this.valueValidationProblem(
      targetPort.definition,
      delivery.packet.value,
    );
    if (validationProblem) {
      if (this.setBlocked(connection, 'invalid-value', validationProblem)) {
        this.touch();
      }
      return;
    }

    const path = Object.freeze([...delivery.trace.path, connection.id]);
    const connectionRevision = connection.revision + 1;
    const packet = freezePacket<SerializableValue>({
      id: this.createId('packet'),
      flowId: delivery.trace.flowId,
      parentPacketId: delivery.packet.id,
      source: delivery.packet.source,
      target: connection.to,
      connectionId: connection.id,
      type: delivery.packet.type,
      value: delivery.packet.value,
      ...(delivery.packet.metadata === undefined
        ? {}
        : { metadata: delivery.packet.metadata }),
      revision: delivery.packet.revision,
      connectionRevision,
      emittedAt: delivery.packet.emittedAt,
      deliveredAt: this.now(),
      hops: path.length,
      path,
    });

    connection.revision = connectionRevision;
    connection.activityToken += 1;
    connection.lastPacket = packet;
    connection.pending = undefined;
    connection.status = 'flowing';
    connection.blockedReason = undefined;
    targetPort.revision += 1;
    targetPort.lastPacket = packet;
    this.settlingConnections.set(connection.id, connection.activityToken);
    this.touch();

    const subscribers = this.inputSubscribers.get(livingPortKey(connection.to));
    if (!subscribers || subscribers.size === 0) return;

    const previousTrace = this.activeTrace;
    this.activeTrace = {
      flowId: packet.flowId,
      path,
      parentPacketId: packet.id,
    };
    const context: LivingDeliveryContext = Object.freeze({
      connection: this.snapshotConnection(connection),
      emit: <T extends SerializableValue>(
        source: LivingPortAddress,
        value: T,
        options?: LivingEmitOptions,
      ) => this.emit(source, value, options),
    });

    try {
      for (const subscriber of [...subscribers]) {
        try {
          subscriber(packet, context);
        } catch (error) {
          this.setBlocked(
            connection,
            'subscriber-error',
            `An input subscriber failed: ${asError(error).message}`,
          );
          this.reportFault({
            phase: 'input-subscriber',
            error: asError(error),
            connectionId: connection.id,
            address: connection.to,
          });
          this.touch();
        }
      }
    } finally {
      this.activeTrace = previousTrace;
    }
  }

  private blockRemainingForBudget(): void {
    const remaining = this.deliveryQueue.splice(0);
    const blocked = new Set<string>();
    for (const delivery of remaining) {
      if (blocked.has(delivery.connectionId)) continue;
      const connection = this.connections.get(delivery.connectionId);
      if (!connection) continue;
      blocked.add(connection.id);
      this.setBlocked(
        connection,
        'delivery-budget-exceeded',
        `A dispatch exceeded the ${this.maxDeliveriesPerFlush}-delivery safety budget.`,
      );
    }
    if (blocked.size > 0) this.touch();
  }

  private scheduleSettling(): void {
    if (this.settleScheduled || this.settlingConnections.size === 0) return;
    this.settleScheduled = true;
    this.schedule(() => {
      this.settleScheduled = false;
      let changed = false;
      for (const [id, token] of this.settlingConnections) {
        const connection = this.connections.get(id);
        if (
          connection?.status === 'flowing' &&
          connection.activityToken === token
        ) {
          connection.status = 'resting';
          changed = true;
        }
      }
      this.settlingConnections.clear();
      if (changed) this.touch();
    });
  }

  private valueValidationProblem(
    port: LivingPortDefinition,
    value: SerializableValue,
  ): string | undefined {
    if (!baseValueMatchesType(value, port.type)) {
      return `Port ${port.artifactId}:${port.portId} expects a ${port.type} value.`;
    }

    if (!port.validate) return undefined;
    try {
      const result = port.validate(value);
      if (result === true) return undefined;
      return typeof result === 'string'
        ? result
        : `Port ${port.artifactId}:${port.portId} rejected the value.`;
    } catch (error) {
      return `Port ${port.artifactId}:${port.portId} validator failed: ${asError(error).message}`;
    }
  }

  private structuralProblem(
    connection: RuntimeConnection,
  ): { code: LivingBlockCode; message: string } | undefined {
    const source = this.ports.get(livingPortKey(connection.from));
    const target = this.ports.get(livingPortKey(connection.to));

    if (!source) {
      return {
        code: 'source-port-missing',
        message: `Source port ${connection.from.artifactId}:${connection.from.portId} is not registered.`,
      };
    }
    if (!target) {
      return {
        code: 'target-port-missing',
        message: `Target port ${connection.to.artifactId}:${connection.to.portId} is not registered.`,
      };
    }
    if (source.definition.direction !== 'output') {
      return {
        code: 'source-not-output',
        message: `Source port ${connection.from.artifactId}:${connection.from.portId} is not an output.`,
      };
    }
    if (target.definition.direction !== 'input') {
      return {
        code: 'target-not-input',
        message: `Target port ${connection.to.artifactId}:${connection.to.portId} is not an input.`,
      };
    }
    if (!livingTypesAreCompatible(source.definition.type, target.definition.type)) {
      return {
        code: 'incompatible-types',
        message: `Cannot bind ${source.definition.type} to ${target.definition.type}.`,
      };
    }
    return undefined;
  }

  private applyStructuralStatus(
    connection: RuntimeConnection,
    resetRuntimeBlock: boolean,
  ): boolean {
    const problem = this.structuralProblem(connection);
    if (problem) {
      return this.setBlocked(connection, problem.code, problem.message);
    }

    if (
      connection.status === 'blocked' &&
      (resetRuntimeBlock ||
        (connection.blockedReason !== undefined &&
          STRUCTURAL_BLOCKS.has(connection.blockedReason.code)))
    ) {
      connection.status = 'resting';
      connection.blockedReason = undefined;
      return true;
    }
    return false;
  }

  private refreshConnectionsForPort(key: string): void {
    const ids = new Set([
      ...(this.outgoing.get(key) ?? []),
      ...(this.incoming.get(key) ?? []),
    ]);
    for (const id of ids) {
      const connection = this.connections.get(id);
      if (connection) this.applyStructuralStatus(connection, false);
    }
  }

  private setBlocked(
    connection: RuntimeConnection,
    code: LivingBlockCode,
    message: string,
  ): boolean {
    if (
      connection.status === 'blocked' &&
      connection.blockedReason?.code === code &&
      connection.blockedReason.message === message
    ) {
      return false;
    }

    connection.status = 'blocked';
    connection.blockedReason = Object.freeze({ code, message, at: this.now() });
    this.settlingConnections.delete(connection.id);
    return true;
  }

  private snapshotPort(port: RuntimePort): LivingPortSnapshot {
    return Object.freeze({
      artifactId: port.definition.artifactId,
      portId: port.definition.portId,
      direction: port.definition.direction,
      type: port.definition.type,
      revision: port.revision,
      ...(port.lastPacket ? { lastPacket: port.lastPacket } : {}),
    });
  }

  private snapshotConnection(
    connection: RuntimeConnection,
  ): LivingConnectionSnapshot {
    return Object.freeze({
      id: connection.id,
      from: connection.from,
      to: connection.to,
      meaning: connection.meaning,
      policy: connection.policy,
      status: connection.status,
      revision: connection.revision,
      ...(connection.lastPacket ? { lastPacket: connection.lastPacket } : {}),
      hasPending: connection.pending !== undefined,
      ...(connection.pending ? { pendingPacket: connection.pending.packet } : {}),
      ...(connection.blockedReason
        ? { blockedReason: connection.blockedReason }
        : {}),
    });
  }

  private requireConnection(id: string): RuntimeConnection {
    const connection = this.connections.get(id);
    if (!connection) throw new Error(`Connection "${id}" does not exist.`);
    return connection;
  }

  private addToIndex(
    index: Map<string, Set<string>>,
    key: string,
    connectionId: string,
  ): void {
    let ids = index.get(key);
    if (!ids) {
      ids = new Set();
      index.set(key, ids);
    }
    ids.add(connectionId);
  }

  private removeFromIndex(
    index: Map<string, Set<string>>,
    key: string,
    connectionId: string,
  ): void {
    const ids = index.get(key);
    if (!ids) return;
    ids.delete(connectionId);
    if (ids.size === 0) index.delete(key);
  }

  private touch(): void {
    this.version += 1;
    this.requestNotification();
  }

  private requestNotification(): void {
    if (
      this.batchDepth > 0 ||
      this.notifyScheduled ||
      this.stateSubscribers.size === 0
    ) {
      return;
    }

    this.notifyScheduled = true;
    this.schedule(() => {
      this.notifyScheduled = false;
      if (this.stateSubscribers.size === 0) return;
      const snapshot = this.getSnapshot();
      for (const subscriber of [...this.stateSubscribers]) {
        try {
          subscriber(snapshot);
        } catch (error) {
          this.reportFault({
            phase: 'state-subscriber',
            error: asError(error),
          });
        }
      }
    });
  }

  private reportFault(fault: LivingRuntimeFault): void {
    if (!this.onError) return;
    try {
      this.onError(fault);
    } catch {
      // Runtime error reporting must never interrupt packet routing.
    }
  }
}
