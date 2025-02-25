// main.js
document.addEventListener("DOMContentLoaded", async () => {
    // Start session management
    sessionManager.startSession();
  
    // Initialize modules
    preTask.init();
    trialPhase.init();
    postTask.init();
    chat.init();  // if using real-time chat
  
    // Begin experiment with preTask screen
    preTask.showPreTaskScreen();
  });
  