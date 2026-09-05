# 3. Vercel

**What it does for you:** hosts every website you build, plus your CRM, your
proposal and your booking pages. Free, fast, and it handles the SSL padlock for
you.

**Cost:** free tier is 100GB of bandwidth a month, which is dozens of local
business sites.

## Steps

1. Sign up with your GitHub account at https://vercel.com/signup
2. Install the command line tool:

```bash
npm i -g vercel
vercel login
```

3. Deploy something to prove it works. From the repo:

```bash
cd tools/website-templates
vercel --prod
```

Answer the prompts, take the defaults. It gives you a live URL in about a minute.

## How you will use it

Every client gets their own Vercel project. You deploy their site, then point
their domain at it. Nothing is shared between clients, so one client can never
affect another.

⚠️ **Deploy from an absolute path, not a relative one.** Running `vercel --prod`
from the wrong folder deploys the wrong thing over a live client site. Check where
you are with `pwd` before you deploy.

⚠️ After any deploy, open the live URL and confirm the change is actually there. A
successful deploy message is not proof the new version is serving.
