import {Dict} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";

import {FQN} from "../../internal";
import {Provider, ProviderOpt, ProviderParam} from "./provider";

export function AsyncProvider(): MethodDecorator;
export function AsyncProvider(secureMode?: boolean): MethodDecorator;
export function AsyncProvider(identifier?: string, secureMode?: boolean): MethodDecorator;

export function AsyncProvider(): ClassDecorator;
export function AsyncProvider(secureMode?: boolean): ClassDecorator;
export function AsyncProvider(identifier?: string, secureMode?: boolean): ClassDecorator;

export function AsyncProvider(p1?: string | boolean, p2?: boolean): MethodDecorator | ClassDecorator {
    return (clazz: any, propertyKey?: any, descriptor?: any) =>
        cloned.process([clazz, propertyKey, descriptor], {p1, p2, tag: 'async-provider'});
}

const cloned = decoratorPool
    .newClone<ProviderOpt, Dict, ProviderParam>(AsyncProvider, Provider)
    .fqn(FQN);
