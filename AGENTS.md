<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ATLETIX Project Context

Before working on this repo, read `ATLETIX_CONTEXT.md`.

## Project UI Rules

- Build mobile-first. Every page, dashboard, form, table, card, and navigation pattern must work cleanly on mobile before desktop polish.
- Avoid desktop-only tables or layouts on small screens. Use responsive card/list layouts for mobile when tables would squeeze or require awkward horizontal scrolling.
- Put reusable UI in the shared `src/components/ui` folder. Keep small primitives in `atoms`, larger composed pieces in `organisms`, and shared icon exports in `icons`.
- Prefer reusing existing shared UI components before creating page-local components.

Never commit `.env.local`; it contains local Supabase/Vercel credentials.
