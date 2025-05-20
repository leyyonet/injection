import {AsyncProvider, AsyncProviderOpt} from "./async-provider";
import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";

const DEF_NAME = 'connectAsync';

export function BulkProvider(member: string = DEF_NAME, identifier?: string): ClassDecorator {
    return clazz =>
        cloned.process([clazz], {member, identifier, defName: DEF_NAME, tag: 'bulk'});
}

const cloned = decoratorPool
    .newClone<AsyncProviderOpt>(BulkProvider, AsyncProvider)
    .fqn(FQN);
