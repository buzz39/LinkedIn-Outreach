// ============================================================================
// LinkedIn Outreach — Background Service Worker
// Supports OpenAI + OpenRouter (200+ models)
// ============================================================================

const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    keyPrefix: 'sk-',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini (cheap, fast) — recommended' },
      { id: 'gpt-4o', label: 'GPT-4o (best quality)' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (cheapest)' },
    ],
    extraHeaders: () => ({}),
  },
  openrouter: {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    keyPrefix: 'sk-or-',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', label: '🆓 Llama 3.3 70B (FREE)' },
      { id: 'google/gemini-2.0-flash-exp:free', label: '🆓 Gemini 2.0 Flash (FREE)' },
      { id: 'deepseek/deepseek-chat:free', label: '🆓 DeepSeek V3 (FREE)' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (best writing)' },
      { id: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (cheap + fast)' },
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini (via OpenRouter)' },
      { id: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5' },
      { id: 'meta-llama/llama-3.1-405b-instruct', label: 'Llama 3.1 405B' },
    ],
    extraHeaders: () => ({
      'HTTP-Referer': 'https://github.com/buzz39/LinkedIn-Outreach',
      'X-Title': 'LinkedIn Outreach',
    }),
  },
};

// ============================================================================
// Settings storage (provider, key per provider, model per provider)
// ============================================================================

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ['provider', 'openaiApiKey', 'openrouterApiKey', 'openaiModel', 'openrouterModel'],
      (result) => {
        const provider = result.provider || 'openai';
        const apiKey =
          provider === 'openrouter' ? result.openrouterApiKey : result.openaiApiKey;
        const model =
          (provider === 'openrouter' ? result.openrouterModel : result.openaiModel) ||
          PROVIDERS[provider].defaultModel;
        resolve({ provider, apiKey, model });
      }
    );
  });
}

// ============================================================================
// Generate outreach message
// ============================================================================

async function generateOutreachMessage(profileData) {
  const { provider, apiKey, model } = await getSettings();
  const cfg = PROVIDERS[provider];

  if (!apiKey) {
    throw new Error(`${cfg.name} API key not set. Open the extension popup.`);
  }

  const prompt = `Generate a personalized LinkedIn outreach message based on the following profile:
Name: ${profileData.name}
Bio: ${profileData.bio}
Location: ${profileData.location}
Website: ${profileData.website}
About: ${profileData.about}
Recent posts:
${profileData.posts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

The message should be friendly, professional, and reference specific details from the profile (especially the About section and recent posts if relevant). Keep it concise: 3-4 sentences. Do not include a subject line. Do not start with "Hi [Name]" — start naturally.`;

  const response = await fetch(cfg.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...cfg.extraHeaders(),
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 220,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${cfg.name} ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content.trim();
  }
  throw new Error(data.error?.message || 'No response from model');
}

// ============================================================================
// Message router
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeProfile') {
    generateOutreachMessage(request.data)
      .then((message) => {
        chrome.storage.local.set({ outreachMessage: message });
        sendResponse({ message });
      })
      .catch((error) => {
        console.error('Error generating message:', error);
        sendResponse({ error: error.message });
      });
    return true; // async response
  }

  if (request.action === 'getProviderConfig') {
    sendResponse({ providers: PROVIDERS });
    return false;
  }
});
