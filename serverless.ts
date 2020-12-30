import {AWS} from '@serverless/typescript'

const serverlessConfiguration: AWS = {
  service: 'avepha-platform',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'ap-southeast-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    graphql: {
      handler: 'lambda/handler.graphqlHandler',
      events: [
        {
          http: {
            method: 'get',
            path: '/graphql',
            cors: true,
            integration: 'lambda-proxy'
          },
        },
        {
          http: {
            method: 'post',
            path: '/graphql',
            cors: true,
            integration: 'lambda-proxy'
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration
