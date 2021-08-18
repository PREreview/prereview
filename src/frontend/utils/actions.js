import { arrayify } from '../utils/jsonld';

export function checkIfIsModerated(action) {
  return arrayify(action.moderationAction).some(
    action => action['@type'] === 'ModerateRapidPREreviewAction',
  );
}
