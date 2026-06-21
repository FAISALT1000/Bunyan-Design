const [major, minor, patch] = process.versions.node.split('.').map(Number);

const supported =
  (major === 20 && (minor > 19 || (minor === 19 && patch >= 4))) ||
  (major === 22 && (minor > 13 || (minor === 13 && patch >= 0))) ||
  (major === 24 && (minor > 3 || (minor === 3 && patch >= 0))) ||
  major >= 25;

if (!supported) {
  console.error(
    [
      '',
      `Unsupported Node.js version: ${process.versions.node}`,
      'Bunyan Storybook requires Node 20.19.4+, 22.13+, or 24.3+.',
      '',
      'Run:',
      '  nvm use',
      '',
    ].join('\n'),
  );
  process.exit(1);
}
