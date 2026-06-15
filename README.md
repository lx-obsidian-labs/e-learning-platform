This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Important environment variables (set these in your Vercel Project → Settings → Environment Variables):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY  (keep this secret — do NOT commit it)

Optional but required for EFT payments:

- BANK_NAME
- BANK_ACCOUNT_NAME
- BANK_ACCOUNT_NUMBER
- BANK_BRANCH_CODE
- PAYMENT_REFERENCE_PREFIX

Note: The repository no longer includes a `.env.example` file — the app reads environment variables from Vercel in production. Keep `.env` in your local machine for development; it is ignored by git.

AI Chats Cleanup
-----------------

AI chat sessions are transient and should be deleted daily. To enable cleanup:

1. Set an environment variable in Vercel: AI_CLEANUP_SECRET (a strong random string).
2. Schedule a daily POST to `https://your-deployment.vercel.app/api/ai/cleanup` with JSON body `{ "secret": "<AI_CLEANUP_SECRET>" }`.
   - You can use Vercel Cron Jobs, GitHub Actions, or an external scheduler (curl / cron).
3. A SQL migration script is added at `scripts/migrate-ai-chats.sql` to create the `ai_chats` table. Run it in your Supabase project.

Vercel Cron (recommended)
------------------------

You can schedule the cleanup using Vercel Cron Jobs (recommended, no extra secrets in GitHub):

1. In your Vercel project, go to Settings → Cron Jobs → Add Cron Job.
2. Set Method: POST, URL: `https://<your-deploy>.vercel.app/api/ai/cleanup`.
3. Set the Body to JSON: `{ "secret": "<AI_CLEANUP_SECRET>" }` and Content-Type: application/json.
4. Set schedule (e.g., daily at 03:00 UTC) and save.

This avoids storing any cleanup-related secrets in GitHub and keeps scheduling inside Vercel.
