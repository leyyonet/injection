import {decoratorPool} from "@leyyo/core";
import {AsyncProvider, AsyncProviderOpt} from "./async-provider";
import {FQN} from "../../internal";

const DEF_NAME = 'loadAsync';

export function Resource(member: string = DEF_NAME, identifier?: string): ClassDecorator {
    return clazz =>
        cloned.process([clazz], {member, identifier, defName: DEF_NAME, tag: 'resource'});
}

const cloned = decoratorPool
    .newClone<AsyncProviderOpt>(Resource, AsyncProvider)
    .fqn(FQN);
