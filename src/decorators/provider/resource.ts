import {Dict} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";

import {FQN} from "../../internal";
import {Provider, ProviderOpt, ProviderParam} from "./provider";

export function Resource(): MethodDecorator;
export function Resource(secureMode?: boolean): MethodDecorator;
export function Resource(identifier?: string, secureMode?: boolean): MethodDecorator;

export function Resource(): ClassDecorator;
export function Resource(secureMode?: boolean): ClassDecorator;
export function Resource(identifier?: string, secureMode?: boolean): ClassDecorator;

export function Resource(p1?: string | boolean, p2?: boolean): MethodDecorator | ClassDecorator {
    return (clazz: any, propertyKey?: any, descriptor?: any) =>
        cloned.process([clazz, propertyKey, descriptor], {p1, p2, tag: 'resource'});
}

const cloned = decoratorPool
    .newClone<ProviderOpt, Dict, ProviderParam>(Resource, Provider)
    .fqn(FQN);
