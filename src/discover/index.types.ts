export interface InjectionDiscoverLike {
    initialize(): void;

    build(): Promise<void>;
}

export type InjectionOptionalState = 'wait-then-ignore' | 'ignore-then-undefined' | 'only-wait';
