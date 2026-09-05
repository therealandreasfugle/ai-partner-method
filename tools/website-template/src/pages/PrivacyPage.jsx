import LegalPage, { LegalHeading, LegalList } from './LegalPage';
import { brandDNA } from '../config/brand-dna';

/**
 * ⚠️ FOR THE PERSON BUILDING THIS SITE, NOT FOR THE VISITOR.
 *
 * This is a working starting point that covers what this template actually
 * does: a contact form, analytics, and an AI chat widget. It is not legal
 * advice. Before launch, read it against how your client really operates and
 * have it reviewed if the client is in a regulated trade or handles anything
 * beyond ordinary enquiry details.
 *
 * If you switch a feature off for a client (the chatbot, analytics), delete the
 * matching section here. A policy describing something the site does not do is
 * worse than one that is short.
 */

const LAST_UPDATED = brandDNA.legal?.lastUpdated || 'on launch of this website';
const COMPANY = brandDNA.company.name;
const EMAIL = brandDNA.contact.email;
const ADDRESS = brandDNA.address.full;
const CHATBOT_ON = brandDNA.chatbot?.enabled !== false;
const ANALYTICS_ON = Boolean(brandDNA.analytics?.ga4Id || brandDNA.analytics?.measurementId);

export default function PrivacyPage() {
  return (
    <LegalPage label="Legal" heading="Privacy Policy" updated={LAST_UPDATED}>
      <p>
        This policy explains what {COMPANY} does with your information when you use
        this website. We have tried to write it in plain English rather than legal
        language.
      </p>

      <LegalHeading>Who we are</LegalHeading>
      <p>
        {COMPANY}, {ADDRESS}. You can reach us at{' '}
        <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> or on{' '}
        <a className="underline" href={`tel:${brandDNA.contact.phoneTelLink}`}>
          {brandDNA.contact.phone}
        </a>
        . We are responsible for the information collected through this site.
      </p>

      <LegalHeading>What we collect</LegalHeading>
      <p>When you fill in an enquiry form on this site, we collect:</p>
      <LegalList
        items={[
          'Your name',
          'Your email address',
          'Your phone number',
          'Whatever you write in the message, including your address if you give it to us',
        ]}
      />
      {ANALYTICS_ON && (
        <p>
          We also use Google Analytics, which tells us how many people visited, which
          pages they read and roughly where in the country they were. It does not tell
          us who you are.
        </p>
      )}
      {CHATBOT_ON && (
        <p>
          If you use the chat window on this site, the messages you type are sent to an
          AI service so it can answer you. Do not put anything sensitive into the chat.
          If you want to tell us something private, use the phone number or the email
          address above.
        </p>
      )}

      <LegalHeading>Why we collect it, and what we do with it</LegalHeading>
      <p>
        We use your details to reply to your enquiry, to quote for the work, and to
        carry out that work if you go ahead. That is the only reason we ask for them.
      </p>
      <p>
        The legal basis is that you have asked us to get in touch about work you are
        considering, and that we have a legitimate interest in running and improving our
        business.
      </p>
      <p>
        <strong>We do not sell your information to anybody, and we do not pass it to
        other companies for marketing.</strong>
      </p>

      <LegalHeading>Who else sees it</LegalHeading>
      <p>Only the suppliers who make the website work:</p>
      <LegalList
        items={[
          'The company that hosts this website',
          'The service that delivers our emails, so your enquiry reaches our inbox',
          ANALYTICS_ON ? 'Google Analytics, for visitor numbers' : null,
          CHATBOT_ON ? 'The AI provider behind the chat window, for messages you type there' : null,
        ].filter(Boolean)}
      />

      <LegalHeading>How long we keep it</LegalHeading>
      <p>
        If you become a customer we keep your details for as long as we need them for
        the job and our records afterwards, including anything we are required to keep
        for tax and accounting. If you enquire and do not go ahead, we delete your
        details when they are no longer of any use to us.
      </p>

      <LegalHeading>Cookies</LegalHeading>
      <p>
        This site uses the small number of cookies needed to make the pages work
        {ANALYTICS_ON ? ', plus Google Analytics cookies that count visits' : ''}. You can
        block or delete cookies in your browser settings. The site will still work.
      </p>

      <LegalHeading>Your rights</LegalHeading>
      <p>You can ask us to:</p>
      <LegalList
        items={[
          'Tell you what information we hold about you',
          'Correct anything that is wrong',
          'Delete what we hold, where we are not required to keep it',
          'Stop using it for a particular purpose',
        ]}
      />
      <p>
        Email <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> and we will
        sort it out. If you are not happy with how we handled it, you can complain to
        your national data protection regulator.
      </p>

      <LegalHeading>Changes</LegalHeading>
      <p>
        If we change how any of this works we will update this page and change the date
        at the top.
      </p>
    </LegalPage>
  );
}
