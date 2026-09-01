#!/usr/bin/env node
/**
 * validate-brand-dna.mjs
 *
 * Build-time shape validator. Loads src/config/brand-dna.example.js (the
 * canonical contract) and src/config/brand-dna.js (the per-client values),
 * walks every documented path, and fails closed if:
 *
 *   - a path documented in example is missing in brand-dna.js
 *   - a path has the wrong type (object vs array vs string)
 *   - a `__REQUIRED__*__` sentinel survived (Stage 10.1 didn't fill it)
 *   - the canonical type is an array but the value isn't, or vice versa
 *
 * Run via npm script (predev + prebuild). Exits non-zero with a precise
 * dotted-path error so the failing field is obvious.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const BRAND_DNA = resolve(ROOT, "src/config/brand-dna.js");
const BRAND_DNA_EXAMPLE = resolve(ROOT, "src/config/brand-dna.example.js");

const SENTINEL_PATTERN = /^__REQUIRED__[A-Z0-9_]+__$/;

function shapeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function isSentinelString(s) {
  return typeof s === "string" && SENTINEL_PATTERN.test(s);
}

/**
 * Walk the canonical shape from `example` and compare each path against `actual`.
 *
 * Rules:
 *   - If example value is a sentinel string, actual must be a non-sentinel string.
 *   - If example value is null, actual may be null OR any concrete value (optional field).
 *   - If example value is an object, actual must be an object with at least the same keys.
 *   - If example value is an array, actual must be an array (item shape is documented in
 *     example.js comments, not enforced here — too lossy in a JS module).
 *   - If example value is a literal (e.g. `theme_mode: "light"`), actual must be the same
 *     type (string), value content is the writer's responsibility.
 */
function walk(actual, example, path, errors) {
  const exShape = shapeOf(example);

  if (exShape === "null") {
    // Optional field. Anything goes including missing/null/real value.
    return;
  }

  const acShape = shapeOf(actual);

  if (exShape === "object") {
    if (acShape !== "object") {
      errors.push(`${path || "<root>"}: expected object, got ${acShape}`);
      return;
    }
    for (const [k, exVal] of Object.entries(example)) {
      const nextPath = path ? `${path}.${k}` : k;
      if (!(k in actual)) {
        // Field missing on actual. Sentinel-required if example value is sentinel string
        // or has any required (non-null) descendants. Treat any non-null example shape
        // as required.
        if (exVal !== null) {
          errors.push(`${nextPath}: missing (required by canonical shape)`);
        }
        continue;
      }
      walk(actual[k], exVal, nextPath, errors);
    }
    return;
  }

  if (exShape === "array") {
    if (acShape !== "array") {
      errors.push(`${path}: expected array, got ${acShape}`);
    }
    // Item shape not enforced; documented in example.js comments.
    return;
  }

  if (exShape === "string") {
    if (acShape !== "string") {
      errors.push(`${path}: expected string, got ${acShape}`);
      return;
    }
    if (isSentinelString(example)) {
      // Canonical field is required to be filled. Actual must NOT be a sentinel.
      if (isSentinelString(actual)) {
        errors.push(`${path}: __REQUIRED__ sentinel survived: "${actual}"`);
      }
      // Empty string passes typecheck but is almost certainly wrong copy. Warn.
      if (actual === "") {
        errors.push(`${path}: empty string (required field)`);
      }
    }
    return;
  }

  if (exShape === "number" || exShape === "boolean") {
    if (acShape !== exShape) {
      errors.push(`${path}: expected ${exShape}, got ${acShape}`);
    }
    return;
  }
}

/**
 * Additional pass: scan the entire actual tree for any surviving __REQUIRED__
 * substring, not just exact-pattern fields. Catches partial writes
 * (e.g. "Roofing __REQUIRED__SERVICES__ contractor" if Stage 10.1 templated
 * a sentinel into a longer string).
 */
function findSurvivingSentinels(obj, path, hits) {
  if (typeof obj === "string") {
    if (obj.includes("__REQUIRED__")) {
      hits.push(`${path || "<root>"} contains "__REQUIRED__" substring: ${obj}`);
    }
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => findSurvivingSentinels(v, `${path}[${i}]`, hits));
    return;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      findSurvivingSentinels(v, path ? `${path}.${k}` : k, hits);
    }
  }
}

async function loadModule(path) {
  const mod = await import(path);
  const value = mod.brandDNA || mod.default;
  if (!value) {
    throw new Error(`${path}: module does not export brandDNA or default`);
  }
  return value;
}

async function main() {
  const example = await loadModule(BRAND_DNA_EXAMPLE);
  const actual = await loadModule(BRAND_DNA);

  const shapeErrors = [];
  walk(actual, example, "", shapeErrors);

  const sentinelHits = [];
  findSurvivingSentinels(actual, "", sentinelHits);

  if (shapeErrors.length === 0 && sentinelHits.length === 0) {
    console.log(
      `validate-brand-dna: OK (${Object.keys(actual).length} top-level keys, ` +
        `${Object.keys(actual.copy || {}).length} copy.* keys, ` +
        `${Object.keys(actual.pages || {}).length} pages.* keys)`
    );
    return;
  }

  console.error("validate-brand-dna: FAILED");
  if (shapeErrors.length > 0) {
    console.error("\nShape mismatches (brand-dna.js does not match brand-dna.example.js):");
    for (const err of shapeErrors) console.error(`  - ${err}`);
  }
  if (sentinelHits.length > 0) {
    console.error("\nSurviving __REQUIRED__ sentinels (Stage 10.1 did not populate these):");
    for (const hit of sentinelHits) console.error(`  - ${hit}`);
  }
  console.error(
    "\nResolve by re-running Stage 10.1 (tools/build-from-template.py) or by editing " +
      "src/config/brand-dna.js directly. The canonical shape lives in " +
      "src/config/brand-dna.example.js."
  );
  process.exit(1);
}

main().catch((err) => {
  console.error("validate-brand-dna: failed to load brand-dna files");
  console.error(err);
  process.exit(1);
});
