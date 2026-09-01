import { brandDNA } from '../config/brand-dna'

/**
 * BackgroundPattern — renders the per-client SVG background pattern from
 * `templates/website-template/src/assets/bg-patterns/{shape_motif}.svg` as an
 * absolutely-positioned overlay inside its parent container. The pattern
 * picks up the wrapping `color` (currentColor) so a single SVG file works
 * for both light and dark sections.
 *
 * Usage:
 *   <section className="relative">
 *     <BackgroundPattern motif={brandDNA.shape_motif} opacity={0.4} color="white" />
 *     <div className="relative z-10">section content</div>
 *   </section>
 *
 * The 13 motifs are: polygon | triangle | wave | arc | dot-grid | hexagon |
 * chevron | diamond | cross-hatch | mountain | topographic.
 *
 * Selection happens at brand-dna extraction time (Stage 7), so per-client builds
 * just consume `brandDNA.shape_motif` here. Falls back to "polygon" if the motif
 * is missing or unknown.
 */

const VALID_MOTIFS = new Set([
  'polygon', 'triangle', 'wave', 'arc', 'dot-grid', 'hexagon',
  'chevron', 'diamond', 'cross-hatch', 'mountain', 'topographic',
  'shingle', 'blueprint-grid',
])

const PATTERN_BASE = '/patterns'

export default function BackgroundPattern({
  motif = brandDNA.shape_motif,
  opacity = 0.5,
  color = 'currentColor',
  className = '',
  position = 'absolute',
}) {
  const safe = VALID_MOTIFS.has(motif) ? motif : 'polygon'
  const url = `${PATTERN_BASE}/${safe}.svg`
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none inset-0 ${className}`}
      style={{
        position,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundImage: `url('${url}')`,
        backgroundRepeat: 'repeat',
        opacity,
        color,
        mixBlendMode: 'normal',
      }}
    />
  )
}
