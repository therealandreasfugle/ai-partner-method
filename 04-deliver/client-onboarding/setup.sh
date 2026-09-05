#!/bin/bash
set -e

echo "Setting up APM Client Onboarding..."

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "ERROR: Python 3 is required. Install from python.org"
  exit 1
fi

# Install dependencies
pip3 install -r requirements.txt -q

# Copy env template if .env doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "  Created .env from template."
  echo "  Open .env and add your TYPEFORM_API_KEY to continue."
else
  echo "  .env already exists — skipping."
fi

echo ""
echo "Setup complete."
echo ""
echo "Next step: add your TYPEFORM_API_KEY to .env, then run:"
echo "  python3 execution/create_typeform.py"
