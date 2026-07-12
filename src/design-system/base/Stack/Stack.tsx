import React, { memo } from 'react';
import { Box, type BoxProps, type SpacingToken } from '../Box';

export interface StackProps extends Omit<BoxProps, 'gap' | 'internalStyle'> {
  gap?: SpacingToken;
}

export const Stack = memo(function Stack({
  gap = 'md',
  children,
  ...props
}: StackProps) {
  return (
    <Box
      {...props}
      gap={gap}
      internalStyle={{ flexDirection: 'column' }}
    >
      {children}
    </Box>
  );
});
