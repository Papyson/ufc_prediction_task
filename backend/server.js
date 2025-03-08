// const WebSocket = require('ws');
// const sessionManager = require('./session');

// const wss = new WebSocket.Server({ port: 8080 });
// let clients = new Map(); // Map of clientID -> WebSocket connection

// // Broadcast participant count updates.
// function broadcastParticipantCount() {
//   const count = clients.size;
//   const message = JSON.stringify({ type: 'participantCount', count });
//   clients.forEach((clientWs) => {
//     if (clientWs.readyState === WebSocket.OPEN) {
//       clientWs.send(message);
//     }
//   });
// }

// // Broadcast session updates to all connected clients.
// function broadcastSessionUpdate(updateData) {
//   const message = JSON.stringify({ type: 'sessionUpdate', ...updateData });
//   clients.forEach((clientWs) => {
//     if (clientWs.readyState === WebSocket.OPEN) {
//       clientWs.send(message);
//     }
//   });
// }

// // Set the update callback.
// sessionManager.setUpdateCallback(broadcastSessionUpdate);

// wss.on('connection', (ws) => {
//   ws.on('message', async (message) => {
//     let data;
//     try {
//       data = JSON.parse(message);
//     } catch (error) {
//       console.error("Invalid JSON received:", message);
//       return;
//     }

//     if (data.type === 'register' && data.clientID) {
//       clients.set(data.clientID, ws);
//       console.log(`Client registered: ${data.clientID}`);
//       broadcastParticipantCount();
//     } else if (data.type === 'chat' && data.clientID && data.message) {
//       broadcastChatMessage(data);
//     } else if (data.type === 'startSession' && data.clientID) {
//       try {
//         const sessionResult = await sessionManager.startSession(data.clientID);
//         ws.send(JSON.stringify({ type: 'sessionStarted', ...sessionResult }));
//       } catch (error) {
//         console.error("Error starting session:", error);
//         ws.send(JSON.stringify({ type: 'error', message: error.message }));
//       }
//     } else if (data.type === 'endSession') {
//       try {
//         await sessionManager.endSession();
//         ws.send(JSON.stringify({ type: 'sessionEnded', message: 'Session ended' }));
//       } catch (error) {
//         console.error("Error ending session:", error);
//         ws.send(JSON.stringify({ type: 'error', message: error.message }));
//       }
//     } else if (data.type === 'sendData' && data.payload) {
//       try {
//         await sessionManager.sendData(data.payload);
//         ws.send(JSON.stringify({ type: 'dataSent', message: 'Data sent successfully' }));
//       } catch (error) {
//         console.error("Error sending data:", error);
//         ws.send(JSON.stringify({ type: 'error', message: error.message }));
//       }
//     } else {
//       ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type or missing required fields' }));
//     }
//   });

//   ws.on('close', () => {
//     for (const [clientID, clientWs] of clients.entries()) {
//       if (clientWs === ws) {
//         clients.delete(clientID);
//         console.log(`Client disconnected: ${clientID}`);
//         break;
//       }
//     }
//     broadcastParticipantCount();
//   });
// });

// function broadcastChatMessage(data) {
//   const message = JSON.stringify(data);
//   clients.forEach((clientWs) => {
//     if (clientWs.readyState === WebSocket.OPEN) {
//       clientWs.send(message);
//     }
//   });
// }

// console.log("WebSocket server is running on ws://localhost:8080");


// backend/server.js
const WebSocket = require('ws');
const sessionManager = require('./session');

const wss = new WebSocket.Server({ port: 8080 });
let clients = new Map();

function broadcastParticipantCount() {
  const count = clients.size;
  const message = JSON.stringify({ type: 'participantCount', count });
  clients.forEach((clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}

function broadcastSessionUpdate(updateData) {
  const message = JSON.stringify({ type: 'sessionUpdate', ...updateData });
  clients.forEach((clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}

sessionManager.setUpdateCallback(broadcastSessionUpdate);

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (error) {
      console.error("Invalid JSON received:", message);
      return;
    }

    if (data.type === 'register' && data.clientID) {
      clients.set(data.clientID, ws);
      console.log(`Client registered: ${data.clientID}`);
      broadcastParticipantCount();
    } else if (data.type === 'chat' && data.clientID && data.message) {
      broadcastChatMessage(data);
    } else if (data.type === 'startSession' && data.clientID) {
      try {
        const sessionResult = await sessionManager.startSession(data.clientID);
        ws.send(JSON.stringify({ type: 'sessionStarted', ...sessionResult }));
      } catch (error) {
        console.error("Error starting session:", error);
        ws.send(JSON.stringify({ type: 'error', message: error.message }));
      }
    } else if (data.type === 'endSession') {
      ws.send(JSON.stringify({ type: 'error', message: 'Direct endSession not allowed. Use finishSession.' }));
    } else if (data.type === 'sendData' && data.payload) {
      try {
        await sessionManager.sendData(data.payload);
        ws.send(JSON.stringify({ type: 'dataSent', message: 'Data sent successfully' }));
      } catch (error) {
        console.error("Error sending data:", error);
        ws.send(JSON.stringify({ type: 'error', message: error.message }));
      }
    } else {
      ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type or missing required fields' }));
    }
  });

  ws.on('close', () => {
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

function broadcastChatMessage(data) {
  const message = JSON.stringify(data);
  clients.forEach((clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}

console.log("WebSocket server is running on ws://localhost:8080");
