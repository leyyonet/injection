import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";
import {$assert, $dev, Func} from "@leyyo/common";

export interface InjectOpt {
    identifier?: string;
}

export function Inject(identifier?: string): MethodDecorator;
export function Inject(identifier?: string): PropertyDecorator;
export function Inject(identifier?: string): ParameterDecorator;
export function Inject(identifier?: string): MethodDecorator | PropertyDecorator | ParameterDecorator {
    return (clazz: Func, property: PropertyKey, v3?: number | TypedPropertyDescriptor<any>) =>
        id.process([clazz, property, v3], {identifier});
}

const id = decoratorPool
    .newId<InjectOpt>(Inject)
    .fqn(FQN)
    .targets('method', 'field', 'parameter')
    .rules('no-multiple', 'no-inherited')
    .processor((ins, p) => {
        $assert.textOptional(p.identifier, () => $dev.desc(ins, {field: 'identifier'}));

        ins.set(p);
    });
