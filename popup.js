document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveApiKeyButton = document.getElementById('saveApiKey');
  const messageTextarea = document.getElementById('outreachMessage');
  const generateButton = document.getElementById('generateButton');
  const pasteButton = document.getElementById('pasteButton');

  // Load API key from storage
  chrome.storage.local.get(['openaiApiKey'], (result) => {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
    }
  });

  // Save API key
  saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
      alert('API key saved successfully!');
    });
  });

  // Generate message
  generateButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getProfileData' }, (profileData) => {
        if (chrome.runtime.lastError) {
          alert('Error: ' + chrome.runtime.lastError.message);
          return;
        }
        chrome.runtime.sendMessage({ action: 'analyzeProfile', data: profileData }, (response) => {
          if (response.message) {
            messageTextarea.value = response.message;
          } else {
            alert('Error generating message: ' + response.error);
          }
        });
      });
    });
  });

  // Paste message to DM
  pasteButton.addEventListener('click', () => {
    const message = messageTextarea.value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'pasteMessage', message }, (response) => {
        if (response && response.success) {
          alert('Message pasted successfully!');
        } else {
          alert('Failed to paste message. Please try again.');
        }
      });
    });
  });
});
