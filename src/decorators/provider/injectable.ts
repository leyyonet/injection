import {decoratorPool} from "@leyyo/core";
import {Dict} from "@leyyo/common";

import {FQN} from "../../internal";
import {Provider, ProviderOpt, ProviderParam} from "./provider";

export function Injectable(): MethodDecorator;
export function Injectable(secureMode?: boolean): MethodDecorator;
export function Injectable(identifier?: string, secureMode?: boolean): MethodDecorator;

export function Injectable(): ClassDecorator;
export function Injectable(secureMode?: boolean): ClassDecorator;
export function Injectable(identifier?: string, secureMode?: boolean): ClassDecorator;
export function Injectable(p1?: string | boolean, p2?: boolean): MethodDecorator | ClassDecorator {
    return (clazz: any, propertyKey?: any, descriptor?: any) =>
        cloned.process([clazz, propertyKey, descriptor], {p1, p2, tag: 'injectable'});
}

const cloned = decoratorPool
    .newClone<ProviderOpt, Dict, ProviderParam>(Injectable, Provider)
    .fqn(FQN);
