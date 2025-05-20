import {Func} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";
import {Inject} from "./inject";
import {FQN} from "../../internal";

export function AutoWired(identifier?: string): MethodDecorator;
export function AutoWired(identifier?: string): PropertyDecorator;
export function AutoWired(identifier?: string): MethodDecorator | PropertyDecorator {
    return (clazz: Func, property: PropertyKey, descriptor?: TypedPropertyDescriptor<any>) =>
        cloned.process([clazz, property, descriptor], {identifier});
}

const cloned = decoratorPool
    .newClone(AutoWired, Inject)
    .fqn(FQN)
    .targets('method', 'field');
