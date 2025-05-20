import {decoratorPool} from "@leyyo/core";
import {PostConstruct} from "./post-construct";
import {FQN} from "../../internal";
import {Func} from "@leyyo/common";

interface O {
    identifier?: string;
}

export function LazyInject(identifier?: string): MethodDecorator;
export function LazyInject(identifier?: string): PropertyDecorator;
export function LazyInject(identifier?: string): MethodDecorator | PropertyDecorator {
    return (clazz: Func, property: PropertyKey, descriptor?: TypedPropertyDescriptor<any> | number) =>
        cloned.process([clazz, property, descriptor], {identifier});
}

const cloned = decoratorPool
    .newClone<O>(LazyInject, PostConstruct)
    .fqn(FQN);
