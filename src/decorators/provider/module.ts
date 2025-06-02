import {Dict, EnumLiteral, Func, Obj} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";

import {FQN} from "../../internal";
import {Provider, ProviderOpt, ProviderParam} from "./provider";


interface O {
    resources: Array<Func | Obj | EnumLiteral>;
}

export function Module(...resources: Array<Func | Obj>): ClassDecorator {
    return clazz => {
        cloned.process([clazz], {resources, tag: 'module'});
    };
}

const cloned = decoratorPool
    .newClone<ProviderOpt, Dict, ProviderParam>(Module, Provider)
    .fqn(FQN);
