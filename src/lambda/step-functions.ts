import {Handler} from 'aws-lambda'
import stepFunctions from '../lib/aws/step-functions'

export const invokeStepFunctions: Handler = async _ => {
  const input = JSON.stringify({input: 'input_message'})
  await stepFunctions.startExecution({
    input,
    // define this to local env of lambda function
    stateMachineArn: process.env.STEP_FUNCTIONS_ARN
  }).promise()
}

export const callExternalApi: Handler = async event => {
  // throw new Error() //throw here to make retry
  return { status: 'success', event }
}

export const logError: Handler = async error => {
  console.error(error)
}
