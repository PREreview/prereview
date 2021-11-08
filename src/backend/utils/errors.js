// processes the validation errors thrown by koa-joi-router

function getErrorTypes(errorObject) {
  //
  return Object.keys(errorObject); // e.g. returns such an array as ['params', 'body']
}

export function getErrorMessages(errorObject) {
  const keys = getErrorTypes(errorObject);
  let messages = 'Validation error: ';

  keys.forEach(errorKey => {
    messages += errorObject[errorKey].msg + ' ';
  });

  return messages;
}
