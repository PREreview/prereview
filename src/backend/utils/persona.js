// gets a user's active persona
// the user object received here is ctx.state.user

export default async function getActivePersona(user) {
  return user.defaultPersona;
}
