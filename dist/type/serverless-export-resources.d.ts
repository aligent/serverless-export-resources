import { FunctionDefinitionHandler, FunctionDefinitionImage } from 'serverless';
import type Service from 'serverless/classes/Service';
import type { Outputs } from 'serverless/plugins/aws/provider/awsProvider';
interface FunctionDefinitionHandlerDescription extends FunctionDefinitionHandler {
    description?: string;
}
interface FunctionDefinitionImageDescription extends FunctionDefinitionImage {
    description?: string;
}
export type FunctionDefinitionDescription = FunctionDefinitionHandlerDescription | FunctionDefinitionImageDescription;
interface StateMachineDefinition {
    Comment?: string;
    StartAt: string;
    States: Record<string, unknown>;
}
export type StateMachine = {
    name?: string;
    definition: StateMachineDefinition;
};
export type ExportResourcesConfig = {
    functions?: string[];
    stateMachines?: string[];
    prefix: string;
};
export type OutputInfo = {
    fullName: string;
    description: string;
};
export type ResourceOutputs = {
    functions: Record<string, OutputInfo>;
    stateMachines: Record<string, OutputInfo>;
};
export type ServerlessResources = Service['resources'] & {
    Outputs?: Outputs;
};
export {};
