export function mockDelay(data, ms = 300) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data)));
    }, ms);
  });
}

