# 1. GitHub

**What it does for you:** holds your own copy of this repo, so your work is backed
up and you can never lose it.

**Cost:** free.

## Steps

1. Make an account at https://github.com/signup
2. Open this repo at https://github.com/BrettZuke/AIPM-Complete-Setup
3. Click **Fork**, top right. That makes your own copy under your account.
4. On your fork, click the green **Code** button and copy the HTTPS link.
5. On your computer, in Terminal:

```bash
cd ~/Desktop
git clone <paste-your-link-here>
cd AIPM-Complete-Setup
```

You now have everything on your machine.

⚠️ **Fork, do not just download.** A fork lets you pull updates later when this
repo gets new templates and scripts. A download is frozen the day you take it.

⚠️ **Never commit a key.** The `.gitignore` here already blocks `.env` files, but
if you ever paste a key straight into a file and push it, treat that key as
public and replace it.
