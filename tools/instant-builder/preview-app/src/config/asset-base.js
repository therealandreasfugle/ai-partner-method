/**
 * asset-base.js
 *
 * One deployed copy of this template serves many client previews, but the
 * template references its photos at fixed absolute paths (/hero-image.webp,
 * /work/project-1.webp, /owner.webp ...). Without a prefix, a plumber's preview
 * would render the baseline roofing photos.
 *
 * `A` is prepended to every per-client image path. It stays "" for the baseline
 * build, so the committed site behaves exactly as before. site-loader sets it
 * from the client config (`assets.base`, e.g. "/trades/plumbing") before the
 * first render.
 *
 * This relies on ES module live bindings: importers of `A` observe the value
 * written by setAssetBase, so components need no props or context. It is only
 * ever set once, before React mounts.
 */

export let A = ''

export function setAssetBase(base) {
  A = String(base || '').replace(/\/+$/, '')
}

/**
 * The logo is handled separately from the rest of the photo set.
 *
 * Photos are shared per trade, but a logo has to carry THIS business's name, and
 * a hosted build cannot write a per-client file. So the wordmark is generated as
 * an inline SVG data URI and served from memory.
 *
 * This also fixes a real bug: when the logo 404'd, each component's onError
 * handler reassigned the source, which 404'd again, and React re-attached the
 * handler on every render. One missing file produced ~200 requests.
 */
let logo = ''

export function setLogo(dataUri) {
  logo = String(dataUri || '')
}

export function logoSrc() {
  return logo
}
