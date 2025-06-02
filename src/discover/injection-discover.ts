import {InjectionDiscoverLike, InjectionOptionalState} from "./index.types";
import {
    DecoInstanceLike,
    decoratorPool,
    footprint,
    Fqn,
    lifecycle,
    ParameterReflectionLike,
    reflectionPool
} from "@leyyo/core";
import {$dev, $is, $log, ClassLike, DevOpt, Exception, Func} from "@leyyo/common";
import {FQN} from "../internal";
import {InjectionPoolLike, InjectionPoolSecure, InjectItem, ProviderItem, ProviderKind} from "../pool";
import {Inject, InjectOpt, Provider, ProviderOpt} from "../decorators";

@Fqn(FQN)
export class InjectionDiscover implements InjectionDiscoverLike {
    private readonly _DEEP = 3;
    private readonly _SYS_CLASSES = [Number, String, Boolean, BigInt, Array, Object, Map, Set] as Array<ClassLike>;
    private readonly _WEIGHT = {
        basic: 1,
        resource: 10,
        runtime: 20,
    } as Record<ProviderKind, number>;

    private secure: InjectionPoolSecure;
    private readonly logger = $log.create(InjectionDiscover);

    constructor(private pool: InjectionPoolLike) {
        this.secure = pool.$secure;

        lifecycle.onAll(FQN)
            .before('leyyo.http-api');

        lifecycle.onInitialize(FQN, () => this.initialize());
        lifecycle.onValidate(FQN, async () => this.build());
        lifecycle.onClear(FQN, () => this.secure.$clear());
    }

    // region public
    initialize(): void {
        this._initProviders();
        this._missedProviders();

        this._initConstructors();
        this._initInjects();
    }

    async build(): Promise<void> {
        await this._tryAgain('wait-then-ignore', [], this._DEEP);
        this._checkPending();
    }

    // endregion public

    // region special
    private _checkPending(): void {
        const pendingProviders = this.secure.$pendingProviders;
        if (pendingProviders.length > 0) {
            throw $dev.developerError2(FQN, 100, {
                message: 'Pending providers',
                pendingProviders,
            })
        }

        const pendingInjects = this.secure.$pendingInjects;
        if (pendingInjects.length > 0) {
            throw $dev.developerError2(FQN, 100, {
                message: 'Pending providers',
                pendingInjects,
            })
        }
    }
    private _checkSystemClass(provider: ClassLike, opt: DevOpt): void {
        if (this._SYS_CLASSES.includes(provider)) {
            throw $dev.developerError2(FQN, 100, {
                message: 'System type should not be used',
                provider,
                ...opt,
            });
        }
    }

    // endregion special

    // region providers
    protected _initProviders() {
        decoratorPool.get(Provider).asIdentifier.instances
            .forEach(ins => {
                const doc = ins.getValue<ProviderOpt>();
                if (ins.isClass) {
                    this._fetchClassProvider(ins, doc);
                } else if (ins.isMethod) {
                    this._fetchMethodProvider(ins, doc);
                }
            });
    }

    protected _fetchClassProvider(ins: DecoInstanceLike, doc: ProviderOpt) {
        this.secure.$addProvider({
            providerKind: 'basic',
            identifier: doc.identifier,
            providerTag: doc.tag,
            secureMode: doc.secureMode,
            clazz: ins.asClass.creator,
            ins,
        });
    }

