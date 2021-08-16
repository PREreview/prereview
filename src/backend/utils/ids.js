export function createRandomDoi() {
  return (
    '10.' +
    (Math.floor(Math.random() * 10000) + 10000).toString().substring(1) +
    '/' +
    (Math.floor(Math.random() * 1000) + 1000).toString().substring(1)
  );
}
