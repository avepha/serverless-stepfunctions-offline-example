export function getResourceName(name) {
  return '${self:service}-${opt:stage}-' + name
}

export function FnGetAtt(functionName) {
  return {
    'Fn::GetAtt': [functionName, 'Arn'],
  }
}
