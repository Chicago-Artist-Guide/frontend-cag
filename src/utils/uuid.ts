// crypto.randomUUID needs a secure context and the canary serves plain HTTP;
// getRandomValues works in both.
export const uuidv4 = (): string =>
  '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (digit) => {
    const value = Number(digit);
    const random = crypto.getRandomValues(new Uint8Array(1))[0];
    return (value ^ (random & (15 >> (value / 4)))).toString(16);
  });
