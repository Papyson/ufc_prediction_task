document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}document.addEventListener("DOMContentLoaded", () => {
  const wsUrl = window.CONFIG.wsUrl;
  let ws;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let heartbeatInterval;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;

      const clientID = generateAndStoreClientID();
      const userName = sessionStorage.getItem("userName");
      console.log("Using clientID:", clientID);
      ws.send(JSON.stringify({ type: "register", clientID, userName }));

      preTask.init(ws);
      trialPhase.init(ws);
      postTask.init(ws);
      chat.init(ws);
      utilities.setWebSocket(ws);
      onboarding.init(ws);

      preTask.showPreTaskScreen();

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received pong from server");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      stopHeartbeat();

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error("Max reconnection attempts reached");
        alert("Connection lost. Please refresh the page.");
      }
    };
  }

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "ping",
            clientID: sessionStorage.getItem("PROLIFIC_PID"),
            timestamp: Date.now(),
          })
        );
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  connect();
});

function generateAndStoreClientID() {
  const urlParams = new URLSearchParams(window.location.search);
  const prolificId = urlParams.get("PROLIFIC_PID");

  if (prolificId) {
    console.log("Using Prolific ID from URL:", prolificId);
    sessionStorage.setItem("PROLIFIC_PID", prolificId);
    return prolificId;
  }

  const storedId = sessionStorage.getItem("PROLIFIC_PID");
  if (storedId) {
    console.log("Using previously stored client ID:", storedId);
    return storedId;
  }

  const fallbackId =
    "client-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  sessionStorage.setItem("PROLIFIC_PID", fallbackId);
  console.log("Generated fallback client ID:", fallbackId);
  return fallbackId;
}