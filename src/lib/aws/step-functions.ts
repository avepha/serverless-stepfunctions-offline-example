import {StepFunctions} from 'aws-sdk'

const stepFunctions = new StepFunctions({
  ...(process.env.NODE_ENV === 'development' && {endpoint: ':4030', sslEnabled: false})
})

export default stepFunctions
