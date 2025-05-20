import {EnumLiteral, Func, Obj} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";
import {Loader} from "./loader";


interface O {
    resources: Array<Func | Obj | EnumLiteral>;
}

export function Module(...resources: Array<Func | Obj>): ClassDecorator {
    return clazz => {
        cloned.process([clazz], {resources});
    };
}

const cloned = decoratorPool
    .newClone<O>(Module, Loader)
    .fqn(FQN);
