import React from 'react';
import {
  Box,
  Button,
  Card,
  Line,
  Stack,
  Text,
} from '@bunyan/design-system';

export function DesignSystemExampleScreen() {
  return (
    <Box padding="lg">
      <Stack gap="md">
        <Text
          localize="home.title"
          value="Home"
          variant="headingLarge"
        />
        <Card variant="primary" title="Account">
          <Line
            leftText={{
              text1: {
                localize: 'account.availableBalance',
                value: 'Available balance',
              },
            }}
            rightText={{ text1: '10,000 SAR' }}
          />
        </Card>
        <Button
          title="Continue"
          titleLocalize="common.continue"
          onPress={() => undefined}
        />
      </Stack>
    </Box>
  );
}
