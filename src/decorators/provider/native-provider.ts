import {Dict} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";

import {FQN} from "../../internal";
import {Provider, ProviderOpt, ProviderParam} from "./provider";

export function NativeProvider(): MethodDecorator;
export function NativeProvider(secureMode?: boolean): MethodDecorator;
export function NativeProvider(identifier?: string, secureMode?: boolean): MethodDecorator;

export function NativeProvider(): ClassDecorator;
export function NativeProvider(secureMode?: boolean): ClassDecorator;
export function NativeProvider(identifier?: string, secureMode?: boolean): ClassDecorator;

export function NativeProvider(p1?: string | boolean, p2?: boolean): MethodDecorator | ClassDecorator {
    return (clazz: any, propertyKey?: any, descriptor?: any) =>
        cloned.process([clazz, propertyKey, descriptor], {p1, p2, tag: 'native-provider'});
}

const cloned = decoratorPool
    .newClone<ProviderOpt, Dict, ProviderParam>(NativeProvider, Provider)
    .fqn(FQN);
