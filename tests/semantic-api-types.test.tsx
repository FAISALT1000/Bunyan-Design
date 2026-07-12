import React from 'react';
import { Button, InputField, Text } from '../src';

function compileTimeContracts() {
  const button = <Button title="Confirm" />;
  const text = <Text value="Hello" />;
  const localizedText = (
    <Text localize="common.confirm" value="Confirm" />
  );
  const password = (
    <InputField
      type="password"
      label="Password"
      value=""
      onChangeText={() => undefined}
      showPasswordToggle
    />
  );
  const otp = (
    <InputField
      type="otp"
      label="Code"
      value=""
      onChangeText={() => undefined}
      length={6}
    />
  );

  // @ts-expect-error title or deprecated string children is required
  const invalidButton = <Button />;
  // @ts-expect-error text or deprecated string children is required
  const invalidText = <Text />;
  // @ts-expect-error arbitrary Button children are not supported
  const customButton = <Button><Text value="Nested" /></Button>;
  // @ts-expect-error arbitrary nested Text children are not supported
  const richText = <Text><Text value="Nested" /></Text>;
  // @ts-expect-error password-only prop is not available for email fields
  const invalidEmail = <InputField type="email" label="Email" value="" onChangeText={() => undefined} showPasswordToggle />;
  // @ts-expect-error OTP fields require a completion length
  const invalidOtp = <InputField type="otp" label="Code" value="" onChangeText={() => undefined} />;
  // @ts-expect-error search-only callback is not available for text fields
  const invalidSearch = <InputField type="text" label="Name" value="" onChangeText={() => undefined} onSearch={() => undefined} />;

  return {
    button,
    text,
    localizedText,
    password,
    otp,
    invalidButton,
    invalidText,
    customButton,
    richText,
    invalidEmail,
    invalidOtp,
    invalidSearch,
  };
}

describe('semantic API compile-time contracts', () => {
  it('keeps compile-only assertions in the TypeScript project', () => {
    expect(typeof compileTimeContracts).toBe('function');
  });
});
