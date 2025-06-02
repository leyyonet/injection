import {$assert, $dev, $is, ClassLike, Dict, EnumLiteral, Func, Obj} from "@leyyo/common";
import {decoratorPool, fqnHandler} from "@leyyo/core";

import {FQN} from "../../internal";

export interface ProviderOpt {
    /**
     * Custom name of provider
     * */
    identifier?: string;
    /**
     * Secure mode means any exception will be swallowed
     * So, it won't raise any error
     * */
    secureMode?: boolean;
    tag: ProviderTag;
    resources?: Array<ProviderResource>;
}

export interface ProviderParam {
    p1?: string | boolean;
    p2?: boolean;
    resources?: Array<ProviderResource>;
    tag: ProviderTag;
}

export type ProviderTag =
    'provider'
    | 'async-provider'
    | 'bulk-provider'
    | 'data-source'
    | 'environment'
    | 'injectable'
    | 'loader'
    | 'module'
    | 'native-provider'
    | 'resource'
    | 'service';
export type ProviderResource = Func | ClassLike | Obj | EnumLiteral;

export function Provider(): MethodDecorator;
export function Provider(secureMode?: boolean): MethodDecorator;
export function Provider(identifier?: string, secureMode?: boolean): MethodDecorator;

export function Provider(): ClassDecorator;
export function Provider(secureMode?: boolean): ClassDecorator;
export function Provider(identifier?: string, secureMode?: boolean): ClassDecorator;

export function Provider(p1?: string | boolean, p2?: boolean): MethodDecorator | ClassDecorator {
    return (clazz: any, propertyKey?: any, descriptor?: any) =>
        id.process([clazz, propertyKey, descriptor], {p1, p2, tag: 'provider'});
}

const id = decoratorPool
    .newId<ProviderOpt, Dict, ProviderParam>(Provider)
    .fqn(FQN)
    .targets('class')
    .rules('no-multiple', 'no-inherited')
    .keywords('provider')
    .processor((ins, p) => {
        const opt = {tag: p.tag} as ProviderOpt;
        switch (typeof p.p1) {
            case 'string':
                $assert.textOptional(p.p1, () => $dev.desc(ins, {field: 'identifier'}));
                if (p.p1 !== undefined) {
                    opt.identifier = p.p1;
                }
                $assert.booleanOptional(p.p2, () => $dev.desc(ins, {field: 'secureMode'}));
                if (p.p2 !== undefined) {
                    opt.secureMode = p.p2;
                }
                break;
            case 'boolean':
                $assert.booleanOptional(p.p1, () => $dev.desc(ins, {field: 'secureMode'}));
                if (p.p1 !== undefined) {
                    opt.secureMode = p.p1;
                }
                break;
        }
        if (!$is.empty(p.resources)) {
            $assert.array(p.resources, () => $dev.desc(ins, {field: 'resources'}));
            const wrong = p.resources.filter(r => !($is.func(r) || $is.object(r) || Array.isArray(r)));
            if (wrong.length > 0) {
                throw $dev.invalidError({
                    issue: 'loader.item.invalid', desc: ins.description,
                    wrong: wrong.map(f => fqnHandler.get(f)).join(', ')
                });
            }
            opt.resources = p.resources;
        }
        ins.set(opt);
    });
