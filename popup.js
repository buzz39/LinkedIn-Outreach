// ============================================================================
// LinkedIn Outreach — Popup UI
// Multi-provider: OpenAI + OpenRouter
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  const providerSelect = document.getElementById('providerSelect');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const keyHint = document.getElementById('keyHint');
  const modelSelect = document.getElementById('modelSelect');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const messageTextarea = document.getElementById('outreachMessage');
  const generateButton = document.getElementById('generateButton');
  const pasteButton = document.getElementById('pasteButton');
  const statusEl = document.getElementById('status');

  // Get provider config from background
  const { providers } = await chrome.runtime.sendMessage({ action: 'getProviderConfig' });

  function showStatus(text, type = 'success', durationMs = 2500) {
    statusEl.textContent = text;
    statusEl.className = `status show ${type}`;
    if (durationMs) {
      setTimeout(() => (statusEl.className = 'status'), durationMs);
    }
  }

  // ========================================================================
  // Provider switching
  // ========================================================================

  function renderProvider(provider) {
    const cfg = providers[provider];

    // Hint text under API key
    if (provider === 'openai') {
      keyHint.innerHTML =
        'Get yours at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>';
    } else {
      keyHint.innerHTML =
        '🆓 Free models available! Get key at <a href="https://openrouter.ai/keys" target="_blank">openrouter.ai/keys</a>';
    }

    // Placeholder
    apiKeyInput.placeholder = cfg.keyPrefix + '...';

    // Models dropdown
    modelSelect.innerHTML = '';
    cfg.models.forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.label;
      modelSelect.appendChild(opt);
    });

    // Load saved key + model for this provider
    const keyStorage = provider === 'openrouter' ? 'openrouterApiKey' : 'openaiApiKey';
    const modelStorage = provider === 'openrouter' ? 'openrouterModel' : 'openaiModel';
    chrome.storage.local.get([keyStorage, modelStorage], (result) => {
      apiKeyInput.value = result[keyStorage] || '';
      if (result[modelStorage]) modelSelect.value = result[modelStorage];
    });
  }

  // Load saved provider on startup
  chrome.storage.local.get(['provider'], (result) => {
    const provider = result.provider || 'openai';
    providerSelect.value = provider;
    renderProvider(provider);
  });

  providerSelect.addEventListener('change', () => {
    renderProvider(providerSelect.value);
  });

  // ========================================================================
  // Save settings
  // ========================================================================

  saveSettingsBtn.addEventListener('click', () => {
    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;
    const cfg = providers[provider];

    if (!apiKey) {
      showStatus('Please enter your API key.', 'error');
      return;
    }
    if (!apiKey.startsWith(cfg.keyPrefix)) {
      showStatus(`${cfg.name} keys start with "${cfg.keyPrefix}".`, 'error');
      return;
    }

    const keyStorage = provider === 'openrouter' ? 'openrouterApiKey' : 'openaiApiKey';
    const modelStorage = provider === 'openrouter' ? 'openrouterModel' : 'openaiModel';

    chrome.storage.local.set(
      {
        provider,
        [keyStorage]: apiKey,
        [modelStorage]: model,
      },
      () => {
        showStatus(`Saved ✓ Using ${cfg.name} · ${model}`, 'success');
      }
    );
  });

  // ========================================================================
  // Generate message
  // ========================================================================

  generateButton.addEventListener('click', () => {
    generateButton.disabled = true;
    generateButton.textContent = '⏳ Generating...';
    showStatus('Reading profile + calling AI...', 'success', 0);

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
          showStatus("Couldn't read profile. Open a person's profile page.", 'error');
          resetGenerate();
          return;
        }
        chrome.runtime.sendMessage(
          { action: 'analyzeProfile', data: profileData },
          (response) => {
            if (response && response.message) {
              messageTextarea.value = response.message;
              showStatus('Message generated ✓', 'success');
            } else {
              showStatus('Error: ' + (response?.error || 'unknown'), 'error', 5000);
            }
            resetGenerate();
          }
        );
      });
    });
  });

  function resetGenerate() {
    generateButton.disabled = false;
    generateButton.textContent = '⚡ Generate Message';
  }

  // ========================================================================
  // Paste to DM
  // ========================================================================

  pasteButton.addEventListener('click', () => {
    const message = messageTextarea.value.trim();
    if (!message) {
      showStatus('Generate a message first.', 'error');
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'pasteMessage', message },
        (response) => {
          if (response && response.success) {
            showStatus('Pasted to DM ✓', 'success');
          } else {
            showStatus("Couldn't paste — open the message box manually.", 'error');
          }
        }
      );
    });
  });
});
