import {AsyncProvider, AsyncProviderOpt} from "./async-provider";
import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";

const DEF_NAME = 'connectAsync';

export function DataSource(member: string = DEF_NAME, identifier?: string): ClassDecorator {
    return clazz =>
        cloned.process([clazz], {member, identifier, defName: DEF_NAME, tag: 'data-source'});
}

// core.injection.$secure.$addProvider([clazz, rec.identifier], {blocking: 'async', deco: rec.ins.identifier})
const cloned = decoratorPool
    .newClone<AsyncProviderOpt>(DataSource, AsyncProvider)
    .fqn(FQN);
