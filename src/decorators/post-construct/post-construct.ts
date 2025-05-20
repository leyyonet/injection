import {$assert, $dev, Func} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";

export interface PostConstructOpt {
    identifier?: string;
}

export function PostConstruct(identifier?: string): MethodDecorator;
export function PostConstruct(identifier?: string): PropertyDecorator;
export function PostConstruct(identifier?: string): MethodDecorator | PropertyDecorator {
    return (clazz: Func, property: PropertyKey, descriptor?: TypedPropertyDescriptor<any> | number) =>
        id.process([clazz, property, descriptor], {identifier});
}

const id = decoratorPool.newId<PostConstructOpt>(PostConstruct)
    .fqn(FQN)
    .targets('method', 'field')
    .rules('no-multiple', 'no-inherited')
    .processor((ins, p) => {
        $assert.textOptional(p.identifier, () => $dev.desc(ins, {field: 'identifier'}));

        ins.set(p);
    });
