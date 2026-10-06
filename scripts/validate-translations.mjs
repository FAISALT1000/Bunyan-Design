import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const files = process.argv.slice(2);
if (files.length < 2) {
  console.error(
    'Usage: node validate-translations.mjs <locale-a.json> <locale-b.json> [...more.json]',
  );
  process.exit(1);
}

const pluralKeys = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);
const resources = {};
const invalidValues = [];
const emptyValues = [];

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isPlural = value => (
  isObject(value)
  && Object.keys(value).length > 0
  && Object.entries(value).every(([key, item]) => (
    pluralKeys.has(key) && typeof item === 'string'
  ))
);

const inspect = (locale, value, key = '') => {
  if (typeof value === 'string') {
    if (!value.trim()) emptyValues.push({ locale, key });
    return;
  }
  if (isPlural(value)) {
    Object.entries(value).forEach(([pluralKey, pluralValue]) => {
      if (!pluralValue.trim()) emptyValues.push({ locale, key: `${key}.${pluralKey}` });
    });
    return;
  }
  if (!isObject(value)) {
    invalidValues.push({ locale, key, value });
    return;
  }
  Object.entries(value).forEach(([childKey, childValue]) => {
    inspect(locale, childValue, key ? `${key}.${childKey}` : childKey);
  });
};

const flatten = (value, prefix = '') => Object.entries(value).flatMap(([key, item]) => {
  const fullKey = prefix ? `${prefix}.${key}` : key;
  return typeof item === 'string' || isPlural(item)
    ? [fullKey]
    : isObject(item)
      ? flatten(item, fullKey)
      : [];
});

for (const file of files) {
  const locale = path.basename(file, path.extname(file));
  const resource = JSON.parse(await readFile(path.resolve(file), 'utf8'));
  resources[locale] = resource;
  inspect(locale, resource);
}

const allKeys = new Set(Object.values(resources).flatMap(flatten));
const missingByLocale = Object.fromEntries(
  Object.entries(resources).map(([locale, resource]) => {
    const keys = new Set(flatten(resource));
    return [locale, [...allKeys].filter(key => !keys.has(key)).sort()];
  }),
);
const valid = invalidValues.length === 0
  && emptyValues.length === 0
  && Object.values(missingByLocale).every(keys => keys.length === 0);

console.log(JSON.stringify({ valid, missingByLocale, invalidValues, emptyValues }, null, 2));
if (!valid) process.exitCode = 1;
