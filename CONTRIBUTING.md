# Contributing

Thanks for considering a contribution! This is a small extension and we want to keep it small.

## Ground Rules

- **One feature per PR** — don't bundle unrelated changes
- **No new dependencies** unless absolutely necessary (the whole point is staying lightweight)
- **No tracking, no telemetry** — privacy is a feature
- **No backend** — BYOK + direct API calls only

## Setup

```bash
git clone https://github.com/buzz39/LinkedIn-Outreach.git
cd LinkedIn-Outreach
# Load as unpacked extension via chrome://extensions/
```

## Running locally

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → point at this repo's root
4. Pin the extension and try it on a LinkedIn profile

## Submitting a PR

1. Fork → branch off `main`
2. Make your changes (small, focused)
3. Test it manually on at least 2 different LinkedIn profiles
4. Bump version in `manifest.json` if it's a user-facing change
5. Open a PR with:
   - **What changed** (1-2 sentences)
   - **Why** (the problem you're solving)
   - **How to test** (steps + screenshot if UI changed)

## Selector-fix PRs are gold ⭐

LinkedIn changes its DOM constantly. If a CSS selector breaks, please open an issue (or better, a PR) with:
- Which field broke (name, bio, posts, etc.)
- What the new selector should be
- Date you noticed (helps us track LinkedIn's change cadence)

## Code style

- Vanilla JS, no framework
- 2-space indent
- camelCase
- Comments only for non-obvious logic

## Reporting bugs

Open an issue with:
- Chrome version
- What you did
- What you expected
- What happened
- Screenshot/console errors if possible

## Questions?

Open a [Discussion](https://github.com/buzz39/LinkedIn-Outreach/discussions) — happy to chat.
