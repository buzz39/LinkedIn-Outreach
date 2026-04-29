// LinkedIn Outreach — content script v1.2.1
// Runs on every LinkedIn page. Scrapes profile + handles DM paste.
// Massively expanded selector fallbacks + debug logging.

function safeText(el) {
  if (!el) return '';
  const t = el.innerText || el.textContent || '';
  return t.trim();
}

// Try a list of selectors, return text of first non-empty match
function tryQuery(selectors, contextLabel = '') {
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      const text = safeText(el);
      if (text) {
        console.log(`[LinkedIn Outreach] ✓ ${contextLabel} matched: ${sel} → "${text.slice(0, 60)}..."`);
        return text;
      }
    } catch (e) {
      // bad selector, skip
    }
  }
  console.warn(`[LinkedIn Outreach] ✗ ${contextLabel} — no selector matched`);
  return '';
}

function extractProfileInfo() {
  console.log('[LinkedIn Outreach] === Extracting profile from:', window.location.href);

  // NAME — many fallbacks
  let name = tryQuery([
    'h1.text-heading-xlarge',
    'h1.inline.t-24',
    '.pv-text-details__left-panel h1',
    '.ph5 h1',
    'main section h1',
    'main h1',
    'section.artdeco-card h1',
    '.text-heading-xlarge',
    'h1[class*="text-heading"]',
    'h1', // last resort
  ], 'name');

  // Sanity check — LinkedIn shows "LinkedIn" or generic strings on non-profile pages
  if (name && (name.toLowerCase() === 'linkedin' || name.length > 100)) {
    console.warn('[LinkedIn Outreach] Name looks bogus, clearing:', name);
    name = '';
  }

  // BIO / HEADLINE
  const bio = tryQuery([
    '.text-body-medium.break-words',
    '.pv-text-details__left-panel .text-body-medium',
    '.ph5 .text-body-medium',
    'div[data-generated-suggestion-target] + div .text-body-medium',
    '.text-body-medium',
    'div.text-body-medium',
    'main section .text-body-medium',
  ], 'bio');

  // LOCATION
  const location = tryQuery([
    '.text-body-small.inline.t-black--light.break-words',
    '.pv-text-details__left-panel .text-body-small',
    'span.text-body-small.inline',
    '[class*="text-body-small"][class*="t-black--light"]',
    'span.text-body-small[aria-hidden="true"]',
    'main section .text-body-small',
  ], 'location');

  // WEBSITE
  const websiteEl =
    document.querySelector('.pv-contact-info__contact-link') ||
    document.querySelector('a[href*="contact-info"]') ||
    document.querySelector('a[data-control-name*="contact_see_more"]');
  const website = websiteEl?.href || '';

  // ABOUT — many fallbacks
  const about = tryQuery([
    '#about ~ div .pv-shared-text-with-see-more span[aria-hidden="true"]',
    '#about ~ * .inline-show-more-text--is-collapsed-with-line-clamp span[aria-hidden="true"]',
    'section[data-section="summary"] span[aria-hidden="true"]',
    '.pv-shared-text-with-see-more span[aria-hidden="true"]',
    '.display-flex.ph5.pv3 span[aria-hidden="true"]',
    '.pv-about__summary-text span[aria-hidden="true"]',
    '#about ~ div span[aria-hidden="true"]',
    'div[class*="about"] span[aria-hidden="true"]',
    // catch-all: any large text block on the profile
    '.inline-show-more-text span[aria-hidden="true"]',
  ], 'about');

  // POSTS / RECENT ACTIVITY
  const posts = [];
  const postSelectors = [
    '.feed-shared-update-v2',
    '.profile-creator-shared-feed-update__container',
    '.update-components-update-v2',
    '[data-urn*="activity"]',
    'article.update-components-actor + *',
  ];
  let postElements = [];
  for (const sel of postSelectors) {
    postElements = document.querySelectorAll(sel);
    if (postElements.length > 0) {
      console.log(`[LinkedIn Outreach] Found ${postElements.length} posts via: ${sel}`);
      break;
    }
  }
  postElements.forEach((post, index) => {
    if (index < 5) {
      const postText =
        post.querySelector('.feed-shared-text')?.innerText?.trim() ||
        post.querySelector('.update-components-text')?.innerText?.trim() ||
        post.querySelector('.update-components-text-view')?.innerText?.trim() ||
        post.querySelector('span[dir="ltr"]')?.innerText?.trim() ||
        post.querySelector('.feed-shared-inline-show-more-text')?.innerText?.trim();
      if (postText && postText.length > 10) {
        posts.push(postText.slice(0, 500));
      }
    }
  });

  const result = { name, bio, location, website, about, posts };
  console.log('[LinkedIn Outreach] === Extracted:', result);
  return result;
}

// Paste message into LinkedIn DM
function pasteMessageToDM(message) {
  const messageButton =
    document.querySelector('.message-anywhere-button') ||
    document.querySelector('button[aria-label*="Message"]') ||
    document.querySelector('a[aria-label*="Message"]') ||
    document.querySelector('a[href*="/messaging/"]');

  if (messageButton) {
    messageButton.click();
    setTimeout(() => {
      const messageBox =
        document.querySelector('.msg-form__contenteditable') ||
        document.querySelector('div[contenteditable="true"][role="textbox"]') ||
        document.querySelector('.msg-form__msg-content-container [contenteditable="true"]');
      if (messageBox) {
        messageBox.focus();
        messageBox.innerText = message;
        messageBox.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
      } else {
        console.error('[LinkedIn Outreach] message box not found');
      }
    }, 1500);
  } else {
    console.error('[LinkedIn Outreach] message button not found on this page');
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
  }
  if (request.action === 'getProfileData') {
    try {
      sendResponse(extractProfileInfo());
    } catch (e) {
      console.error('[LinkedIn Outreach] extract error:', e);
      sendResponse({
        name: '', bio: '', location: '', website: '', about: '', posts: [], error: e.message
      });
    }
    return true;
  }
});

console.log('[LinkedIn Outreach] content script loaded on', window.location.href);
