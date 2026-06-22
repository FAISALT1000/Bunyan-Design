# Consumer upgrade guide

Registry:

```bash
npm install @bunyan/design-system@latest
npm ls @bunyan/design-system
```

Local archive:

```bash
npm install ../design-system/package-output/bunyan-design-system-1.2.4.tgz
npm ls @bunyan/design-system
```

Before upgrading:

1. Review release and migration notes.
2. Confirm React Native and peer dependency ranges.
3. Check deprecated APIs scheduled for removal.
4. Update native peers only when required by the new package version.
5. Run `pod install` when native dependency versions changed.
6. Run `npm run validate:design-system`, type checking, tests, iOS, and Android.

Current deprecated APIs include string children for semantic leaf components,
the old `Text text` prop, and `LineTextItem.text`. Migrate to explicit
`title`, `label`, and `value` props before `1.0.0`.

Reset Metro only after confirming the correct package version is installed:

```bash
npx react-native start --reset-cache
```
