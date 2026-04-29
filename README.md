# LinkedIn Outreach 💼

> A tiny Chrome extension that reads the LinkedIn profile you're viewing and generates a personalized outreach message via OpenAI — then pastes it straight into the DM box.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Privacy](https://img.shields.io/badge/Privacy-BYOK%20%7C%20No%20Tracking-green.svg)](https://buzz39.github.io/LinkedIn-Outreach/privacy_policy.html)

## ✨ What it does

1. Open any LinkedIn profile
2. Click the extension icon
3. Hit **Generate Message** → AI writes a tailored opener using their bio, headline, and recent posts
4. Hit **Paste to DM** → message lands in the LinkedIn message box, ready to send

That's it. No CRM bloat, no "AI prospecting suite". Just one job, done well.

## 🔒 Privacy-first by design

- **BYOK** (bring your own OpenAI API key) — stored only in `chrome.storage.local`, never sent anywhere except OpenAI
- **Zero tracking** — no analytics, no telemetry, no servers (other than OpenAI's API)
- **Open source** — read the code, audit it yourself
- **Manifest V3** — runs only on `linkedin.com`

## 📥 Install

### Chrome Web Store (coming soon)
*Pending review — link will go here.*

### Manual install (right now)
1. Download the latest `linkedin-outreach-vX.X.X.zip` from [Releases](https://github.com/buzz39/LinkedIn-Outreach/releases)
2. Unzip it
3. Open `chrome://extensions/`
4. Enable **Developer mode** (top right toggle)
5. Click **Load unpacked** → select the unzipped folder
6. Click the extension icon, paste your OpenAI API key (starts with `sk-...`), hit **Save Key**
7. Open any LinkedIn profile and start using it

## 🛠️ For developers

```bash
git clone https://github.com/buzz39/LinkedIn-Outreach.git
cd LinkedIn-Outreach
# load as unpacked extension via chrome://extensions/
```

### Files
- `manifest.json` — MV3 config
- `popup.html` / `popup.js` — extension popup UI + logic
- `content.js` — scrapes profile + pastes DM
- `background.js` — service worker (handles OpenAI API calls to keep the key out of LinkedIn's page context)
- `docs/privacy_policy.html` — published to GitHub Pages

### Build a release zip
```bash
zip -r linkedin-outreach-vX.X.X.zip . -x "*.git*" "dist/*" "docs/*" "instructions.md" "README.md" "*.DS_Store"
```

## 🌐 Privacy Policy

Hosted via GitHub Pages: https://buzz39.github.io/LinkedIn-Outreach/privacy_policy.html

> **One-time prerequisite:** In repo Settings → Pages, set the Source to **GitHub Actions**.

## 🤝 Contributing

PRs welcome — keep it small and focused. See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📝 License

MIT — see [LICENSE](LICENSE).

---

Made with ☕ + a bit of LinkedIn fatigue.
