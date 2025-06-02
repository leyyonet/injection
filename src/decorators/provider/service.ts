import {decoratorPool} from "@leyyo/core";
import {Dict} from "@leyyo/common";

import {FQN} from "../../internal";
import {Provider, ProviderOpt, ProviderParam} from "./provider";

export function Service(): MethodDecorator;
export function Service(secureMode?: boolean): MethodDecorator;
export function Service(identifier?: string, secureMode?: boolean): MethodDecorator;

export function Service(): ClassDecorator;
export function Service(secureMode?: boolean): ClassDecorator;
export function Service(identifier?: string, secureMode?: boolean): ClassDecorator;

export function Service(p1?: string | boolean, p2?: boolean): MethodDecorator | ClassDecorator {
    return (clazz: any, propertyKey?: any, descriptor?: any) =>
        cloned.process([clazz, propertyKey, descriptor], {p1, p2, tag: 'service'});
}

const cloned = decoratorPool
    .newClone<ProviderOpt, Dict, ProviderParam>(Service, Provider)
    .fqn(FQN);
