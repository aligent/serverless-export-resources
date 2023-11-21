import type Serverless from 'serverless';
import type ServerlessPlugin from 'serverless/classes/Plugin';
import type Service from 'serverless/classes/Service';
import {
    DEFAULT_EXPORT_PREFIX,
    generateCustomOutputs,
    prepareLambdaFunctionOutputs,
    prepareStateMachineOutputs,
    validateLambdaFunctionExportRequirements,
    validateStateMachineExportRequirements,
} from './lib/utils';
import type {
    ExportResourcesConfig,
    ResourceOutputs,
    ServerlessResources,
} from './type/serverless-export-resources';

class ServerlessExportResources implements ServerlessPlugin {
    serverless: Serverless;
    options: Serverless.Options;
    hooks: ServerlessPlugin.Hooks;
    service: Service;
    log: ServerlessPlugin.Logging['log'];

    exportResources: ExportResourcesConfig;

    resourceOutputs: ResourceOutputs;

    constructor(
        serverless: Serverless,
        options: Serverless.Options,
        { log }: { log: ServerlessPlugin.Logging['log'] },
    ) {
        this.serverless = serverless;
        this.options = options;
        this.service = serverless.service;
        this.log = log;

        this.serverless.configSchemaHandler.defineCustomProperties({
            type: 'object',
            properties: {
                exportResources: {
                    type: 'object',
                    properties: {
                        functions: {
                            type: 'array',
                            items: { type: 'string' },
                        },
                        stateMachines: {
                            type: 'array',
                            items: { type: 'string' },
                        },
                        prefix: { type: 'string' },
                    },
                },
            },
        });

        this.hooks = {
            initialize: () => this.initialize(),
            'before:package:finalize': this.updateOutputs.bind(this),
        };
    }

    private initialize() {
        this.exportResources = {
            ...this.service.custom.exportResources,
            prefix:
                this.service.custom.exportResources.prefix ||
                DEFAULT_EXPORT_PREFIX,
        };

        this.validateResourceOutputRequirements();

        this.log.success(
            'Resource Export requirement validation complete! No errors were found.',
        );

        this.resourceOutputs = this.prepareResourceOutputs();
    }

    /**
     * Add custom outputs to original ones
     */
    private updateOutputs() {
        const originalOutputs =
            (this.service.resources as ServerlessResources)?.Outputs || {};
        const customOutputs = this.generateCustomOutputs();

        this.service.resources = {
            ...this.service.resources,
            Outputs: {
                ...originalOutputs,
                ...customOutputs,
            },
        };

        this.log.success('Successfully added custom resource exports!');
    }

    private validateResourceOutputRequirements() {
        let errors: string[] = [];

        const { functions: functionNames, stateMachines: stateMachineNames } =
            this.exportResources;

        errors = errors.concat(
            validateLambdaFunctionExportRequirements(
                this.service,
                functionNames,
            ),
        );

        errors = errors.concat(
            validateStateMachineExportRequirements(
                this.service,
                stateMachineNames,
            ),
        );

        if (errors.length) {
            throw new Error(
                'Missing Serverless Resource Output requirements\n' +
                    errors.join('\n'),
            );
        }
    }

    private prepareResourceOutputs() {
        const { functions: functionNames, stateMachines: stateMachineNames } =
            this.exportResources;

        return {
            functions: prepareLambdaFunctionOutputs(
                this.service,
                functionNames,
            ),
            stateMachines: prepareStateMachineOutputs(
                this.service,
                stateMachineNames,
            ),
        };
    }

    private generateCustomOutputs() {
        const provider = this.serverless.getProvider('aws');
        const stackName = `${this.service.getServiceName()}-${provider.getStage()}`;

        const { functions, stateMachines } = this.resourceOutputs;

        const functionCfnOutputs = generateCustomOutputs(
            stackName,
            functions,
            'function',
        );
        const stateMachineCfnOutputs = generateCustomOutputs(
            stackName,
            stateMachines,
            'stateMachine',
        );

        return {
            ...functionCfnOutputs,
            ...stateMachineCfnOutputs,
        };
    }
}

module.exports = ServerlessExportResources;
