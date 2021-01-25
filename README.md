# Step Functions

AWS Step Functions is a serverless function orchestrator that makes it easy to sequence AWS Lambda functions [(see more)](https://aws.amazon.com/step-functions)

## Getting started
```
yarn install
yarn dev
```

## Serverless Plugins

- [Step function](https://github.com/serverless-operations/serverless-step-functions)
- [Offline step function](https://github.com/jefer590/serverless-offline-step-functions)

```jsx
plugins: [
		...
    'serverless-offline',
    'serverless-step-functions',
    '@fernthedev/serverless-offline-step-functions',
		...
  ],
```

## **Define step functions**

- Define a group of lambda functions in `serverless.ts` file

  `serverless.ts`

    ```jsx
    functions: {
        callExternalApi: {
          name: getResourceName('callExternalApi'),
          handler: 'src/lambda/step-functions.callExternalApi',
        },
        logError: {
          name: getResourceName('logError'),
          handler: 'src/lambda/step-functions.logError',
        },
      },
    ```

- Define state machine definition

  `serverless.ts`

    ```jsx
    functions: {
    	// lambda functions
    },
    stepFunctions: {
        stateMachines: {
          CreateOrderStateMachine: {
            name: getResourceName('StateMachine'),
            definition: {
              StartAt: 'CallExternalApi',
              States: {
                CallExternalApi: {
                  Type: 'Task',
                  Resource: FnGetAtt('callExternalApi'), // Ref to lambda function
                  Retry: [
                    {
                      ErrorEquals: ['States.ALL'],
                      IntervalSeconds: 2,
                      BackoffRate: 2.0,
                      MaxAttempts: 4,
                    },
                  ],
                  Catch: [
                    { ErrorEquals: ['States.ALL'], Next: 'CatchAllFallback' },
                  ],
                  End: true,
                },
                CatchAllFallback: {
                  Type: 'Task',
                  Resource: FnGetAtt('logError'), // Ref to lambda function
                  End: true,
                },
              },
            },
          },
        }
      }
    ```
