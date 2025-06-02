import {Dict, Func} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";

import {FQN} from "../../internal";
import {Inject, InjectOpt, InjectParams} from "./inject";

export function AutoWired(optional?: boolean): MethodDecorator;
export function AutoWired(optional?: boolean): PropertyDecorator;
export function AutoWired(identifier?: string, optional?: boolean): MethodDecorator;
export function AutoWired(identifier?: string, optional?: boolean): PropertyDecorator;
export function AutoWired(p1?: string | boolean, p2?: boolean): MethodDecorator | PropertyDecorator {
    return (clazz: Func, property: PropertyKey, descriptor?: TypedPropertyDescriptor<any>) =>
        cloned.process([clazz, property, descriptor], {p1, p2, tag: 'auto-wired'});
}

const cloned = decoratorPool
    .newClone<InjectOpt, Dict, InjectParams>(AutoWired, Inject)
    .fqn(FQN)
    .targets('method', 'field');
