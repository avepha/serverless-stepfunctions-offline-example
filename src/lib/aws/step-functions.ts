import {StepFunctions} from 'aws-sdk'

const stepFunctions = new StepFunctions({
  ...(process.env.NODE_ENV === 'development' && {endpoint: ':4030', sslEnabled: false})
})

export async function startExecution(
  input: Record<string, unknown>,
  stateMachineArn: string
) {
  return new Promise((resolve, reject) => {
    stepFunctions.startExecution(
      {
        input: JSON.stringify(input),
        stateMachineArn,
      },
      (err, data) => {
        err && reject(err)
        resolve(data)
      }
    )
  })
}

export default stepFunctions
