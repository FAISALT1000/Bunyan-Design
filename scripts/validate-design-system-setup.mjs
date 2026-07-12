#!/usr/bin/env node
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const requireFromProject = createRequire(path.join(projectRoot, 'package.json'));
const errors = [];
const warnings = [];
const flags = new Set(process.argv.slice(2));
const navigationMode = flags.has('--navigation=rnn') ? 'rnn' : 'none';

const addError = message => errors.push(message);
const addWarning = message => warnings.push(message);
const relative = target => path.relative(projectRoot, target);

const resolveDependency = dependency => {
  try {
    return requireFromProject.resolve(`${dependency}/package.json`);
  } catch {
    try {
      return requireFromProject.resolve(dependency);
    } catch {
      return undefined;
    }
  }
};

const packageJsonPath = resolveDependency('@bunyan/design-system');
if (!packageJsonPath) {
  addError(
    'Install @bunyan/design-system before validating: npm install @bunyan/design-system',
  );
} else {
  let packageRoot = path.dirname(packageJsonPath);
  if (path.basename(packageJsonPath) !== 'package.json') {
    while (
      packageRoot !== path.dirname(packageRoot)
      && !existsSync(path.join(packageRoot, 'package.json'))
    ) {
      packageRoot = path.dirname(packageRoot);
    }
  }
  const packageJson = JSON.parse(
    await readFile(path.join(packageRoot, 'package.json'), 'utf8'),
  );
  for (const peer of Object.keys(packageJson.peerDependencies ?? {})) {
    if (!resolveDependency(peer)) {
      addError(
        `Missing required peer dependency "${peer}". Install the range ${packageJson.peerDependencies[peer]}.`,
      );
    }
  }
  for (const entry of [packageJson.main, packageJson.types]) {
    if (!entry || !existsSync(path.join(packageRoot, entry))) {
      addError(`Installed package entry "${entry}" cannot be resolved.`);
    }
  }
}

const requiredProjectFiles = [
  'src/design-system/DesignSystemSetup.tsx',
  'src/design-system/designSystemTheme.ts',
  'src/design-system/designSystemLocalization.ts',
  'src/design-system/designSystemAdapters.ts',
  'src/localization/en.json',
  'src/localization/ar.json',
];
for (const file of requiredProjectFiles) {
  if (!existsSync(path.join(projectRoot, file))) {
    addError(`Missing setup file: ${file}. Run the setup generator or create it.`);
  }
}

const providerPath = path.join(
  projectRoot,
  'src/design-system/DesignSystemSetup.tsx',
);
if (existsSync(providerPath)) {
  const source = await readFile(providerPath, 'utf8');
  for (const expected of [
    'DesignSystemProvider',
    'ApplicationAdapterProvider',
    'SafeAreaProvider',
  ]) {
    if (!source.includes(expected)) {
      addError(`${relative(providerPath)} does not configure ${expected}.`);
    }
  }
}

const sourceExpectations = {
  'src/design-system/designSystemTheme.ts': [
    'lightTheme',
    'darkTheme',
    'blackTheme',
  ],
  'src/design-system/designSystemLocalization.ts': [
    'englishTranslations',
    'arabicTranslations',
    'fallbackLocale',
  ],
  'src/design-system/designSystemAdapters.ts': [
    'createApplicationAdapters',
  ],
};

for (const [file, expectedSymbols] of Object.entries(sourceExpectations)) {
  const absolutePath = path.join(projectRoot, file);
  if (!existsSync(absolutePath)) continue;
  const source = await readFile(absolutePath, 'utf8');
  for (const symbol of expectedSymbols) {
    if (!source.includes(symbol)) {
      addError(`${file} does not configure ${symbol}.`);
    }
  }
}

for (const locale of ['en', 'ar']) {
  const file = path.join(projectRoot, `src/localization/${locale}.json`);
  if (!existsSync(file)) continue;
  try {
    const resource = JSON.parse(await readFile(file, 'utf8'));
    if (!resource || typeof resource !== 'object' || Array.isArray(resource)) {
      addError(`${relative(file)} must contain a JSON object.`);
    }
  } catch (error) {
    addError(`${relative(file)} is invalid JSON: ${error.message}`);
  }
}

if (
  existsSync(path.join(projectRoot, 'src/test-utils/renderWithDesignSystem.tsx'))
  && !resolveDependency('@testing-library/react-native')
) {
  addWarning(
    'renderWithDesignSystem.tsx requires the development dependency "@testing-library/react-native".',
  );
}

if (navigationMode === 'rnn') {
  if (!resolveDependency('react-native-navigation')) {
    addError(
      'React Native Navigation integration requested but react-native-navigation is not installed.',
    );
  }
  for (const file of [
    'src/design-system/designSystemNavigation.ts',
    'src/design-system/registerAppScreen.tsx',
  ]) {
    if (!existsSync(path.join(projectRoot, file))) {
      addError(`Missing React Native Navigation setup file: ${file}.`);
    }
  }
}

if (existsSync(path.join(projectRoot, 'ios'))) {
  if (!existsSync(path.join(projectRoot, 'ios/Podfile.lock'))) {
    addWarning(
      'ios/Podfile.lock was not found. Run "cd ios && pod install" after installing native peers.',
    );
  }
}

if (existsSync(path.join(projectRoot, 'android'))) {
  if (!existsSync(path.join(projectRoot, 'android/settings.gradle'))
    && !existsSync(path.join(projectRoot, 'android/settings.gradle.kts'))) {
    addWarning('Android project detected without settings.gradle or settings.gradle.kts.');
  }
}

if (warnings.length > 0) {
  console.warn('\nWarnings:');
  warnings.forEach(message => console.warn(`- ${message}`));
}

if (errors.length > 0) {
  console.error('\nDesign-system setup validation failed:');
  errors.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log('\nDesign-system setup validation passed.');
  if (navigationMode === 'none') {
    console.log('Navigation validation was skipped. Add --navigation=rnn when used.');
  }
}
