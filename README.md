# Serverless Export Resources

A [Serverless framework](https://www.serverless.com) plugin for creating custom Outputs and export them.

## Serverless configuration

- Though does not requires in the serverless configuration, this plugin will throw errors if the description of the exported resources are not available.
  - Lambda Function description can be set in the function declaration like so:
    ```yaml
    functions:
      hello:
        handler: src/hello.handler
        description: >-
          This is a long dummy description of this Hello Lambda service to test the limitation of this export value. 
          It can contain up to 256 characters.
    ```
  - Step Function supports setting `Comment` which can be used as description:
    ```yaml
    stepFunctions:
      stateMachines:
        stateMachine:
          name: ${self:service}-${self:provider.stage}-stateMachine
          definition:
            Comment: >-
              This is a very long dummy description of this State Machine service to test the limitation of this export value.
              It can contain nearly 500 characters.
    ```
- The plugin is configured within the `serverless.yaml` by providing configuration values as the example below
  ```yaml
  custom:
    exportResources:
      functions: [hello, world]
      stateMachines:
        - helloWorld
  ```

### Variables

| Variable      | Usage                                                 |
| ------------- | ----------------------------------------------------- |
| functions     | Array of logical names of Lambda functions to export. |
| stateMachines | Array of logical names of Step Functions to export.   |
