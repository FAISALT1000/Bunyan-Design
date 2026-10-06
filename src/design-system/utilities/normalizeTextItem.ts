import type {
  LineTextItem,
  LineTextValue,
} from '../components/Line/Line.types';
import { warnDeprecated } from './deprecations';

export function normalizeTextItem(
  item: LineTextValue | undefined,
): LineTextItem | undefined {
  if (item === undefined) return undefined;
  if (typeof item === 'string' || typeof item === 'number') {
    return { value: item };
  }
  if ('text' in item && item.text !== undefined) {
    warnDeprecated(
      'LineTextItem text is deprecated. Use value. It will be removed in 1.0.0.',
    );
    const { text, ...presentation } = item;
    return { ...presentation, value: text };
  }
  return item;
}
