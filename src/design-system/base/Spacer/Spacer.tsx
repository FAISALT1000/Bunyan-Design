import React, { memo } from 'react';
import { Box, type SpacingToken } from '../Box';

export interface SpacerProps {
  size?: SpacingToken;
  orientation?: 'horizontal' | 'vertical';
}

export const Spacer = memo(function Spacer({
  size = 'md',
  orientation = 'vertical',
}: SpacerProps) {
  return orientation === 'vertical'
    ? <Box height={undefined} internalStyle={{ minHeight: 0 }} paddingTop={size} />
    : <Box width={undefined} internalStyle={{ minWidth: 0 }} paddingStart={size} />;
});
