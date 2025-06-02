import {
    AsyncProvider,
    DataSource,
    Environment,
    Injectable,
    Loader,
    Module,
    NativeProvider,
    Provider,
    Resource,
    Service
} from "./provider";

import {AutoWired, Inject, LazyInject, PostConstruct} from "./inject";

export const $$injectionDecorators = [
    AsyncProvider, DataSource, NativeProvider, Resource,
    Inject, AutoWired,
    Loader, Module,
    PostConstruct, LazyInject,
    Provider, Environment, Injectable, Service,
];
