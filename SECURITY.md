# Security

## If a key was leaked (e.g. Google Cloud warning)

1. **Rotate the key immediately**
   - **Firebase**: [Firebase Console](https://console.firebase.google.com) → Project Settings → General → Your apps → regenerate or create new Web API key. Restrict the old key or delete it.
   - **Google Cloud API keys**: [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials) → select the key → Regenerate or delete, then create a new one.

2. **Restrict the key (best practice)**
   - In Google Cloud Console, restrict the API key by:
     - **Application restriction**: HTTP referrers (e.g. `https://yourdomain.com/*`, `http://localhost:*`).
     - **API restriction**: only the APIs this app needs (e.g. Firebase-related APIs).

3. **Update your local and deployment env**
   - Replace the leaked value with the new key in:
     - Local: `.env.local` (never commit this file).
     - Vercel: Project → Settings → Environment Variables. Set `NEXT_PUBLIC_FIREBASE_API_KEY` and any other Firebase vars.

4. **If the key was ever committed to Git**
   - The value may still exist in history. After rotating:
     - Use [GitHub’s secret scanning](https://docs.github.com/en/code-security/secret-scanning) and consider [git filter-repo](https://github.com/newren/git-filter-repo) or BFG Repo-Cleaner to remove the secret from history (rewrites history; coordinate with collaborators).

## What is not committed

- **Environment files**: `.env`, `.env.local`, and all `.env.*` except `.env.example` are in `.gitignore`. Never commit real keys.
- **Credentials**: Service account JSON files, `.pem` keys, and similar files are ignored.

## Deployment (e.g. Vercel)

- Set all required variables in the hosting dashboard (e.g. Vercel → Project → Settings → Environment Variables).
- Use the same names as in `.env.example` (e.g. `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, etc.) so the app works without any `.env` in the repo.

## Reporting a vulnerability

If you find a security issue in this project, please report it privately (e.g. via repository owner contact or a private security report) rather than opening a public issue.
