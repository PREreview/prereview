export function checkIfProfileNeedsUpdate(user) {
  // returns true if the user doesn't have any contacts in their profile or their persona doesn't have an avatar
  return !(user.contacts.length > 0) || !user.defaultPersona.avatar;
}
