# 4. Apify

**What it does for you:** scrapes Google Maps so you get a list of local
businesses with their phone, email, website and rating.

**Cost:** about 5 dollars of free credit a month, no card needed. That is roughly
600 to 800 businesses.

## Steps

1. Sign up at https://console.apify.com/sign-up
2. Get your key: https://console.apify.com/settings/integrations
3. Put it in your `.env` file inside `tools/lead-scraper`:

```
APIFY_API_TOKEN=apify_api_your_key_here
```

## Running out of credit

You will, eventually. The tool is built for it: make a second free account and add
its key as a second line.

```
APIFY_API_TOKEN=apify_api_first_key
APIFY_API_TOKEN_2=apify_api_second_key
APIFY_API_TOKEN_3=apify_api_third_key
```

It rotates automatically the moment one runs dry, and keeps whatever the dead key
already paid for rather than throwing the run away.

## Costs per run, measured

Roughly 0.0064 dollars per business found.

- A single town, one trade, 12 results: pennies
- A city sweep, 42 trades, 12 each: about 3.20 dollars, 7 minutes, around 470
  usable leads after filtering

⚠️ **Keep a single run under about 4 dollars.** A run that exceeds the credit on
one key gets stopped part way. The tool handles it and rotates, but you get a
cleaner result by keeping runs smaller.

⚠️ **The country code is the two letter ISO one.** The UK is `gb`, not `uk`.
