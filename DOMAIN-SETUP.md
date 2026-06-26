# Connecting a custom domain to your PHASE site

Your site is currently live (free) at **https://biba-pixel.github.io/phase/**.
This guide connects a custom domain (e.g. `thephasemethod.com`) to it.

**Cost:** just the domain, ~$10–15/year. Hosting + HTTPS stay free on GitHub Pages.

---

## Step 1 — Buy the domain (Namecheap)

1. Go to **https://www.namecheap.com**
2. Search your name (suggestions: `thephasemethod.com`, `phasemethod.co`,
   `elisephase.com`, `phasebyelise.com`, `phasemovement.com`).
3. Add to cart → check out. **Turn ON the free "Domain Privacy / WhoisGuard"**
   (hides your personal info — it's free, leave it enabled).
4. Skip the upsells (hosting, email, SSL — you don't need any; SSL is free via GitHub).

> Tip: as you type, Namecheap shows price + whether it's taken. If your `.com`
> is gone, `.co` is the cleanest fallback. Avoid `.lb` — it's expensive and
> requires Lebanese paperwork.

---

## Step 2 — Add DNS records at Namecheap

After buying: **Namecheap Dashboard → Domain List → Manage (your domain) →
Advanced DNS tab**.

Delete any default "parking" records Namecheap added (a CNAME for `www` pointing
to parkingpage, or an URL-redirect record), then add these **exact** records:

### A Records (point the root domain to GitHub) — add all four
| Type | Host | Value | TTL |
|------|------|-------------------|-----------|
| A Record | `@` | `185.199.108.153` | Automatic |
| A Record | `@` | `185.199.109.153` | Automatic |
| A Record | `@` | `185.199.110.153` | Automatic |
| A Record | `@` | `185.199.111.153` | Automatic |

### CNAME Record (point www → GitHub) — add one
| Type | Host | Value | TTL |
|------|------|----------------------|-----------|
| CNAME Record | `www` | `biba-pixel.github.io.` | Automatic |

> The value is your GitHub user page **`biba-pixel.github.io`** (NOT the
> `/phase` repo path). The trailing dot is fine if Namecheap keeps it.

### (Optional but recommended) AAAA Records for IPv6 — add all four
| Type | Host | Value | TTL |
|------|------|---------------------------|-----------|
| AAAA Record | `@` | `2606:50c0:8000::153` | Automatic |
| AAAA Record | `@` | `2606:50c0:8001::153` | Automatic |
| AAAA Record | `@` | `2606:50c0:8002::153` | Automatic |
| AAAA Record | `@` | `2606:50c0:8003::153` | Automatic |

Save. DNS changes take anywhere from ~10 minutes to a few hours to spread.

---

## Step 3 — Tell GitHub about the domain

This auto-creates the `CNAME` file in your repo and turns on HTTPS — no coding.

1. Go to **https://github.com/Biba-pixel/phase/settings/pages**
2. Under **"Custom domain"**, type your domain (e.g. `thephasemethod.com`,
   without `https://` or `www`) → **Save**.
3. GitHub runs a DNS check (may take a few minutes to go green).
4. Once verified, tick **"Enforce HTTPS"** (appears after the check passes;
   give it up to an hour if it's greyed out at first).

That's it. `https://thephasemethod.com` and `https://www.thephasemethod.com`
will both serve your site, secured with a free certificate.

---

## Which domain to enter as primary?

Enter the **root** form (`thephasemethod.com`) as the custom domain. GitHub
auto-redirects the `www` version to it (thanks to the CNAME above). If you'd
rather `www` be primary, enter `www.thephasemethod.com` instead — either works.

---

## Updating the site later (unchanged)

The custom domain doesn't change your workflow. To publish edits:

```
cd "C:\Users\bibas\Documents\Elise Phase website"
git add -A
git commit -m "Update site"
git push
```

---

## Troubleshooting

- **"Domain's DNS record could not be verified"** — wait longer (DNS is still
  propagating) and click Save again. Check records at https://dnschecker.org.
- **Site shows "Not Secure"** — HTTPS cert is still issuing; wait up to an hour,
  then enable "Enforce HTTPS".
- **www works but root doesn't (or vice-versa)** — re-check the four A records
  (`@`) and the one `www` CNAME are all present and exact.
- **Old github.io URL** — after a custom domain is set, GitHub auto-redirects
  `biba-pixel.github.io/phase` to your new domain. That's expected.

---

*When you've bought the domain, send me the exact name and I can double-check the
records / verify it goes live.*
