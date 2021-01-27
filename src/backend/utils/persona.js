// gets a user's active persona
// the user object received here is ctx.state.user

export default function getActivePersona(user) {
  return user.defaultPersona;
}
