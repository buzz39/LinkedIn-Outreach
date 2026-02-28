# LinkedIn Outreach

A Chrome extension that analyzes LinkedIn profiles and generates personalized outreach messages using OpenAI's GPT-4o-mini model.

## Features

- 🔍 **Profile Analysis** – Automatically extracts name, bio, location, website, about section, and recent posts from any LinkedIn profile page
- 🤖 **AI-Powered Messages** – Generates friendly, professional, and personalized outreach messages via the OpenAI API
- 📋 **One-Click Paste** – Inserts the generated message directly into LinkedIn's DM compose box
- 🔑 **Secure Key Storage** – Stores your OpenAI API key locally using Chrome's built-in storage API

## Prerequisites

- Google Chrome (or any Chromium-based browser)
- An [OpenAI API key](https://platform.openai.com/api-keys)

## Installation

### Chrome Web Store

Install the extension directly from the [Chrome Web Store](#) *(link will be added after publishing)*.

### Manual Installation (Developer Mode)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/buzz39/LinkedIn-Outreach.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked** and select the repository folder

5. The **LinkedIn Outreach** extension icon will appear in your Chrome toolbar

## Usage

1. **Set your API key**
   - Click the extension icon in the Chrome toolbar
   - Enter your OpenAI API key in the password field
   - Click **Save API Key**

2. **Navigate to a LinkedIn profile**
   - Open any LinkedIn profile page (e.g., `linkedin.com/in/username`)

3. **Generate a message**
   - Click the extension icon
   - Click **Generate Message**
   - The personalized outreach message will appear in the text area

4. **Send the message**
   - Click **Paste Message to DM** to automatically insert the message into LinkedIn's message compose box
   - Review the message and hit send

## Project Structure

```
LinkedIn-Outreach/
├── manifest.json      # Extension configuration (Manifest V3)
├── background.js      # Service worker: calls OpenAI API and stores messages
├── content.js         # Content script: scrapes profile data and pastes messages
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic: triggers generation and paste actions
├── icon16.png         # Extension icon (16×16)
├── icon48.png         # Extension icon (48×48)
└── icon128.png        # Extension icon (128×128)
```

## How It Works

1. **Content Script (`content.js`)** runs on every LinkedIn page and extracts:
   - Name, bio, location, and website from the profile header
   - The full "About" section
   - Up to 5 recent posts

2. **Popup (`popup.js`)** requests the extracted data from the content script and forwards it to the background service worker.

3. **Background Script (`background.js`)** sends the profile data to the OpenAI Chat Completions API (`gpt-4o-mini`) and returns a concise, personalized 3–4 sentence outreach message.

4. The generated message is displayed in the popup and can be pasted into LinkedIn's DM box with a single button click.

## Permissions

| Permission | Reason |
|---|---|
| `activeTab` | Read the currently open LinkedIn profile page |
| `storage` | Persist the OpenAI API key and generated messages locally |
| `https://*.linkedin.com/*` | Access LinkedIn profile pages |
| `https://api.openai.com/*` | Call the OpenAI API to generate messages |

## Privacy

- Your OpenAI API key is stored **locally** in Chrome's storage and is never transmitted anywhere other than to the OpenAI API.
- Profile data is sent to OpenAI only when you click **Generate Message**.
- No data is collected or stored by this extension beyond your local machine.

For full details, see the [Privacy Policy](https://buzz39.github.io/LinkedIn-Outreach/privacy_policy.html).

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

This project is open source. See the repository for details.

## GitHub Pages

The public privacy policy is hosted via GitHub Pages at:

> **https://buzz39.github.io/LinkedIn-Outreach/privacy_policy.html**

To enable GitHub Pages (one-time setup):

1. Go to the repository on GitHub → **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Set **Branch** to `main` and **Folder** to `/docs`
4. Click **Save** — the site will be live within a minute