    protected _fetchMethodProvider(ins: DecoInstanceLike, doc: ProviderOpt) {
        const methodRef = ins.asMethod;
        const classRef = methodRef.clazz;

        let item: ProviderItem;
        let provider: ClassLike;
        if (doc.identifier) {
            item = this.pool.get(doc.identifier, false);
            if (item) {
                throw $dev.developerError2(FQN, 100, {
                    message: 'Duplicated identifier',
                    desc: ins.description,
                    identifier: doc.identifier,
                });
            }
            provider = this.secure.$newAnonymousProvider(doc.identifier);
            item = this.secure.$addProvider({
                providerKind: 'resource',
                clazz: provider,
                identifier: doc.identifier,
                providerTag: doc.tag,
                secureMode: doc.secureMode,
                ins,
            });
        }
        // if identifier is used, type should not be used
        else if (methodRef.type) {
            provider = methodRef.type as ClassLike;
            item = this.pool.get(provider, false);
            if (item) {
                throw $dev.developerError2(FQN, 100, {
                    message: 'Duplicated Provider',
                    desc: ins.description,
                    type: methodRef.type.name,
                });
            }

            this._checkSystemClass(provider, {
                desc: ins.description,
                type: methodRef.type.name,
            });
            item = this.secure.$addProvider({
                providerKind: 'resource',
                clazz: provider,
                identifier: doc.identifier,
                providerTag: doc.tag,
                secureMode: doc.secureMode,
                ins,
            });
        } else {
            throw $dev.developerError2(FQN, 100, {
                message: 'Unknown Provider',
                desc: ins.description,
                type: methodRef.type.name,
            });
        }

        item.instantiate = async () => {
            const instance = this.pool.getInstance(classRef.creator, true);
            const methodFn = instance[methodRef.name] as Func;
            if (typeof methodFn !== 'function') {
                throw $dev.developerError2(FQN, 100, {
                    message: 'Method could not be found',
                    desc: ins.description,
                });
            }
            try {
                if (footprint.isAsync(methodFn)) {
                    item.instance = await methodFn();
                } else {
                    item.instance = methodFn();
                }
            } catch (e) {
                throw ((e instanceof Exception) ? e : Exception.cast(e));
            }
            if (!$is.object(item.instance)) {
                throw $dev.developerError2(FQN, 100, {
                    message: 'Instance creation is failed',
                    desc: ins.description,
                    provider: item.clazz,
                    identifier: item.identifier,
                });
            }
        }
    }

    protected _missedProviders() {
        decoratorPool.get(Inject).asIdentifier.instances
            .forEach(ins => {
                if (ins.isProperty) {
                    const classRef = ins.asProperty.clazz;
                    if (!this.pool.get(classRef.creator, false)) {
                        this.secure.$addProvider({
                            providerKind: 'runtime',
                            clazz: classRef.creator,
                            ins,
                        });
                    }
                }
            });
    }

    // endregion providers

    // region injects
    protected _enrichParam(injectItem: InjectItem, paramRef: ParameterReflectionLike): void {
        let found: boolean;
        paramRef.docsAll<InjectOpt>()
            .filter(doc => doc.ins.identifier.hasKeyword('inject'))
            .forEach(doc => {
                if (found) {
                    injectItem.logs.push('Duplicated: ' + doc.ins.description);
                }
                found = true;
                if (doc.value.optional && !injectItem.optional) {
                    injectItem.optional = true;
                    injectItem.logs.push('optional by decorator');
                }
                if (doc.value.identifier && !injectItem.identifier) {
                    injectItem.identifier = doc.value.identifier;
                }
                if (doc.value.tag && !injectItem.tag) {
                    injectItem.tag = doc.value.tag;
                }
            });
    }

    protected _findInjectType(ins: DecoInstanceLike, injectItem: InjectItem, clazz: ClassLike | string): ProviderItem {
        let anotherItem = this.pool.get(clazz as string, false);
        if (!anotherItem) {
            let provider: ClassLike;
            let identifier: string;
            if (typeof clazz === 'string') {
                identifier = clazz;
                provider = this.secure.$newAnonymousProvider(clazz);
            } else {
                provider = clazz;

            }
            anotherItem = this.secure.$addProvider({
                providerKind: 'runtime',
                identifier,
                clazz: provider,
                ins,
            });
        }
        anotherItem.callbacks.push(instance => {
            injectItem.instance = instance;
        });
        return anotherItem;
    }

