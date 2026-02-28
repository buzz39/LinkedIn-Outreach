// Function to extract profile information
function extractProfileInfo() {
  const name = document.querySelector('.text-heading-xlarge')?.innerText.trim();
  const bio = document.querySelector('.text-body-medium')?.innerText.trim();
  const location = document.querySelector('.text-body-small.inline.t-black--light.break-words')?.innerText.trim();
  const website = document.querySelector('.pv-contact-info__contact-link')?.href;

  // Extract the "About" section
  const about = document.querySelector('.pv-shared-text-with-see-more span[aria-hidden="true"]')?.innerText.trim();

  // Extract recent posts
  const posts = [];
  const postElements = document.querySelectorAll('.feed-shared-update-v2');
  postElements.forEach((post, index) => {
    if (index < 5) { // Limit to 5 recent posts
      const postText = post.querySelector('.feed-shared-text')?.innerText.trim();
      if (postText) {
        posts.push(postText);
      }
    }
  });

  return { name, bio, location, website, about, posts };
}

// Function to paste message into LinkedIn DM
function pasteMessageToDM(message) {
  const messageButton = document.querySelector('.message-anywhere-button');
  if (messageButton) {
    messageButton.click();
    setTimeout(() => {
      const messageBox = document.querySelector('.msg-form__contenteditable');
      if (messageBox) {
        messageBox.innerText = message;
      } else {
        console.error('Message box not found');
      }
    }, 1000);
  } else {
    console.error('Message button not found');
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pasteMessage') {
    pasteMessageToDM(request.message);
    sendResponse({ success: true });
  } else if (request.action === 'getProfileData') {
    sendResponse(extractProfileInfo());
  }
});
