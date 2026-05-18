#!/usr/bin/env bash
set -euo pipefail

# Render: oldin muvaffaqiyatsiz qolgan migratsiyani "rolled back" deb belgilaymiz, keyin qayta deploy.
if npx prisma migrate resolve --rolled-back "20260515193000_listing_numeric_id" 2>/dev/null; then
  echo "Marked failed migration as rolled back — will re-apply fixed SQL."
fi

npx prisma migrate deploy
