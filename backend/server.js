// backend/server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
let clients = new Map(); // Map of clientID -> WebSocket connection

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (error) {
      console.error("Invalid JSON received:", message);
      return;
    }
    // Handle registration message
    if (data.type === 'register' && data.clientID) {
      clients.set(data.clientID, ws);
      console.log(`Client registered: ${data.clientID}`);
      broadcastParticipantCount();
    }
    // Handle chat messages
    else if (data.type === 'chat' && data.clientID && data.message) {
      broadcastChatMessage(data);
    }
  });

  ws.on('close', () => {
    // Remove the disconnected client
    for (const [clientID, clientWs] of clients.entries()) {
      if (clientWs === ws) {
        clients.delete(clientID);
        console.log(`Client disconnected: ${clientID}`);
        break;
      }
    }
    broadcastParticipantCount();
  });
});

/**
 * Broadcasts the current participant count to all connected clients.
 */
function broadcastParticipantCount() {
  const count = clients.size;
  const message = JSON.stringify({ type: 'participantCount', count });
  clients.forEach((clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}

/**
 * Broadcasts a chat message to all connected clients.
 * @param {Object} data - The chat message payload.
 */
function broadcastChatMessage(data) {
  const message = JSON.stringify(data);
  clients.forEach((clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}

console.log("WebSocket server is running on ws://localhost:8080");
