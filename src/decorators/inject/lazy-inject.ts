import {Dict, Func} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";

import {FQN} from "../../internal";
import {Inject, InjectOpt, InjectParams} from "./inject";

export function LazyInject(optional?: boolean): MethodDecorator;
export function LazyInject(optional?: boolean): PropertyDecorator;
export function LazyInject(identifier?: string, optional?: boolean): MethodDecorator;
export function LazyInject(identifier?: string, optional?: boolean): PropertyDecorator;
export function LazyInject(p1?: string | boolean, p2?: boolean): MethodDecorator | PropertyDecorator {
    return (clazz: Func, property: PropertyKey, descriptor?: TypedPropertyDescriptor<any> | number) =>
        cloned.process([clazz, property, descriptor], {p1, p2, tag: 'lazy-inject'});
}

const cloned = decoratorPool
    .newClone<InjectOpt, Dict, InjectParams>(LazyInject, Inject)
    .fqn(FQN);
