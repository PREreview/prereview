// gets a user's active persona
// the user object received here is ctx.state.user

export default async function getActivePersona(user) {
  const personas = await user.personas.loadItems();
  const active = personas.filter(persona => persona.isActive === true)[0];
  return active;
}
