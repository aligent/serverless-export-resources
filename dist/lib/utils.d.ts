import type Service from 'serverless/classes/Service';
import type { Output } from 'serverless/plugins/aws/provider/awsProvider';
import { OutputInfo } from '../type/serverless-export-resources';
export declare const DEFAULT_EXPORT_PREFIX: "aser";
export declare function generateLambdaFunctionFullName(logicalName: string, postfix?: string): string;
export declare function generateStateMachineFullName(logicalName: string, customName: string, postfix?: string): string;
export declare function validateLambdaFunctionExportRequirements(service: Service, functionNames?: string[]): string[];
export declare function validateStateMachineExportRequirements(service: Service, stateMachineNames?: string[]): string[];
export declare function prepareLambdaFunctionOutputs(service: Service, functionNames?: string[]): Record<string, OutputInfo>;
export declare function prepareStateMachineOutputs(service: Service, stateMachineNames?: string[]): Record<string, OutputInfo>;
export declare function generateCustomOutputs(stackName: string, resourceOutputs: Record<string, OutputInfo>, type: 'function' | 'stateMachine'): Record<string, Output>;
