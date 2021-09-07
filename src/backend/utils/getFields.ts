import 'reflect-metadata';
import * as entities from '../models/entities';

export function getFields(
  type: keyof typeof entities,
  includes?: string[],
  recurse = 2,
): unknown {
  return Object.values(entities[type].prototype.__meta.properties).reduce(
    (props: any[], prop: any) => {
      if (!(prop.hidden === true)) {
        if (prop.reference === 'scalar') {
          if (
            prop.type !== 'BlobType' ||
            (includes && includes.includes(prop.name))
          ) {
            props.push(prop.name);
          }
          return props;
        }
        if (recurse > 0) {
          if (prop.reference === 'm:1') {
            props.push(prop.name);
          }
          props.push({
            [prop.name]: getFields(prop.type, includes, recurse - 1),
          });
        }
      }
      return props;
    },
    [],
  );
}