    protected _initConstructors(): void {
        this.pool.providers().forEach(providerItem => {
            const refMethod = reflectionPool.get(providerItem.clazz).getInstanceProperty('constructor');
            if (!refMethod) {
                return;
            }
            refMethod.listParameters().forEach((paramRef, index) => {
                if (paramRef.isVariadic) {
                    throw $dev.developerError2(FQN, 100, {
                        issue: 'Variadic is not supported',
                        desc: providerItem.ins.description,
                        index
                    });
                }

                const injectItem = {
                    kind: 'parameter',
                    ref: paramRef,
                    logs: [],
                } as InjectItem;
                providerItem.parameters.push(injectItem);
                this.secure.$addParamCache(paramRef);
                this.secure.$addInject(injectItem);

                if (paramRef.hasDefault) {
                    injectItem.optional = true;
                    injectItem.logs.push('optional by parameter');
                }
                // find param decorator
                this._enrichParam(injectItem, paramRef);
                // identifier is used
                if (injectItem.identifier) {
                    this._findInjectType(providerItem.ins, injectItem, injectItem.identifier);
                    injectItem.providerItem = providerItem;
                }
                // if identifier is used, type should not be used
                else if (paramRef.type) {
                    injectItem.type = paramRef.type as ClassLike;
                    if (this._SYS_CLASSES.includes(injectItem.type)) {
                        if (!injectItem.optional) {
                            throw $dev.developerError2(FQN, 100, {
                                message: 'System type is used',
                                desc: providerItem.ins?.description,
                                index
                            });
                        }
                        injectItem.logs.push('ignored for system type');
                    }
                    this._findInjectType(providerItem.ins, injectItem, injectItem.type);
                    injectItem.providerItem = providerItem;
                } else {
                    throw $dev.developerError2(FQN, 100, {
                        message: 'Type could not be found',
                        desc: providerItem.ins?.description,
                        index
                    });
                }
            });
        });
    }

    protected _initInjects() {
        decoratorPool.get(Inject).asIdentifier.instances
            .forEach(ins => {
                const doc = ins.getValue<InjectOpt>();
                if (ins.isParameter) {
                    this._fetchParamInject(ins);
                } else if (ins.isField) {
                    this._fetchFieldInject(ins, doc);
                } else if (ins.isMethod) {
                    this._fetchMethodInject(ins, doc);
                }
            });
    }

    protected _fetchParamInject(ins: DecoInstanceLike) {
        const paramRef = ins.asParameter;
        if (!this.secure.$hasParamCache(paramRef)) {
            this.logger.warn(`Redundant inject: ${paramRef.description}`);
        }
    }

    protected _fetchFieldInject(ins: DecoInstanceLike, doc: InjectOpt) {
        const fieldRef = ins.asField;
        const classRef = fieldRef.clazz;
        const injectItem = {
            kind: 'lazy-prop',
            ref: fieldRef,
            identifier: doc.identifier,
            tag: doc.tag,

            logs: [],
        } as InjectItem;
        this.secure.$addInject(injectItem);

        let holderItem = this.pool.get(classRef.creator, false);
        if (!holderItem) {
            throw $dev.developerError2(FQN, 100, {
                message: 'Holder is not provider',
                desc: ins.description,
                clazz: classRef.description,
            });
        }
        if (doc.identifier) {
            injectItem.identifier = doc.identifier;
            injectItem.providerItem = this._findInjectType(ins, injectItem, injectItem.identifier);

            if (!injectItem.providerItem) {
                throw $dev.developerError2(FQN, 100, {
                    message: 'Provider could not be found',
                    desc: ins.description,
                    identifier: doc.identifier,
                });
            }
        }
        else if (fieldRef.type) {
            injectItem.type = fieldRef.type as ClassLike;
            injectItem.providerItem = this._findInjectType(ins, injectItem, injectItem.type);

            if (!injectItem.providerItem) {
                this._checkSystemClass(injectItem.type, {
                    desc: ins.description,
                    type: fieldRef.type.name,
                });
                throw $dev.developerError2(FQN, 100, {
                    message: 'Provider could not be found',
                    desc: ins.description,
                    clazz: fieldRef.type.name,
                });
            }
        }
        else {
            throw $dev.developerError2(FQN, 100, {
                message: 'Provider could not be found',
                desc: ins.description,
                type: fieldRef.type.name,
            });
        }

        injectItem.instantiate = async () => {
            const instance = this.pool.getInstance(classRef.creator, true);
            if (!$is.object(instance)) {
                throw $dev.developerError2(FQN, 100, {
                    message: 'Method could not be found',
                    desc: ins.description,
                });
            }
            const value = this.pool.getInstance((injectItem.identifier ?? injectItem.type) as string);
            if (!$is.object(value) && !injectItem.optional) {
                throw $dev.developerError2(FQN, 100, {
                    message: 'Method could not be found',
                    desc: ins.description,
                });
            }
            try {
                if (value) {
                    instance[fieldRef.name] = value;
                }
            } catch (e) {
                throw ((e instanceof Exception) ? e : Exception.cast(e));
            }
        }

    }

