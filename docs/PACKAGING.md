# Package generation

The package continues to use the existing TypeScript build. Package generation
adds validation, semantic versioning, rollback, and archive creation around that
build without introducing a second compiler.

## Commands

```bash
npm run package
npm run package:patch
npm run package:minor
npm run package:major
npm run package:dry-run
```

`package` defaults to a patch release.

```text
1.4.2 -> 1.4.3
```

The generation sequence is:

1. Type checking
2. Source/package lint
3. Unit tests
4. Clean `dist`
5. TypeScript package build
6. Package metadata and `npm pack --dry-run` validation
7. Version update in `package.json` and `package-lock.json`
8. `npm pack` into `package-output`

The version is not changed until every validation and build step succeeds. If
archive generation fails after the update, both version files are restored and
the incomplete archive is removed.

`package:dry-run` performs validation and the build and reports the next
version. It does not change version files or create an archive.

## Optional Git behavior

Git is disabled by default.

```bash
node ./scripts/generate-package.mjs patch --git-commit
node ./scripts/generate-package.mjs minor --git-commit --git-tag
```

The optional commit is `chore(release): vX.Y.Z`; the optional tag is `vX.Y.Z`.
The script never publishes the package.

## Installing a generated archive

```bash
npm install ../design-system/package-output/bunyan-design-system-1.4.3.tgz
```

The exact filename is printed when packaging succeeds.

## Package validation

`validate-package.mjs` verifies entries, build output, peer dependency
placement, the `i18n-js` runtime dependency, unresolved aliases, archive
contents, and exclusion of tests, stories, environment files, and common secret
filenames.
