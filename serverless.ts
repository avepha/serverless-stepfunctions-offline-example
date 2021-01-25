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
          `arn:aws:lambda:*:*:function:${getResourceName('invokeStepFunctions')}`,
          `arn:aws:lambda:*:*:function:${getResourceName('callExternalApi')}`,
          `arn:aws:lambda:*:*:function:${getResourceName('logError')}`,
        ],
      },
      {
        Effect: 'Allow',
        Action: ['states:StartExecution'],
        Resource: [
          `arn:aws:states:*:*:stateMachine:${getResourceName('MyStateMachine')}`
        ],
      }
    ]
  
  },
  functions: {
    invokeStepFunctions: {
      name: getResourceName('invokeStepFunctions'),
      handler: 'src/lambda/step-functions.invokeStepFunctions',
      environment: {
        stepFunctionArn:
          '${self:custom.stepFunctionsArnPrefix}' +
          getResourceName('MyStateMachine'),
      },
      events: [{ http: { path: '/invoke-stepfunctions', method: 'get' } }],
    },
    callExternalApi: {
      name: getResourceName('callExternalApi'),
      handler: 'src/lambda/step-functions.callExternalApi',
    },
    logError: {
      name: getResourceName('logError'),
      handler: 'src/lambda/step-functions.logError',
    },
  },
  stepFunctions: {
    stateMachines: {
      MyStateMachine: {
        name: getResourceName('MyStateMachine'),
        definition: {
          Comment: 'MyStateMachine definition',
          StartAt: 'CallExternalApi',
          States: {
            CallExternalApi: {
              Type: 'Task',
              Resource: FnGetAtt('callExternalApi'),
              Retry: [
                {
                  ErrorEquals: ['States.ALL'],
                  IntervalSeconds: 2,
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
  }
}
module.exports = serverlessConfiguration
