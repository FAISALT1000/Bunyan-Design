const warnedMessages = new Set<string>();

export function warnDeprecated(message: string) {
  if (!__DEV__ || warnedMessages.has(message)) return;
  warnedMessages.add(message);
  console.warn(message);
}

export function resetDeprecationWarningsForTests() {
  warnedMessages.clear();
}
