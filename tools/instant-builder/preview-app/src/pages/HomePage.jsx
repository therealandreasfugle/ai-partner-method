import { brandDNA } from '../config/brand-dna';
import { resolveBlueprint } from '../config/blueprints';
import Reveal from '../components/Reveal';
import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import Reviews from '../components/Reviews';
import Founder from '../components/Founder';
import Services from '../components/Services';
import WhyChooseUs from '../components/WhyChooseUs';
import OurWork from '../components/OurWork';
import OurProcess from '../components/OurProcess';
import SpecialOffers from '../components/SpecialOffers';
import Blog from '../components/Blog';
import FAQ from '../components/FAQ';
import ServiceAreas from '../components/ServiceAreas';
import CTABanner from '../components/CTABanner';

// Section id -> component. The blueprint (brandDNA.layout.blueprint) decides the
// ORDER these render in; every blueprint contains all of them, just resequenced.
const REGISTRY = {
  hero: Hero,
  trustStrip: TrustStrip,
  reviews: Reviews,
  founder: Founder,
  services: Services,
  whyChooseUs: WhyChooseUs,
  ourWork: OurWork,
  ourProcess: OurProcess,
  specialOffers: SpecialOffers,
  blog: Blog,
  faq: FAQ,
  serviceAreas: ServiceAreas,
  ctaBanner: CTABanner,
};

// Hero is the LCP surface and TrustStrip overlaps it with a negative margin, so
// neither is wrapped in a scroll reveal. Everything below gets the fade-up.
const NO_REVEAL = new Set(['hero', 'trustStrip']);

export default function HomePage() {
  const order = resolveBlueprint(brandDNA.layout?.blueprint);
  return (
    <>
      {order.map((id) => {
        const Section = REGISTRY[id];
        if (!Section) return null;
        if (NO_REVEAL.has(id)) return <Section key={id} />;
        return (
          <Reveal key={id}>
            <Section />
          </Reveal>
        );
      })}
    </>
  );
}
