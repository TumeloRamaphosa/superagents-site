/**
 * Client hook for optional PRD conversation model. Reads PRD_MODEL_HOOK_CONFIG only.
 * No network calls unless enabled is true and endpoint is a non-empty string.
 */
(function (global) {
  function getConfig() {
    return global.PRD_MODEL_HOOK_CONFIG || { enabled: false, endpoint: '' };
  }

  function isActive() {
    var c = getConfig();
    return c.enabled === true && String(c.endpoint || '').trim().length > 0;
  }

  function getStatusMessage() {
    if (isActive()) {
      return 'A language model endpoint is configured for this page. Conversation may be sent to that endpoint when you use the guide.';
    }
    return 'No language model is connected. The conversation guide uses fixed questions in your browser only—not an AI model. Nothing is sent to an inference service.';
  }

  function agentChatLabel() {
    return isActive() ? 'Assistant' : 'Guide';
  }

  /**
   * @param {object} payload — step context for the inference API (when active).
   * @returns {Promise<object|null>} Model turn { question, speak } or null to use scripted prompts.
   */
  function getAssistantTurn(payload) {
    if (!isActive()) {
      return Promise.resolve(null);
    }
    var endpoint = String(getConfig().endpoint).trim();
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) {
        throw new Error('Model endpoint returned ' + res.status);
      }
      return res.json();
    });
  }

  global.PrdModelHook = {
    getConfig: getConfig,
    isActive: isActive,
    getStatusMessage: getStatusMessage,
    agentChatLabel: agentChatLabel,
    getAssistantTurn: getAssistantTurn
  };
})(typeof window !== 'undefined' ? window : globalThis);
