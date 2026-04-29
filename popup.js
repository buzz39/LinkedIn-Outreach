document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveApiKeyButton = document.getElementById('saveApiKey');
  const messageTextarea = document.getElementById('outreachMessage');
  const generateButton = document.getElementById('generateButton');
  const pasteButton = document.getElementById('pasteButton');
  const statusEl = document.getElementById('status');

  function showStatus(text, type = 'success', durationMs = 2500) {
    statusEl.textContent = text;
    statusEl.className = `status show ${type}`;
    if (durationMs) {
      setTimeout(() => statusEl.className = 'status', durationMs);
    }
  }

  // Load API key from storage
  chrome.storage.local.get(['openaiApiKey'], (result) => {
    if (result.openaiApiKey) apiKeyInput.value = result.openaiApiKey;
  });

  // Save API key
  saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey.startsWith('sk-')) {
      showStatus('That doesn\'t look like an OpenAI key.', 'error');
      return;
    }
    chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
      showStatus('API key saved ✓', 'success');
    });
  });

  // Generate message
  generateButton.addEventListener('click', () => {
    generateButton.disabled = true;
    generateButton.textContent = '⏳ Generating...';
    showStatus('Reading profile + calling OpenAI...', 'success', 0);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab.url || !tab.url.includes('linkedin.com')) {
        showStatus('Open a LinkedIn profile first.', 'error');
        resetGenerate();
        return;
      }
      chrome.tabs.sendMessage(tab.id, { action: 'getProfileData' }, (profileData) => {
        if (chrome.runtime.lastError) {
          showStatus('Refresh the LinkedIn page and try again.', 'error');
          resetGenerate();
          return;
        }
        if (!profileData || !profileData.name) {
          showStatus('Couldn\'t read profile. Open a person\'s profile page.', 'error');
          resetGenerate();
          return;
        }
        chrome.runtime.sendMessage({ action: 'analyzeProfile', data: profileData }, (response) => {
          if (response && response.message) {
            messageTextarea.value = response.message;
            showStatus('Message generated ✓', 'success');
          } else {
            showStatus('Error: ' + (response?.error || 'unknown'), 'error');
          }
          resetGenerate();
        });
      });
    });
  });

  function resetGenerate() {
    generateButton.disabled = false;
    generateButton.textContent = '⚡ Generate Message';
  }

  // Paste message to DM
  pasteButton.addEventListener('click', () => {
    const message = messageTextarea.value.trim();
    if (!message) {
      showStatus('Generate a message first.', 'error');
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'pasteMessage', message }, (response) => {
        if (response && response.success) {
          showStatus('Pasted to DM ✓', 'success');
        } else {
          showStatus('Couldn\'t paste — open the message box manually.', 'error');
        }
      });
    });
  });
});
