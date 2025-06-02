import {Loader} from "./decorators";
import {injectionPool} from "./pool";
import {$$injectionDecorators} from "./decorators/internal.loader";

@Loader(...$$injectionDecorators)
export class InjectionDecoratorLoader {

}
