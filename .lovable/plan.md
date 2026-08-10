# CNAME Configuration for Supabase Custom Domain

## Goal
Point the subdomain `api.generativesearch.pro` to the Supabase target `yyrjtiuvxhdwsjjrlxtm.supabase.co` with the lowest possible TTL and proxy disabled.

## DNS Record

| Type | Name / Host | Value / Target | TTL |
|------|-------------|----------------|-----|
| CNAME | `api` (or `api.generativesearch.pro`) | `yyrjtiuvxhdwsjjrlxtm.supabase.co` | Lowest available (e.g., 60 seconds) |

## Cloudflare-specific instructions

- In the Cloudflare DNS dashboard, find the `api` record.
- Make sure the **proxy status** is set to **DNS only** (gray cloud, not orange).
- If the apex/root domain currently has an A record or other CNAME that conflicts with routing `api`, leave the root record untouched; only add the `api` subdomain record.

## Verification steps

1. After saving the record, run a DNS lookup from a terminal:
   ```text
   dig api.generativesearch.pro CNAME
   nslookup -type=CNAME api.generativesearch.pro
   ```
2. The expected answer should point to `yyrjtiuvxhdwsjjrlxtm.supabase.co`.
3. Wait for TTL-based propagation (usually minutes with a 60-second TTL).
4. Complete the custom-domain setup in the Supabase project dashboard if Supabase still requires verification.

## Notes

- If `generativesearch.pro` was purchased through Lovable, the DNS records can be managed in **Project Settings → Domains → Configure → Manage DNS records** instead of at an external registrar.
- If a different DNS provider is used, look for the TTL dropdown and choose the smallest available value; some providers do not support 60 seconds and use 300 seconds as the minimum.
