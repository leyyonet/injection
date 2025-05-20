import {decoratorPool} from "@leyyo/core";
import {FQN} from "../../internal";
import {$assert, $dev} from "@leyyo/common";

export interface ProviderOpt {
    identifier?: string;
}

export function Provider(identifier?: string): ClassDecorator {
    return clazz =>
        id.process([clazz], {identifier});
}

const id = decoratorPool.newId<ProviderOpt>(Provider)
    .fqn(FQN)
    .targets('class')
    .rules('no-multiple', 'no-inherited')
    .processor((ins, p) => {
        $assert.textOptional(p.identifier, () => $dev.desc(ins, {field: 'identifier'}));

        ins.set(p);
    });
