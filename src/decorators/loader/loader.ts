import {$assert, $dev, $is, EnumLiteral, Func, Obj} from "@leyyo/common";
import {decoratorPool, fqnHandler} from "@leyyo/core";
import {FQN} from "../../internal";

interface O {
    resources: Array<Func | Obj | EnumLiteral>;
}

export function Loader(...resources: Array<Func | Obj | EnumLiteral>): ClassDecorator {
    return clazz => {
        id.process([clazz], {resources});
    };
}

const id = decoratorPool.newId<O>(Loader)
    .fqn(FQN)
    .targets('class')
    .rules('no-multiple', 'no-inherited')
    .processor((ins, p: O) => {
        $assert.array(p.resources, () => $dev.desc(ins, {field: 'resources'}));
        const wrong = p.resources.filter(r => !($is.func(r) || $is.object(r) || $is.array(r)));
        if (wrong.length > 0) {
            throw $dev.invalidError({
                issue: 'loader.item.invalid', desc: ins.description,
                wrong: wrong.map(f => fqnHandler.get(f)).join(', ')
            });
        }
        ins.set(p);
    });
