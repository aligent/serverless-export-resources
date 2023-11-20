import type Service from 'serverless/classes/Service';
import type { Output } from 'serverless/plugins/aws/provider/awsProvider';
import {
    FunctionDefinitionDescription,
    OutputInfo,
    StateMachine,
} from '../type/serverless-export-resources';

export const DEFAULT_EXPORT_PREFIX = 'aser' as const;

function pascalCase(str: string) {
    const firstChar = str[0] as string;
    return str.replace(firstChar, firstChar.toUpperCase());
}

export function generateLambdaFunctionFullName(
    logicalName: string,
    postfix = '',
) {
    return `${pascalCase(logicalName)}${postfix}`;
}

export function generateStateMachineFullName(
    logicalName: string,
    customName: string,
    postfix = '',
) {
    const name = customName || `${logicalName}StepFunctionsStateMachine`;
    const exportName = name.replaceAll('-', 'Dash');
    return exportName.charAt(0).toUpperCase() + exportName.slice(1) + postfix;
}

export function validateLambdaFunctionExportRequirements(
    service: Service,
    functionNames?: string[],
) {
    const errors: string[] = [];

    if (!functionNames) return errors;

    for (const name of functionNames) {
        const func = service.getFunction(name) as FunctionDefinitionDescription;

        if (!func) {
            errors.push(`Unable to find function for: ${name}`);
            continue;
        }

        if (!func.description)
            errors.push(`Require a description for function: ${name}`);
    }

    return errors;
}

export function validateStateMachineExportRequirements(
    service: Service,
    stateMachineNames?: string[],
) {
    const errors: string[] = [];

    if (!stateMachineNames) return errors;

    for (const name of stateMachineNames) {
        const stateMachine = service.initialServerlessConfig.stepFunctions
            ?.stateMachines[name] as StateMachine;

        if (!stateMachine) {
            errors.push(`Unable to find state machine for: ${name}`);
            continue;
        }

        if (!stateMachine.definition.Comment) {
            errors.push(`Require a description for stateMachine: ${name}`);
        }
    }

    return errors;
}

export function prepareLambdaFunctionOutputs(
    service: Service,
    functionNames?: string[],
) {
    const functions: Record<string, OutputInfo> = {};

    if (!functionNames) return functions;

    for (const name of functionNames) {
        const func = service.getFunction(name) as FunctionDefinitionDescription;

        functions[name] = {
            fullName: generateLambdaFunctionFullName(name, 'LambdaFunction'),
            description: func.description as string,
        };
    }

    return functions;
}

export function prepareStateMachineOutputs(
    service: Service,
    stateMachineNames?: string[],
) {
    const stateMachines: Record<string, OutputInfo> = {};

    if (!stateMachineNames) return stateMachines;

    for (const name of stateMachineNames) {
        const stateMachine = service.initialServerlessConfig.stepFunctions
            ?.stateMachines[name] as StateMachine;

        stateMachines[name] = {
            fullName: generateStateMachineFullName(
                name,
                stateMachine.name || '',
            ),
            description: stateMachine.definition.Comment as string,
        };
    }

    return stateMachines;
}

function generateExportName(
    stackName: string,
    name: string,
    type: string,
    resource: string,
) {
    return `${DEFAULT_EXPORT_PREFIX}:${stackName}:${name}:${type}:${resource}`;
}

export function generateCustomOutputs(
    stackName: string,
    resourceOutputs: Record<string, OutputInfo>,
    type: 'function' | 'stateMachine',
) {
    const cloudFormationOutputs: Record<string, Output> = {};

    for (const name in resourceOutputs) {
        const { fullName, description } = resourceOutputs[name] as OutputInfo;
        cloudFormationOutputs[`${fullName}ExportArn`] = {
            Description: `Arn of ${stackName}-${name}`,
            Value: { ['Fn::GetAtt']: [fullName, 'Arn'] },
            Export: {
                Name: generateExportName(stackName, name, type, 'arn'),
            },
        };

        cloudFormationOutputs[`${fullName}ExportDescription`] = {
            Description: `Description of ${stackName}-${name}`,
            Value: description,
            Export: {
                Name: generateExportName(stackName, name, type, 'description'),
            },
        };

        // TODO: if we need to see Lambda log, we need to export log group arn
        // TODO: may need to pass in resource type in case some one want to have step function named LambdaFunction
        // if (fullName.includes('LambdaFunction')) {
        //     const logGroupName = fullName.replace('LambdaFunction', 'LogGroup');
        //     cloudFormationOutputs[`${logGroupName}ExportArn`] = {
        //         Description: `Log group of ${stackName}-${name}`,
        //         Value: { ['Fn::GetAtt']: [logGroupName, 'Arn'] },
        //         Export: {
        //             Name: generateExportName(stackName, logGroupName, 'log', 'arn'),
        //         },
        //     };
        // }
    }

    return cloudFormationOutputs;
}
