import {AsyncProvider, AsyncProviderOpt} from "./async-provider";
import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";

const DEF_NAME = 'connectAsync';

export function NativeProvider(member: string = DEF_NAME, identifier?: string): ClassDecorator {
    return clazz =>
        cloned.process([clazz], {member, identifier, defName: DEF_NAME, tag: 'native'});
}

const cloned = decoratorPool
    .newClone<AsyncProviderOpt>(NativeProvider, AsyncProvider)
    .fqn(FQN);
