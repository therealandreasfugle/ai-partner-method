# Getting Started — Student Setup Guide

Complete this once before you onboard your first creator client.

---

## Step 1: Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/apm-client-onboarding
cd apm-client-onboarding
```

---

## Step 2: Run setup

```bash
chmod +x setup.sh && ./setup.sh
```

This installs the Python dependencies and creates your `.env` file.

---

## Step 3: Get a Typeform API key

1. Go to [typeform.com](https://typeform.com) and create a free account
2. Click your profile picture → **Account Settings**
3. Go to **Personal tokens** → **Generate a new token**
4. Copy the token
5. Open your `.env` file and paste it:

```
TYPEFORM_API_KEY=your_token_here
```

---

## Step 4: Create your intake form

```bash
python3 execution/create_typeform.py
```

You'll see output like:

```
  Form created successfully

  Live URL : https://form.typeform.com/to/XXXXXXXX
  Edit URL : https://admin.typeform.com/form/XXXXXXXX/create
```

**Save the Live URL.** This is what you send to every new creator client.

You only need to run this once. The form lives in your Typeform account permanently.

---

## Step 5: Set up your Notion workspace template

1. Create a free [Notion](https://notion.so) account if you don't have one
2. Open `notion-template/client-workspace.md`
3. Build the structure in Notion — takes ~20 minutes
4. Save it as your master template
5. Duplicate it for every new creator client (rename to `[Client Name] — Workspace`)

---

## Step 6: Read the SOP

Open `directives/onboard_creator_client.md` and read it end to end before your first client.

This is your playbook for every onboarding — deal closed through to systems live.

---

## You're ready

When you close a creator client:

1. Send the welcome message with your Typeform link
2. Duplicate your Notion workspace template for them
3. Follow `directives/onboard_creator_client.md` step by step

That's it.

---

## Quick reference

| What | Where |
|------|-------|
| Intake form (send to clients) | Your Typeform Live URL |
| Step-by-step process | `directives/onboard_creator_client.md` |
| Notion workspace to build | `notion-template/client-workspace.md` |
| Re-create your form | `python3 execution/create_typeform.py` |
