import {$assert, $dev, Dict, Func} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";

import {FQN} from "../../internal";

export interface InjectOpt {
    identifier?: string;
    optional?: boolean;
    tag: InjectTag;
}

export interface InjectParams {
    p1?: string | boolean;
    p2?: boolean;
    tag: InjectTag;
}

export type InjectTag = 'inject' | 'auto-wired' | 'lazy-inject' | 'post-construct';

export function Inject(optional?: boolean): MethodDecorator;
export function Inject(optional?: boolean): PropertyDecorator;
export function Inject(optional?: boolean): ParameterDecorator;
export function Inject(identifier?: string, optional?: boolean): MethodDecorator;
export function Inject(identifier?: string, optional?: boolean): PropertyDecorator;
export function Inject(identifier?: string, optional?: boolean): ParameterDecorator;
export function Inject(p1?: string | boolean, p2?: boolean): MethodDecorator | PropertyDecorator | ParameterDecorator {
    return (clazz: Func, property: PropertyKey, v3?: number | TypedPropertyDescriptor<any>) =>
        id.process([clazz, property, v3], {p1, p2, tag: 'inject'});
}

const id = decoratorPool
    .newId<InjectOpt, Dict, InjectParams>(Inject)
    .fqn(FQN)
    .targets('method', 'field', 'parameter')
    .rules('no-multiple', 'no-inherited')
    .keywords('inject')
    .processor((ins, p) => {
        const opt = {tag: p.tag} as InjectOpt;
        switch (typeof p.p1) {
            case 'string':
                $assert.textOptional(p.p1, () => $dev.desc(ins, {field: 'identifier'}));
                if (p.p1 !== undefined) {
                    opt.identifier = p.p1;
                }
                $assert.booleanOptional(p.p2, () => $dev.desc(ins, {field: 'optional'}));
                if (p.p2 !== undefined) {
                    opt.optional = p.p2;
                }
                break;
            case 'boolean':
                $assert.booleanOptional(p.p1, () => $dev.desc(ins, {field: 'optional'}));
                if (p.p1 !== undefined) {
                    opt.optional = p.p1;
                }
                break;
        }
        ins.set(opt);
    });
