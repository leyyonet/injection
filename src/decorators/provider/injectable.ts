import {Provider, ProviderOpt} from "./provider";
import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";

export function Injectable(identifier?: string): ClassDecorator {
    return clazz => {
        cloned.process([clazz], {identifier});
    };
}

const cloned = decoratorPool
    .newClone<ProviderOpt>(Injectable, Provider)
    .fqn(FQN);
