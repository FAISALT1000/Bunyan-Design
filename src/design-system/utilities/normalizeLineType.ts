import type { LineTextGroup, LineType } from '../components/Line/Line.types';

export function normalizeLineType(type: LineType): 1 | 2 | 3 {
  if (type === '1' || type === 'single') return 1;
  if (type === '2' || type === 'double') return 2;
  return 3;
}

export function inferLineType(
  leftText?: LineTextGroup,
  rightText?: LineTextGroup,
): 1 | 2 | 3 {
  if (leftText?.text3 !== undefined || rightText?.text3 !== undefined) return 3;
  if (leftText?.text2 !== undefined || rightText?.text2 !== undefined) return 2;
  return 1;
}
