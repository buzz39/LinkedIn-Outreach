// Function to generate outreach message using OpenAI API
async function generateOutreachMessage(profileData) {
  const apiKey = await getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not set');
  }

  const prompt = `Generate a personalized LinkedIn outreach message based on the following profile information:
Name: ${profileData.name}
Bio: ${profileData.bio}
Location: ${profileData.location}
Website: ${profileData.website}
About: ${profileData.about}
Recent posts:
${profileData.posts.map((post, index) => `${index + 1}. ${post}`).join('\n')}

The message should be friendly, professional, and reference specific details from the profile, including information from the "About" section and recent posts if relevant. Keep the message concise, around 3-4 sentences.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{"role": "user", "content": prompt}],
      max_tokens: 200,
      n: 1,
      stop: null,
      temperature: 0.7,
    })
  });

  const data = await response.json();
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content.trim();
  } else {
    throw new Error('Failed to generate message');
  }
}

// Function to get OpenAI API key from storage
function getOpenAIApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['openaiApiKey'], (result) => {
      resolve(result.openaiApiKey);
    });
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeProfile') {
    generateOutreachMessage(request.data)
      .then(message => {
        chrome.storage.local.set({ outreachMessage: message });
        sendResponse({ message });
      })
      .catch(error => {
        console.error('Error generating message:', error);
        sendResponse({ error: error.message });
      });
    return true; // Indicates that the response is sent asynchronously
  }
});
