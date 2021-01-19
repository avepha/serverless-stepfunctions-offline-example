import {AWS} from '@serverless/typescript'
import {getResourceName, FnGetAtt} from './src/lib/aws/util'

const serverlessConfiguration: AWS & {stepFunctions?: any} = {
  service: 'avepha-playground',
  frameworkVersion: '2',
  configValidationMode: "error",
  custom: {
    dev: 'default',
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    '@fernthedev/serverless-offline-step-functions': {
      port: 4030,
      enabled: true,
      debug: true,
    },
    stepFunctionsArnPrefix:
      'arn:aws:states:${opt:region}:#{AWS::AccountId}:stateMachine:',
  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-dotenv-plugin',
    'serverless-pseudo-parameters',
    'serverless-step-functions',
    'serverless-webpack',
    '@fernthedev/serverless-offline-step-functions',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'ap-southeast-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['lambda:InvokeFunction'],
        Resource: [
          `arn:aws:lambda:*:*:function:${getResourceName(
            'invokeStepFunctions'
          )}`,
          `arn:aws:lambda:*:*:function:${getResourceName('logError')}`,
        ],
      },
      {
        Effect: 'Allow',
        Action: ['states:StartExecution'],
        Resource: [
          `arn:aws:states:*:*:stateMachine:${getResourceName('StateMachine')}`
        ],
      }
    ]
  },
  functions: {
    createOrder: {
      handler: 'src/lambda/step-functions.createOrder',
      name: getResourceName('createOrder'),
      events: [
        {http: {path: '/create-order', method: 'get'}}
      ],
      environment: {
        stateMachine: ''
      }
    },
    callExternalApi: {
      name: getResourceName('callExternalApi'),
      handler: 'src/lambda/step-functions.callExternalApi',
    },
    invokeStepFunctions: {
      name: getResourceName('invokeStepFunctions'),
      handler: 'src/lambda/step-functions.invokeStepFunctions',
      environment: {
        stepFunctionArn:
          '${self:custom.stepFunctionsArnPrefix}' +
          getResourceName('StateMachine'),
      },
      events: [{ http: { path: '/invoke-stepfunctions', method: 'get' } }],
    },
    logError: {
      name: getResourceName('logError'),
      handler: 'src/lambda/step-functions.logError',
    },
  },
  stepFunctions: {
    stateMachines: {
      CreateOrderStateMachine: {
        name: getResourceName('StateMachine'),
        definition: {
          Comment: 'Create order step functions',
          StartAt: 'CallExternalApi',
          States: {
            CallExternalApi: {
              Type: 'Task',
              Resource: FnGetAtt('callExternalApi'),
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
              Resource: FnGetAtt('logError'),
              End: true,
            },
          },
        },
      },
    }
  },
}
module.exports = serverlessConfiguration
