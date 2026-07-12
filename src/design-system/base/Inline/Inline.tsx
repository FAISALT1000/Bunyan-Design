import React, { memo } from 'react';
import { useTheme } from '../../hooks';
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
  const isReversed = reverse ? direction !== 'rtl' : direction === 'rtl';

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
