import { brandDNA } from '../config/brand-dna';

// Source-of-truth shape art lives in `templates/website-template/src/assets/corner-overlays/*.svg`.
// Each SVG uses `fill="currentColor"` so we can substitute the per-client accent
// at render time. Vite's `?raw` import loads the file contents as a string at
// build time, then we colour-substitute and inject via dangerouslySetInnerHTML.
// This keeps the SVG files as the canonical artwork (a designer can update them
// without editing JSX) and works around the CSS `mask-image` serialization issue
// that affected the prior external-SVG approach.
import triangleRaw from '../assets/corner-overlays/triangle.svg?raw';
import polygonRaw from '../assets/corner-overlays/polygon.svg?raw';
import hexagonRaw from '../assets/corner-overlays/hexagon.svg?raw';
import chevronRaw from '../assets/corner-overlays/chevron.svg?raw';
import diamondRaw from '../assets/corner-overlays/diamond.svg?raw';
import arcRaw from '../assets/corner-overlays/arc.svg?raw';
import waveRaw from '../assets/corner-overlays/wave.svg?raw';
import mountainRaw from '../assets/corner-overlays/mountain.svg?raw';
import rectangleRaw from '../assets/corner-overlays/rectangle.svg?raw';

const MOTIF_RAW = {
  triangle: triangleRaw,
  polygon: polygonRaw,
  hexagon: hexagonRaw,
  chevron: chevronRaw,
  diamond: diamondRaw,
  arc: arcRaw,
  wave: waveRaw,
  mountain: mountainRaw,
  rectangle: rectangleRaw,
};

function colouredSvg(rawSvg, color, size) {
  return rawSvg
    .replace(/currentColor/g, color)
    .replace(/width="280"/g, `width="${size}"`)
    .replace(/height="280"/g, `height="${size}"`)
    .replace(/<svg /, `<svg width="${size}" height="${size}" `);
}

// Rule 58: per-client decorative corner overlays. Motif AND color are both
// independent per-client decisions in brand-dna. Shape sourced from the SVG
// files at templates/website-template/src/assets/corner-overlays/{motif}.svg.
//
// Props:
//   position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
//   size: pixel size (default 280)
//   motif / color / opacity: optional per-section overrides
export default function CornerOverlay({
  position = 'top-right',
  size = 280,
  motif = null,
  color = null,
  opacity = null,
}) {
  const overlay = brandDNA.corner_overlay || {};
  const resolvedMotif = motif || overlay.motif || brandDNA.shape_motif || 'polygon';
  const resolvedColor = color || overlay.color || '#94A3B8';
  const resolvedOpacity =
    opacity != null ? opacity : (overlay.opacity != null ? overlay.opacity : 0.08);

  const rawSvg = MOTIF_RAW[resolvedMotif] || MOTIF_RAW.polygon;
  const coloured = colouredSvg(rawSvg, resolvedColor, size);

  const positionStyles = {
    'top-left': { top: 0, left: 0, transform: 'none' },
    'top-right': { top: 0, right: 0, transform: 'scaleX(-1)' },
    'bottom-left': { bottom: 0, left: 0, transform: 'scaleY(-1)' },
    'bottom-right': { bottom: 0, right: 0, transform: 'scale(-1, -1)' },
  };

  const anchor = positionStyles[position] || positionStyles['top-right'];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        width: size,
        height: size,
        opacity: resolvedOpacity,
        zIndex: 0,
        ...anchor,
      }}
      dangerouslySetInnerHTML={{ __html: coloured }}
    />
  );
}
