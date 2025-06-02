import {
    Fqn,
    fqnHandler,
    NamedDepotLike,
    NamedDepotSecure,
    namedPool,
    ParameterReflectionLike
} from "@leyyo/core";
import {$descriptor, $dev, $is, $log, $name, $repo, ClassLike, Func, List} from "@leyyo/common";

import {FQN} from "../internal";
import {InjectionDiscover, InjectionDiscoverLike} from "../discover";
import {InjectionPoolLike, InjectionPoolSecure, InjectItem, ProviderItem} from "./index.types";
import {InjectionAnonymousSign} from "../index.symbols";

@Fqn(FQN)
export class InjectionPool implements InjectionPoolLike, InjectionPoolSecure {
    protected readonly _depot: NamedDepotLike<ProviderItem, ClassLike>;
    protected readonly _secure: NamedDepotSecure<ProviderItem, ClassLike>;
    protected _injects: List<InjectItem>;
    protected _params: Set<ParameterReflectionLike>;

    private readonly logger = $log.create(InjectionPool);

    constructor() {
        this._depot = namedPool.assign<ProviderItem, ClassLike>(
            FQN, 'pool.items',
            ins => ins.clazz,
            ins => typeof ins.clazz === 'function'
        );
        this._secure = this._depot.$secure;
        this._injects = $repo.newList(FQN, 'injects');
        this._params = $repo.newSet(FQN, 'parameters');
    }

    // region public
    getInstance<T>(given: Func | ClassLike<T> | string, required?: boolean): T {
        const value = this._depot.fetchValue(given, required);
        if (!value?.instance && required) {
            throw $dev.developerError2(FQN, 100, {
                message: 'Instance could not be found',
                clazz: fqnHandler.get(given),
            });
        }
        return value?.instance as T;
    }


    providers(): Array<ProviderItem> {
        return this._secure.$bases.map(base => base.value);
    }

    get<T>(given: Func | ClassLike<T> | string, required?: boolean): ProviderItem {
        const base = this._depot.get(given, required);
        return base?.value as ProviderItem;
    }

    exists(given: Func | ClassLike | string): boolean {
        return this._depot.has(given);
    }


    isBuilt(given: Func | ClassLike | string): boolean {
        const value = this._depot.fetchValue(given, false);
        return !$is.empty(value?.instance);

    }

    remove(given: Func | ClassLike | string, raiseIfAbsent?: boolean): boolean {
        const [removed, lookup] = this._secure.$remove(given, raiseIfAbsent);
        if (!removed) {
            this.logger.info(`${lookup.basic} is ignored for remove`);
        } else {
            this.logger.info(`${lookup.any} is removed`);
        }
        return removed;
    }

    // endregion public

    // region secure
    private _discover: InjectionDiscoverLike;

    get $back(): InjectionPoolLike {
        return this;
    }

    get $secure(): InjectionPoolSecure {
        return this;
    }

    get $discover(): InjectionDiscoverLike {
        return this._discover;
    }

    $setDiscover(discover: InjectionDiscoverLike): void {
        this._discover = discover;
    }

    get $pendingProviders(): Array<ProviderItem> {
        return this.providers().filter(item => !item.instance);
    }
    get $pendingInjects(): Array<InjectItem> {
        return Array.from(this._injects.values())
            .filter(item => !item.instance);
    }

    $addProvider(partial: Partial<ProviderItem>): ProviderItem {
        const item = {...partial} as ProviderItem;
        item.injectKinds = {"lazy-method": 0, "lazy-prop": 0, parameter: 0};
        item.injectTags = {"auto-wired": 0, "lazy-inject": 0, "post-construct": 0, inject: 0};
        if (!Array.isArray(item.parameters)) {
            item.parameters = [];
        }
        if (!Array.isArray(item.callbacks)) {
            item.callbacks = [];
        }
        if (item.identifier) {
            this._depot.add(item, item.identifier)
        }
        else {
            this._depot.add(item)
        }
        this.logger.debug(`Provider [${item.clazz.name}] queued`);
        return item;
    }

    get $injects(): Array<InjectItem> {
        return this._injects;
    }

    $addInject(item: InjectItem): void {
        this.logger.debug(`Inject [${item.ref.description}] queued`);
        this._injects.push(item);
    }

    $addParamCache(param: ParameterReflectionLike): void {
        this._params.add(param);
    }

    $hasParamCache(param: ParameterReflectionLike): boolean {
        return this._params.has(param);
    }

    $newAnonymousProvider(identifier?: string): ClassLike {
        const provider = class {
        };
        const name = $name.anonymous('Injection');
        $name.set(provider, name);
        fqnHandler.clazz(provider, FQN);
        if (identifier) {
            $descriptor.save(provider, InjectionAnonymousSign, identifier);
            this.logger.debug(`Anonymous [${provider.name}] created as ${identifier}`);
        } else {
            this.logger.debug(`Anonymous [${provider.name}] created`);
        }
        return provider;
    }

    $getAnonymousIdentifier(clazz: ClassLike): string {
        return $descriptor.getValue<string>(clazz, InjectionAnonymousSign);
    }

    $isAnonymousIdentifier(clazz: ClassLike): boolean {
        return $descriptor.has(clazz, InjectionAnonymousSign);
    }

    $clear(): void {
        this._injects.clear();
        this._params.clear();
    }
    $bind(provider: ProviderItem, inject: InjectItem): void {
        inject.providerItem = provider;
        if (provider.injectKinds[inject.kind] === undefined) {
            provider.injectKinds[inject.kind] = 1;
        }
        else {
            provider.injectKinds[inject.kind]++;
        }
        if (provider.injectTags[inject.tag] === undefined) {
            provider.injectTags[inject.tag] = 1;
        }
        else {
            provider.injectTags[inject.tag]++;
        }
    }

    // endregion secure
}

export const injectionPool: InjectionPoolLike = new InjectionPool();
injectionPool.$secure.$setDiscover(new InjectionDiscover(injectionPool));
