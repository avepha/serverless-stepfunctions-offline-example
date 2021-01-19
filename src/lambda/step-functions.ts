import {Handler} from 'aws-lambda'
import {startExecution} from '../lib/aws/step-functions'

export const invokeStepFunctions: Handler = async _ => {
  await startExecution({}, process.env.stepFunctionArn)
}

export const callExternalApi: Handler = async event => {
  // throw new Error() //throw here to make retry
  return { status: 'success', event }
}

export const logError: Handler = async error => {
  console.error(error)
}
