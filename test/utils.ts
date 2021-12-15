import * as cdigit from 'cdigit';
import faker from 'faker';
import { ORCID } from 'orcid-utils';

export const isoDateTime =
  /^[0-9]{4}-((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(02)-(0[1-9]|[12][0-9]))T(0[0-9]|1[0-9]|2[0-3]):(0[0-9]|[1-5][0-9]):(0[0-9]|[1-5][0-9])\.[0-9]{3}Z$/;

export const uuid =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

function fakeDoiPrefix(): string {
  return `10.${faker.datatype.number({ min: 1000, max: 999999999 })}`;
}

function fakeDoiSuffix(): string {
  return `${faker.lorem.words().replace(/\s/g, '.')}`;
}

export function fakeDoi(): string {
  return `${fakeDoiPrefix()}/${fakeDoiSuffix()}`;
}

export function fakeOrcid(): string {
  return fakeIsni(15000000, 35000000);
}

function fakeIsni(min = 0, max = 999999999999999): string {
  const digits = faker.datatype.number({ min, max }).toString();
  const isni = cdigit.mod11_2.generate(digits);

  return ORCID.toDashFormat(isni.padStart(16, '0'));
}
