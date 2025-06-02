import {Dict} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";

import {Provider, ProviderOpt, ProviderParam} from "./provider";
import {FQN} from "../../internal";

export function Environment(): ClassDecorator;
export function Environment(secureMode?: boolean): ClassDecorator;
export function Environment(identifier?: string, secureMode?: boolean): ClassDecorator;
export function Environment(p1?: string | boolean, p2?: boolean): ClassDecorator {
    return (clazz: any, propertyKey?: any, descriptor?: any) =>
        cloned.process([clazz, propertyKey, descriptor], {p1, p2, tag: "environment"});
}

const cloned = decoratorPool
    .newClone<ProviderOpt, Dict, ProviderParam>(Environment, Provider)
    .fqn(FQN);
