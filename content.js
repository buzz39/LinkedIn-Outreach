// LinkedIn Outreach — content script
// Runs on every LinkedIn page. Scrapes profile data + handles DM paste.
// Uses fallback selectors to survive LinkedIn DOM changes.

function safeText(el) {
  return el && el.innerText ? el.innerText.trim() : '';
}

// Try a list of selectors, return innerText of first match
function tryQuery(selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return safeText(el);
  }
  return '';
}

// Function to extract profile information
function extractProfileInfo() {
  const name = tryQuery([
    '.text-heading-xlarge',
    'h1.text-heading-xlarge',
    'main h1',
    'section.artdeco-card h1'
  ]);

  const bio = tryQuery([
    '.text-body-medium.break-words',
    '.text-body-medium',
    'div.text-body-medium'
  ]);

  const location = tryQuery([
    '.text-body-small.inline.t-black--light.break-words',
    'span.text-body-small.inline',
    '[class*="text-body-small"][class*="t-black--light"]'
  ]);

  const websiteEl = document.querySelector('.pv-contact-info__contact-link') ||
                    document.querySelector('a[href*="contact-info"]');
  const website = websiteEl?.href || '';

  // Extract the "About" section (try multiple selectors)
  const about = tryQuery([
    '.pv-shared-text-with-see-more span[aria-hidden="true"]',
    'section[data-section="summary"] span[aria-hidden="true"]',
    'div.display-flex.ph5.pv3 span[aria-hidden="true"]',
    '#about ~ div span[aria-hidden="true"]'
  ]);

  // Extract recent posts (try multiple selectors)
  const posts = [];
  const postSelectors = [
    '.feed-shared-update-v2',
    '.profile-creator-shared-feed-update__container',
    '[data-urn*="activity"]'
  ];
  let postElements = [];
  for (const sel of postSelectors) {
    postElements = document.querySelectorAll(sel);
    if (postElements.length > 0) break;
  }
  postElements.forEach((post, index) => {
    if (index < 5) {
      const postText = post.querySelector('.feed-shared-text')?.innerText.trim() ||
                       post.querySelector('.update-components-text')?.innerText.trim() ||
                       post.querySelector('span[dir="ltr"]')?.innerText.trim();
      if (postText) {
        posts.push(postText.slice(0, 500)); // cap length
      }
    }
  });

  return { name, bio, location, website, about, posts };
}

// Function to paste message into LinkedIn DM
function pasteMessageToDM(message) {
  const messageButton = document.querySelector('.message-anywhere-button') ||
                        document.querySelector('button[aria-label*="Message"]') ||
                        document.querySelector('a[href*="/messaging/"]');
  if (messageButton) {
    messageButton.click();
    setTimeout(() => {
      const messageBox = document.querySelector('.msg-form__contenteditable') ||
                         document.querySelector('div[contenteditable="true"][role="textbox"]');
      if (messageBox) {
        // Set both innerText and dispatch input event so LinkedIn's React picks it up
        messageBox.focus();
        messageBox.innerText = message;
        const inputEvent = new InputEvent('input', { bubbles: true, cancelable: true });
        messageBox.dispatchEvent(inputEvent);
      } else {
        console.error('LinkedIn Outreach: message box not found');
      }
    }, 1200);
  } else {
    console.error('LinkedIn Outreach: message button not found on this page');
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pasteMessage') {
    try {
      pasteMessageToDM(request.message);
      sendResponse({ success: true });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
    return true;
  } else if (request.action === 'getProfileData') {
    try {
      sendResponse(extractProfileInfo());
    } catch (e) {
      sendResponse({ name: '', bio: '', location: '', website: '', about: '', posts: [], error: e.message });
    }
    return true;
  }
});
