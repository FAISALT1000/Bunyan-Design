# Icons

153 icons in 12 categories, all on a 24×24 grid with a 2px round stroke, so
they sit well together. Every app that uses Bunyan imports them from the
package; there are no SVG files to copy.

## Using icons

```tsx
// 1. By name. IconName autocompletes every icon.
import { Icon } from '@bunyan/design-system';
<Icon name="wallet" size="md" tone="primary" />
<Icon name="arrow-right" mirroredInRTL />      // flips in Arabic
<Icon name="bell" size={28} color={theme.color.warning.default} />

// 2. One component per icon.
import { WalletIcon, ReceiptIcon } from '@bunyan/design-system/icons';
<WalletIcon size="lg" tone="primary" />

// 3. Categories, e.g. for an icon picker.
import { iconCategories } from '@bunyan/design-system';
iconCategories.finance; // ['wallet', 'card', 'bank', 'transfer', ...]

// 4. Your own icons (logo, product glyphs).
import { Path } from 'react-native-svg';
registerIcons({ 'streamspy-logo': <Path d="M4 12h16" /> });

declare module '@bunyan/design-system' {
  interface CustomIcons {
    'streamspy-logo': true;
  }
}
<Icon name="streamspy-logo" />
```

Per-icon components are a convenience. Metro bundles the whole icon set
either way; bundlers that tree-shake (for example Expo with tree shaking
enabled, or webpack on web) drop the unused ones.

| Prop | Values |
| --- | --- |
| `size` | `xs` 12 · `sm` 16 · `md` 20 · `lg` 24 · `xl` 32 · `xxl` 40, or a number |
| `tone` | `primary`, `secondary`, `tertiary`, `inverse`, `success`, `warning`, `error`, `information` |
| `color` | Any colour (overrides `tone`) |
| `mirroredInRTL` | Flip in Arabic. Pass it for directional icons (arrows, chevrons, send, log-in/out, return). Preset components already do. |
| `accessibilityLabel` | Icons are decorative unless you pass one |

## Categories

| Key | Icons |
| --- | --- |
| `navigation` | chevron-left, chevron-right, chevron-up, chevron-down, arrow-left, arrow-right, arrow-up, arrow-down, arrow-up-right, arrow-down-left, external-link, chevron-end, backspace, menu, more-horizontal, more-vertical, home, grid |
| `actions` | plus, minus, close, check, edit, trash, copy, share, download, upload, refresh, search, filter, sort, link, send |
| `status` | success, error, warning, info, alert-circle, pending, help, bell, bell-off, shield-check, flag, loader |
| `settings` | settings, sliders, sun, moon, contrast, globe, language, monitor, smartphone, wifi, battery, power, toggle, layers, palette, accessibility |
| `users` | user, users, user-plus, user-check, user-x, user-circle, id-card, contacts, team, crown, heart, smile |
| `finance` | wallet, card, bank, transfer, cash, coins, receipt, invoice, chart-bar, chart-line, chart-pie, trending-up, trending-down, percent, piggy-bank, exchange, qr-code, scan |
| `commerce` | cart, bag, store, tag, gift, truck, package, star, coupon, return |
| `files` | file, file-text, file-pdf, file-plus, folder, folder-open, clipboard, attachment, archive, cloud-upload, signature, print |
| `communication` | message, chat, mail, phone, video, mic, at-sign, megaphone, inbox, support |
| `security` | lock, unlock, key, shield, fingerprint, face-id, eye, eye-off, log-in, log-out, otp |
| `time` | calendar, clock, history, timer, map-pin, map, navigation, plane, car, building |
| `media` | image, camera, play, pause, volume, music, stream, cast |

The Storybook story `Presets / Icons` shows every icon.

## Adding icons to Bunyan

1. Add the SVG markup to `scripts/dev/icons.py` under the right category
   (24×24, `stroke`-based, no colours).
2. Run `python3 scripts/dev/gen-icons.py`. It regenerates
   `src/design-system/icons/glyphs.tsx` and `components.tsx` and keeps every
   existing drawing unchanged.
3. Run `npm run verify`.
