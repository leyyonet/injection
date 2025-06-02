import {Dict} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";

import {FQN} from "../../internal";
import {Provider, ProviderOpt, ProviderParam} from "./provider";

export function DataSource(): MethodDecorator;
export function DataSource(secureMode?: boolean): MethodDecorator;
export function DataSource(identifier?: string, secureMode?: boolean): MethodDecorator;

export function DataSource(): ClassDecorator;
export function DataSource(secureMode?: boolean): ClassDecorator;
export function DataSource(identifier?: string, secureMode?: boolean): ClassDecorator;

export function DataSource(p1?: string | boolean, p2?: boolean): MethodDecorator | ClassDecorator {
    return (clazz: any, propertyKey?: any, descriptor?: any) =>
        cloned.process([clazz, propertyKey, descriptor], {p1, p2, tag: 'data-source'});
}

const cloned = decoratorPool
    .newClone<ProviderOpt, Dict, ProviderParam>(DataSource, Provider)
    .fqn(FQN);
