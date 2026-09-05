import LegalPage, { LegalHeading } from './LegalPage';
import { brandDNA } from '../config/brand-dna';

/**
 * ⚠️ FOR THE PERSON BUILDING THIS SITE, NOT FOR THE VISITOR.
 *
 * Terms covering use of the WEBSITE. This is not the contract between the
 * business and its customers for the actual work, and it does not try to be.
 * If your client has their own terms of trade, link to those from here rather
 * than replacing them with this.
 *
 * Starting point, not legal advice. Have it reviewed before launch if the
 * client is in a regulated trade.
 */

const LAST_UPDATED = brandDNA.legal?.lastUpdated || 'on launch of this website';
const COMPANY = brandDNA.company.name;
const EMAIL = brandDNA.contact.email;

export default function TermsPage() {
  return (
    <LegalPage label="Legal" heading="Terms of Use" updated={LAST_UPDATED}>
      <p>
        These terms cover your use of this website. They are not the terms for any work
        we carry out for you, which we agree with you separately and in writing before
        we start.
      </p>

      <LegalHeading>Who runs this site</LegalHeading>
      <p>
        This website is operated by {COMPANY}. By using it you accept these terms. If
        you do not accept them, please do not use the site.
      </p>

      <LegalHeading>The information on this site</LegalHeading>
      <p>
        We keep the information here as accurate and up to date as we reasonably can,
        but things change. Services, prices, availability and opening hours can all
        move without this page catching up immediately.
      </p>
      <p>
        <strong>Nothing on this website is a quote or a binding offer.</strong> Any price
        or timescale you see is a guide. We give you a real figure once we understand
        the job, and that is the one that counts.
      </p>

      <LegalHeading>Getting in touch</LegalHeading>
      <p>
        When you send an enquiry through this site you are asking us to contact you
        about work. Please give us details that are accurate, so we can quote properly.
        Sending an enquiry does not create a contract and does not oblige either of us
        to go ahead.
      </p>

      <LegalHeading>Reviews and photographs</LegalHeading>
      <p>
        Reviews shown on this site are from real customers. Photographs are of our own
        work unless a caption says otherwise.
      </p>

      <LegalHeading>Our content</LegalHeading>
      <p>
        The text, photographs, logo and design on this site belong to us or to whoever
        licensed them to us. You are welcome to look at them and to share a link to any
        page. Please do not copy the content and use it as your own.
      </p>

      <LegalHeading>Links to other websites</LegalHeading>
      <p>
        Where we link to another website, we do it because we think it is useful. We do
        not control those sites and we are not responsible for what is on them.
      </p>

      <LegalHeading>Availability</LegalHeading>
      <p>
        We try to keep this site up and working, but we cannot promise it will never be
        unavailable. If you need us urgently and the site is down, ring us on{' '}
        <a className="underline" href={`tel:${brandDNA.contact.phoneTelLink}`}>
          {brandDNA.contact.phone}
        </a>
        .
      </p>

      <LegalHeading>Liability</LegalHeading>
      <p>
        We are responsible for loss you suffer as a result of us breaking these terms
        where that loss is a foreseeable result of it. We are not responsible for loss
        that was not foreseeable, or for business losses.
      </p>
      <p>
        Nothing here limits our liability for death or personal injury caused by our
        negligence, for fraud, or for anything else that cannot lawfully be limited.
        Your legal rights as a consumer are not affected by anything on this page.
      </p>

      <LegalHeading>Changes to these terms</LegalHeading>
      <p>
        We may update these terms. The version on this page at the time you use the site
        is the one that applies, and the date at the top tells you when it last changed.
      </p>

      <LegalHeading>Questions</LegalHeading>
      <p>
        Email <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> and we will
        answer.
      </p>
    </LegalPage>
  );
}
