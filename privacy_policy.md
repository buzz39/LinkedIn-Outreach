# Privacy Policy for LinkedIn Outreach

**Last updated: 2025**

## Overview

LinkedIn Outreach is a Chrome extension that helps you generate personalized outreach messages for LinkedIn profiles using the OpenAI API. This policy explains what data the extension accesses, how it is used, and how it is protected.

## Data Collected and Used

### OpenAI API Key
- You optionally provide your own OpenAI API key to enable message generation.
- The key is stored **locally** in Chrome's built-in `chrome.storage.local` and is **never transmitted** to any server operated by this extension.
- The key is sent directly from your browser to the OpenAI API (`api.openai.com`) only when you click **Generate Message**.

### LinkedIn Profile Data
- When you click **Generate Message**, the extension reads publicly visible information from the currently open LinkedIn profile page (name, bio, location, website, about section, and recent posts).
- This data is sent directly from your browser to the OpenAI API solely to generate a personalized outreach message.
- No profile data is stored beyond your current browser session.

### Generated Messages
- The most recently generated message is stored locally using `chrome.storage.local` so it persists across popup opens.
- This data never leaves your device except as described above.

## Data NOT Collected

- The extension does **not** collect, transmit, or share any data with the extension developer or any third party.
- No analytics, telemetry, or tracking of any kind is performed.
- No user accounts or sign-ins are required.

## Third-Party Services

The extension communicates with:
- **OpenAI API** (`api.openai.com`) — to generate outreach messages. Your use of the OpenAI API is subject to [OpenAI's Privacy Policy](https://openai.com/policies/privacy-policy).

## Data Security

All data is processed locally in your browser. Sensitive data (your API key) is stored using Chrome's secure local storage and is never transmitted except directly to the OpenAI API over HTTPS.

## Changes to This Policy

If this policy changes, the updated version will be published in the extension's [GitHub repository](https://github.com/buzz39/LinkedIn-Outreach).

## Contact

For questions or concerns, please open an issue at [https://github.com/buzz39/LinkedIn-Outreach/issues](https://github.com/buzz39/LinkedIn-Outreach/issues).
