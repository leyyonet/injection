import {Dict} from "@leyyo/common";
import {decoratorPool} from "@leyyo/core";

import {FQN} from "../../internal";
import {Provider, ProviderOpt, ProviderParam, ProviderResource} from "./provider";

// noinspection JSUnusedLocalSymbols
export function Loader(...resources: Array<ProviderResource>): ClassDecorator {
    return clazz => {
        cloned.process([clazz], {resources, tag: 'loader'});
    };
}

const cloned = decoratorPool
    .newClone<ProviderOpt, Dict, ProviderParam>(Loader, Provider)
    .fqn(FQN);
