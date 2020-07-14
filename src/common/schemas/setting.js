import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const schema = Joi.object({
  value: Joi.string(),
});

export async function validate(data) {
  try {
    const value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate test JSON: ', err);
  }
}
