/**
 * The design tokens every Dawa Door app shares.
 *
 * Deliberately dependency-free: these are plain values with local types, so the
 * package does not pull React Native into a repo that may not be an app. The
 * token shapes are structurally compatible with React Native's `TextStyle` and
 * `boxShadow`, which the consuming app checks when it applies them.
 *
 * Anything that needs a framework — React Navigation's theme, for instance —
 * belongs in the app, not here.
 */

export * from './colors';
export * from './metrics';
export * from './typography';