    protected _fetchMethodInject(ins: DecoInstanceLike, doc: InjectOpt) {
        const methodRef = ins.asField;
        const classRef = methodRef.clazz;


        const injectItem = {
            kind: 'lazy-method',
            ref: methodRef,
            identifier: doc.identifier,
            tag: doc.tag,

            logs: [],
        } as InjectItem;
        this.secure.$addInject(injectItem);

        let holderItem = this.pool.get(classRef.creator, false);
        if (!holderItem) {
            throw $dev.developerError2(FQN, 100, {
                message: 'Holder is not provider',
                desc: ins.description,
                clazz: classRef.description,
            });
        }

        if (methodRef.listParameters().length !== 1) {
            throw $dev.developerError({
                issue: 'member.must.have.only.one.parameter',
                desc: ins.description,
                clazz: classRef.name,
                paramSize: methodRef.listParameters().length
            });
        }
        const paramRef = methodRef.getParameter(0);

        if (doc.identifier) {
            injectItem.identifier = doc.identifier;
            injectItem.providerItem = this._findInjectType(ins, injectItem, injectItem.identifier);

            if (!injectItem.providerItem) {
                throw $dev.developerError2(FQN, 100, {
                    message: 'Provider could not be found',
                    desc: ins.description,
                    identifier: doc.identifier,
                });
            }
        } else if (paramRef.type) {

            injectItem.type = paramRef.type as ClassLike;
            injectItem.providerItem = this._findInjectType(ins, injectItem, injectItem.type);

            if (!injectItem.providerItem) {
                this._checkSystemClass(injectItem.type, {
                    desc: ins.description,
                    type: paramRef.type.name,
                });
                throw $dev.developerError2(FQN, 100, {
                    message: 'Provider could not be found',
                    desc: ins.description,
                    clazz: paramRef.type.name,
                });
            }
        } else {
            throw $dev.developerError2(FQN, 100, {
                message: 'Provider could not be found',
                desc: ins.description,
                type: paramRef.type.name,
            });
        }

        injectItem.instantiate = async () => {
            const instance = this.pool.getInstance(classRef.creator, true);
            if (!$is.object(instance)) {
                throw $dev.developerError2(FQN, 100, {
                    message: 'Method could not be found',
                    desc: ins.description,
                });
            }
            const value = this.pool.getInstance((injectItem.identifier ?? injectItem.type) as string);
            if (!$is.object(value) && !injectItem.optional) {
                throw $dev.developerError2(FQN, 100, {
                    message: 'Method could not be found',
                    desc: ins.description,
                });
            }

            const methodFn = instance[methodRef.name] as Func;
            if (typeof methodFn !== 'function') {
                throw $dev.developerError2(FQN, 100, {
                    message: 'Method could not be found',
                    desc: ins.description,
                });
            }
            try {
                if (footprint.isAsync(methodFn)) {
                    await methodFn(value);
                } else {
                    methodFn(value);
                }
            } catch (e) {
                throw ((e instanceof Exception) ? e : Exception.cast(e));
            }
        }

    }

