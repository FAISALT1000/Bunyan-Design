import React from 'react';
import { Button, Text } from '../src';

function compileTimeContracts() {
  const button = <Button title="Confirm" />;
  const text = <Text value="Hello" />;
  const localizedText = (
    <Text localize="common.confirm" value="Confirm" />
  );

  // @ts-expect-error title or deprecated string children is required
  const invalidButton = <Button />;
  // @ts-expect-error text or deprecated string children is required
  const invalidText = <Text />;
  // @ts-expect-error arbitrary Button children are not supported
  const customButton = <Button><Text value="Nested" /></Button>;
  // @ts-expect-error arbitrary nested Text children are not supported
  const richText = <Text><Text value="Nested" /></Text>;

  return {
    button,
    text,
    localizedText,
    invalidButton,
    invalidText,
    customButton,
    richText,
  };
}

describe('semantic API compile-time contracts', () => {
  it('keeps compile-only assertions in the TypeScript project', () => {
    expect(typeof compileTimeContracts).toBe('function');
  });
});
