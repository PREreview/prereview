export function checkIfRoleLacksMininmalData(role) {
  return role && (!role.name || !role.avatar || !role.avatar.contentUrl);
}
