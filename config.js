const CONFIG = {
  experimentName: "UFC Prediction Experiment",
  version: "1.0.0",
  // For development use a temporary API key; in production, securely manage this key.
  apiKey: "TEMP_API_KEY_1234",
  // Endpoint for your server-side data saving if needed (this example uses a placeholder)
  serverEndpoint: "https://yourserver.com/api/saveData",
  // Prolific redirection URL (standard Prolific completion endpoint)
  prolificRedirectURL: "https://app.prolific.co/submissions/complete",
  // Additional configuration for WebSocket if you implement real-time features
  wsUrl: "ws://localhost:8080",
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}