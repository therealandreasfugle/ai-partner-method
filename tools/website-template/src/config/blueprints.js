/**
 * blueprints.js, section-order presets for the variance engine.
 *
 * brandDNA.layout.blueprint selects one ordering. HomePage renders the chosen
 * order; the hero archetype (brandDNA.layout.hero) is picked inside Hero.jsx.
 *
 * Every blueprint contains ALL sections, only re-sequenced, so no content is
 * ever dropped, the rhythm just changes. The conversion + local-SEO spine
 * (SPINE below) must appear in every blueprint; sop-qa asserts it in the
 * rendered DOM. Add a new blueprint by adding a key here whose value is a
 * permutation of the same section ids that still contains the full SPINE.
 */

export const BLUEPRINTS = {
  // Trust + reviews up top, then the founder. Urgent trades where the buyer
  // wants proof fast (roofer, plumber, HVAC, restoration).
  'trust-first': [
    'hero', 'trustStrip', 'reviews', 'founder', 'services', 'whyChooseUs',
    'ourWork', 'ourProcess', 'specialOffers', 'blog', 'faq', 'serviceAreas',
    'ctaBanner',
  ],

  // Services + work lead. Visual proof sells the job (auto, remodel,
  // landscaping, detailing, fencing).
  'showcase-first': [
    'hero', 'trustStrip', 'services', 'ourWork', 'reviews', 'whyChooseUs',
    'ourProcess', 'specialOffers', 'founder', 'faq', 'serviceAreas', 'blog',
    'ctaBanner',
  ],

  // Founder story leads. Personal / boutique local brands where the person is
  // the brand (florist, salon, photographer, specialist clinic).
  'story-first': [
    'hero', 'trustStrip', 'founder', 'services', 'reviews', 'ourWork',
    'whyChooseUs', 'ourProcess', 'specialOffers', 'faq', 'serviceAreas', 'blog',
    'ctaBanner',
  ],
};

// The conversion + local-SEO spine. Present in EVERY blueprint, no matter the
// order. sop-qa verifies each of these renders.
export const SPINE = [
  'hero', 'trustStrip', 'reviews', 'ourProcess', 'faq', 'serviceAreas',
  'ctaBanner',
];

export const DEFAULT_BLUEPRINT = 'trust-first';

export function resolveBlueprint(name) {
  return BLUEPRINTS[name] || BLUEPRINTS[DEFAULT_BLUEPRINT];
}
