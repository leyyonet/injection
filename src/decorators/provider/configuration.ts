import {Provider, ProviderOpt} from "./provider";
import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";

export function Configuration(identifier?: string): ClassDecorator {
    return clazz => {
        cloned.process([clazz], {identifier});
    };
}

const cloned = decoratorPool
    .newClone<ProviderOpt>(Configuration, Provider)
    .fqn(FQN);
