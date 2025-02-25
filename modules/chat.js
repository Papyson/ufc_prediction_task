// modules/chat.js
const chat = (() => {
    let ws = null;
  
    /**
     * Initializes the chat module with a WebSocket connection.
     * @param {WebSocket} wsConnection - Optional WebSocket; if not provided, uses window._ws.
     */
    function init(wsConnection) {
      ws = wsConnection || window._ws;
      if (!ws) {
        console.error("Chat: No WebSocket connection available.");
      }
    }
  
    /**
     * Appends a chat message to the chat container.
     * @param {string} clientID - Sender's ID.
     * @param {string} message - Message text.
     */
    function appendMessage(clientID, message) {
      const chatContainer = document.getElementById("chat-messages");
      if (!chatContainer) {
        console.error("Chat container not found.");
        return;
      }
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("chat-message");
      msgDiv.innerHTML = `<span class="user-name">${clientID}:</span> <span class="message-text">${message}</span>`;
      chatContainer.appendChild(msgDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  
    /**
     * Sends a chat message via the WebSocket connection.
     * @param {string} message - The message to send.
     */
    function sendMessage(message) {
      const clientID = sessionStorage.getItem("PROLIFIC_PID");
      if (!clientID) {
        console.error("Client ID not found in sessionStorage.");
        return;
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        const payload = {
          type: "chat",
          clientID: clientID,
          message: message,
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(payload));
      } else {
        console.error("WebSocket is not open; cannot send message.");
      }
    }
  
    return {
      init,
      appendMessage,
      sendMessage
    };
  })();
  