    // endregion injects

    private _weight(item: ProviderItem): number {
        if (item.weight !== undefined) {
            return item.weight;
        }
        if (!item.providerKind) {
            item.weight = 100 + item.parameters.length;
        } else {
            item.weight = item.parameters.length + (this._WEIGHT[item.providerKind] ?? 100);
        }
        return item.weight;
    }


    protected _collectParameters(providerItem: ProviderItem, optionalState: InjectionOptionalState): Array<Object> {
        const args = [];
        providerItem.parameters.forEach(injectItem => {
            if (injectItem.instance) {
                args.push(injectItem.instance);
            } else if (injectItem.ignored) {
                args.push(undefined);
            } else if (injectItem.optional) {
                if (optionalState === 'ignore-then-undefined') {
                    args.push(undefined);
                }
            } else {
                const another = this.pool.get((injectItem.identifier ?? injectItem.type) as string, false);
                if (another) {
                    injectItem.instance = another.instance;
                    args.push(injectItem.instance);
                }
            }
        });
        return args;
    }

    protected async _createAnInstance(providerItem: ProviderItem, tree: Array<ProviderItem>, optionalState: InjectionOptionalState): Promise<number> {
        if (tree.includes(providerItem)) {
            return 0;
        }
        tree.push(providerItem);

        if ($is.object(providerItem.instance)) {
            return 0;
        }
        const classFn = providerItem.clazz;
        const args = this._collectParameters(providerItem, optionalState);
        if (providerItem.parameters.length !== args.length) {
            return 0;
        }

        try {
            providerItem.instance = new classFn(...args);
        } catch (e) {
            throw $dev.nativeError(e, {
                issue: 'instance.could.not.be.created',
                desc: providerItem.ins.description,
            });
        }
        providerItem.callbacks.forEach(cb => cb(providerItem.instance));
        if (providerItem.instantiate) {
            await providerItem.instantiate();
        }
        return 1;
    }

    protected _sumPrev(prev: Array<number>): number {
        return prev.reduce((accumulator, currentValue) => {
            return accumulator + currentValue
        }, 0);
    }

    protected _errorInfo(providerItem: ProviderItem): string {
        const params = providerItem.parameters.filter(p => !p.ignored && !p.instance).map((p, ix) => {
            if (p.identifier) {
                return `${ix}: i/${p.identifier}`;
            }
            return `${ix}: c/${p.type?.name ?? '?'}`;
        })
        return `${providerItem.ins?.description ?? 'no-deco'} [${params.join(', ')}]`;
    }

    protected async _tryAgain(optionalState: InjectionOptionalState, prev: Array<number>, deepSize: number): Promise<void> {
        const pendingProviders = this.secure.$pendingProviders;
        const first = pendingProviders.length;
        if (first < 1) {
            return;
        }
        let added = 0;
        const tree = [] as Array<ProviderItem>;
        pendingProviders
            .sort((first, second) => {
                const a = this._weight(first);
                const b = this._weight(second);
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                }
                return 0;
            });
        for (const providerItem of pendingProviders) {
            added += await this._createAnInstance(providerItem, tree, optionalState);
        }

        if (added === 0) {
            const sum = this._sumPrev(prev);
            prev.push(0);
            if (sum === 0) {
                if (prev.length >= this._DEEP) {
                    switch (optionalState) {
                        case 'wait-then-ignore':
                            // change optional methodology
                            return this._tryAgain('ignore-then-undefined', [], deepSize);
                        case "ignore-then-undefined":
                            // failed
                            throw $dev.developerError({
                                issue: 'injection.failed',
                                tree: tree.map(providerItem => this._errorInfo(providerItem))
                            });
                        case 'only-wait':
                            return;
                    }
                } else {
                    // continue
                    return this._tryAgain(optionalState, prev, deepSize);
                }
            }
        }
        // start again
        return this._tryAgain(optionalState, [], deepSize);
    }

}
