import {$assert, $descriptor, $dev} from "@leyyo/common";
import {decoratorPool, footprint} from "@leyyo/core";
import {ProviderOpt} from "../provider";
import {FQN} from "../../internal";

const DEF_NAME = 'loadAsync';

export interface AsyncProviderOpt extends ProviderOpt {
    member: string;
    defName: string;
    tag: string;
}

export function AsyncProvider(member: string = DEF_NAME, identifier?: string): ClassDecorator {
    return clazz =>
        id.process([clazz], {member, identifier, defName: DEF_NAME, tag: ''});
}

// core.injection.$secure.$addProvider([clazz, rec.identifier], {blocking: 'async', id: rec.ins.identifier})

const id = decoratorPool.newId<AsyncProviderOpt>(AsyncProvider)
    .fqn(FQN)
    .targets('class')
    .rules('no-multiple', 'no-inherited')
    .processor((ins, p) => {
        $assert.text(p.member, () => $dev.desc(ins, {field: 'member'}));
        $assert.textOptional(p.identifier, () => $dev.desc(ins, {field: 'identifier'}));

        const classRef = ins.asClass;
        const methodRef = classRef.getInstanceProperty(p.member);
        if (!methodRef || methodRef.kind !== 'method') {
            throw $dev.developerError({
                issue: 'class.should.have.loader.method',
                desc: ins.description,
                member: p.member,
                source: 'reflection'
            });
        }
        const paramSize = methodRef.listParameters().length;
        if (paramSize > 0) {
            throw $dev.developerError({
                issue: 'load.method.should.not.have.any.parameters',
                desc: ins.description,
                member: p.member,
                paramSize
            });
        }
        const descriptor = $descriptor.get(classRef.creator.prototype, methodRef.name);
        if (!descriptor) {
            throw $dev.developerError({
                issue: 'class.should.have.loader.method',
                reason: 'member.not.found',
                desc: ins.description,
                member: p.member,
                source: 'descriptor'
            });
        }
        if (typeof descriptor.value !== 'function') {
            throw $dev.developerError({
                issue: 'class.should.have.loader.method',
                reason: 'member.not.a.method',
                desc: ins.description,
                member: p.member,
                source: 'descriptor'
            });
        }
        if (!footprint.isAsync(descriptor.value)) {
            throw $dev.developerError({
                issue: 'method.is.not.async',
                desc: ins.description,
                member: p.member,
                source: 'descriptor'
            });
        }
        if (p.tag === 'native') {
            const descriptor = $descriptor.get(classRef.creator.prototype, 'native');
            if (!descriptor) {
                $dev.log({
                    issue: 'class.should.have.native.getter',
                    reason: 'native.not.found',
                    desc: ins.description,
                    member: p.member,
                    source: 'descriptor'
                }, 'warn');
            }
            if (typeof descriptor.get !== 'function') {
                $dev.log({
                    issue: 'member.does.not.have.native.getter',
                    desc: ins.description,
                    member: p.member,
                    source: 'descriptor'
                }, 'warn');
            }
        }
        ins.set(p);
    });
