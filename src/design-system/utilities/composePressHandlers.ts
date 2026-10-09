export function composePressHandlers(
  ...handlers: Array<(() => void) | undefined>
) {
  return () => {
    handlers.forEach(handler => handler?.());
  };
}
