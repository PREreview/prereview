import 'reflect-metadata';
import { EntityProperty, FindOptions } from '@mikro-orm/core';
import * as entities from '../models/entities';

type Fields<T> = NonNullable<FindOptions<T>['fields']>;

export function getFields<T extends keyof typeof entities>(
  type: T,
  includes?: string[],
  recurse = 2,
): Fields<T> {
  return Object.values(entities[type].prototype.__meta.properties).reduce<
    Fields<T>
  >((props, prop: EntityProperty<typeof entities[T]>) => {
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
          [prop.name]: getFields(
            prop.type as keyof typeof entities,
            includes,
            recurse - 1,
          ),
        });
      }
    }
    return props;
  }, []);
}
