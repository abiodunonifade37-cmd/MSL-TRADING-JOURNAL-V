# MSL Trading Journal v8

This is a mobile-first Progressive Web App (PWA) for the MSL Trading Journal.

## Included

- Dashboard
- Reversal / Continuation setup logging
- Liquidity and confirmation fields
- Premium / Discount execution zone
- R-multiple statistics
- Search and filtering
- JSON backup / restore
- Clear All Data with two confirmations
- Offline cache
- Installable PWA
- Cloud-ready configuration for Supabase

## Important: GitHub Pages

GitHub Pages can host the PWA frontend, but it is not a database server.

The current build is **local-first** and can be used immediately. The cloud settings screen is prepared for Supabase. To make multi-device cloud sync fully active, you need a Supabase project plus authentication and row-level-security policies.

Never put a Supabase `service_role` secret in this frontend. Only use the public anon/publishable client key.

## Deploy

1. Create/open your GitHub repository.
2. Upload everything in this folder to the repository root.
3. Go to **Settings → Pages**.
4. Select **GitHub Actions** or deploy from the repository branch according to your GitHub Pages setup.
5. Open the published HTTPS address.
6. Install the PWA from your browser's menu.

## Cloud preparation

1. Create a Supabase project.
2. Run `supabase-schema.sql` in the Supabase SQL editor.
3. Copy the project URL and public anon/publishable key.
4. Enter them under Settings → Optional cloud sync.

The frontend intentionally does not contain a private server key.

## Data safety

Before using Clear All Data, export a JSON backup. The Clear All Data button deletes all locally stored trades from the current browser/device.
