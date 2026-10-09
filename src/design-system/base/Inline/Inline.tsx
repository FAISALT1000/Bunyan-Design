import React, { memo } from 'react';
import { useTheme } from '../../hooks';
import { needsMirroring } from '../../utilities/styles';
import { Box, type BoxProps, type SpacingToken } from '../Box';

export interface InlineProps extends Omit<BoxProps, 'gap' | 'internalStyle'> {
  gap?: SpacingToken;
  reverse?: boolean;
}

export const Inline = memo(function Inline({
  gap = 'md',
  reverse = false,
  children,
  ...props
}: InlineProps) {
  const { direction } = useTheme();
  // Mirror only when the provider direction differs from the native layout one.
  const mirrored = needsMirroring(direction);
  const isReversed = reverse ? !mirrored : mirrored;

  return (
    <Box
      {...props}
      gap={gap}
      internalStyle={{ flexDirection: isReversed ? 'row-reverse' : 'row' }}
    >
      {children}
    </Box>
  );
});
