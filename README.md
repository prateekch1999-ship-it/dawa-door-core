# @dawa-door/core

The design tokens shared by the Dawa Door user, shop and rider apps — colours, the 8-point grid,
radius, elevation, motion and the type scale, from the Medical Horizon design system.

One copy, consumed by three apps. The apps live in their own repositories; this is the only thing
they share, so it is the only thing that can drift between them.

## Using it

```jsonc
// package.json
"dependencies": {
  "@dawa-door/core": "github:prateekch1999-ship-it/dawa-door-core#v0.1.0"
}
```

```ts
import { Colors, Spacing, Typography } from '@dawa-door/core';
```

Pin a tag, not a branch — an app should move to new tokens deliberately, not whenever someone
pushes. npm runs `prepare` on install, so the consumer gets the compiled `dist/` without this repo
publishing anywhere.

## Adding or changing a token

In this repository:

```bash
# edit src/, then
npm test                    # builds and runs the contrast suite
git commit -am "feat: the Pro type scale for the shop and rider apps"
npm version minor           # bumps package.json, commits, tags v0.2.0
git push --follow-tags
```

In each app that wants it:

```bash
npm install github:prateekch1999-ship-it/dawa-door-core#v0.2.0
npm run verify
```

Apps move between tags one at a time and on purpose. The user app can sit on v0.1.0 while the shop
app is on v0.2.0 — that is the point of pinning, not a problem to fix.

**Never move a published tag.** npm caches git dependencies by ref, so re-pointing `v0.2.0` at a new
commit leaves some machines on the old code and others on the new, with nothing to show why. Cut
`v0.2.1` instead.

Patch for a fix, minor for a new token, major for a rename or removal — a removed token breaks three
apps at once, so it should be loud.

### Working on a token and an app at the same time

Tagging for every experiment is miserable. Point the app at the local checkout while you iterate:

```bash
npm install ../dawa-door-core      # in the app
```

Then put the tag back before you commit. A `file:` or relative path in an app's package.json builds
on your machine and nowhere else — not on a teammate's, and not on EAS.

## Why not a git submodule

A submodule puts the *files* at a path; it does not make `@dawa-door/core` resolve, so each app ends
up with a relative-path dependency or Metro `watchFolders` on top of it anyway. In exchange it pins
to a commit rather than a version, needs `--recurse-submodules` on every clone and extra setup on
EAS, and invites editing shared code from inside one app — which is the exact drift this package
exists to prevent.

## Dependency-free on purpose

No React Native import, not even for types. `BoxShadow` and `TextToken` are declared locally and are
structurally identical to React Native's `BoxShadowValue` and the subset of `TextStyle` a token
sets, so the consuming app type-checks the real assignability when it applies one.

That keeps this installable from anything — a web dashboard, a script, a test — without pulling a
mobile framework behind it.

Anything that needs a framework stays in the app. React Navigation's theme is built from these
tokens inside the user app, not here.

## Light only

`Colors.light` is the only palette today. Dark is planned: add a `dark` key with the same shape.
Each app resolves which one to use — the user app does it in its `useTheme()` hook, which is the
only file there that has to change.

## Layout

| file | holds |
| --- | --- |
| `colors.ts` | the light palette, plus the raw brand ramp |
| `metrics.ts` | spacing, radius, tap targets, elevation, blur, motion, icon sizes |
| `typography.ts` | the User app type scale and its font families |

The Shop and Rider apps run one step larger with higher-contrast greys. When those apps exist, that
scale goes in `typography.ts` beside this one rather than being re-derived in each app.

## Checks

```bash
npm test        # builds, then runs the contrast suite
npm run typecheck
```

`colors.test.ts` measures the WCAG contrast of every pair the design puts text on, pinned to the
value it measures today, so a palette edit cannot quietly drop a pair below AA.

Two things it already records:

- The design file rounds some ratios up. The Match tag measures **4.72:1**, not the 5.1 printed on
  the sheet. It still clears AA, so the colour stands.
- **White on `brand` is 4.35:1** — under the 4.5 AA floor for normal text, and a primary button
  label at 16/700 counts as normal text. It passes only the 3:1 large-text bar. Pinned so a palette
  edit has to confront it; darkening `brand` toward `brandPressed` would clear it, which is a design
  decision rather than a code one.

Tests use `node:test`, so this package needs no test framework. The apps use jest; that difference
is deliberate and stops at the repository boundary.
