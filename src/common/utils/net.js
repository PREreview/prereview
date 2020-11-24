export function fetchWithTimeout(uri, options = {}, time = 5000) {
  const controller = new AbortController();
  const config = { ...options, signal: controller.signal };
  setTimeout(() => {
    controller.abort();
  }, time);
  return fetch(uri, config)
    .then(response => {
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response;
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        throw new Error('Response timed out');
      }
      throw new Error(error.message);
    });
}
