import {ClassLike, Func, ShiftMain, ShiftSecure} from "@leyyo/common";
import {CoreReflectionLike, DecoInstanceLike, ParameterReflectionLike} from "@leyyo/core";
import {InjectionDiscoverLike} from "../discover";
import {InjectTag, ProviderTag} from "../decorators";

export interface ProviderItem {
    clazz: ClassLike;
    providerKind: ProviderKind;
    providerTag: ProviderTag;
    injectKinds: Record<InjectKind, number>;
    injectTags: Record<InjectTag, number>;
    identifier?: string;
    instance: any;

    secureMode?: boolean;
    ins?: DecoInstanceLike;
    parameters: Array<InjectItem>;
    instantiate?: InjectionInstantiateAsync,
    weight?: number;
    callbacks: Array<InjectionCopyLambda>;
}

export type ProviderKind = 'basic' | 'resource' | 'runtime';
export type InjectKind = 'parameter' | 'lazy-prop' | 'lazy-method';

export interface InjectItem {
    kind: InjectKind;
    instance?: any;

    identifier?: string;
    tag?: InjectTag;
    type?: ClassLike;
    ref?: CoreReflectionLike;
    providerItem?: ProviderItem;
    optional?: boolean;
    ignored?: boolean;
    logs: Array<string>;
    instantiate?: InjectionInstantiateAsync,
}

export type InjectionInstantiateAsync = () => Promise<any>;
export type InjectionCopyLambda = (instance: any) => void;

export interface InjectionPoolLike extends ShiftSecure<InjectionPoolSecure> {
    getInstance<T>(identifier: string, required?: boolean): T;

    getInstance<T>(clazz: ClassLike<T>, required?: boolean): T;

    getInstance<T>(fn: Func, required?: boolean): T;

    providers(): Array<ProviderItem>;

    get<T>(identifier: string, required?: boolean): ProviderItem;

    get<T>(clazz: ClassLike, required?: boolean): ProviderItem;

    get<T>(fn: Func, required?: boolean): ProviderItem;

    exists(identifier: string): boolean;

    exists(clazz: ClassLike): boolean;

    exists(fn: Func): boolean;


    isBuilt(identifier: string): boolean;

    isBuilt(clazz: ClassLike): boolean;

    isBuilt(fn: Func): boolean;

    remove(identifier: string, raiseIfAbsent?: boolean): boolean;

    remove(clazz: ClassLike, raiseIfAbsent?: boolean): boolean;

    remove(fn: Func, raiseIfAbsent?: boolean): boolean;

}
export interface InjectionPoolSecure extends ShiftMain<InjectionPoolLike> {
    $setDiscover(discover: InjectionDiscoverLike): void;
    get $discover(): InjectionDiscoverLike;

    get $pendingProviders(): Array<ProviderItem>;
    $addProvider(item: Partial<ProviderItem>): ProviderItem;
    get $injects(): Array<InjectItem>;
    get $pendingInjects(): Array<InjectItem>;
    $addInject(item: InjectItem): void;
    $addParamCache(param: ParameterReflectionLike): void;
    $hasParamCache(param: ParameterReflectionLike): boolean;
    $newAnonymousProvider(identifier?: string): ClassLike;
    $getAnonymousIdentifier(clazz: ClassLike): string;
    $isAnonymousIdentifier(clazz: ClassLike): boolean;
    $clear(): void;
    $bind(provider: ProviderItem, inject: InjectItem): void;
}
