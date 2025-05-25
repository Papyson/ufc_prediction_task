const onboarding = (() => {
    let ws = null;
    let appContainer = null;
    let onboardingScreen = null;
    let currentMode = null;
    let onboardingInProgress = false;
    let onboardingCountdownInterval = null;
    let keepAliveInterval = null;
  
    const ONBOARDING_CONFIG = {
      itemDuration: 20, // 20 seconds per intro item
      syncBuffer: 2, // 2 seconds buffer for synchronization
      solo: {
        totalScreens: 2,
        screen1Items: 3,
        screen2Items: 1,
        getTotalTime() {
          return (
            (this.screen1Items + this.screen2Items) *
              ONBOARDING_CONFIG.itemDuration +
            ONBOARDING_CONFIG.syncBuffer
          );
        },
      },
      group: {
        totalScreens: 3,
        screen1Items: 3,
        screen2Items: 2,
        screen3Items: 1,
        getTotalTime() {
          return (
            (this.screen1Items + this.screen2Items + this.screen3Items) *
              ONBOARDING_CONFIG.itemDuration +
            ONBOARDING_CONFIG.syncBuffer
          );
        },
      },
    };
  
    function init(wsConnection) {
      ws = wsConnection;
      appContainer = document.getElementById("app-container");
      createOnboardingScreen();
    }
  
    function startKeepAlive() {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
      }
  
      keepAliveInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN && onboardingInProgress) {
          ws.send(
            JSON.stringify({
              type: "ping",
              clientID: sessionStorage.getItem("PROLIFIC_PID"),
              timestamp: Date.now(),
            })
          );
          console.log("Sent WebSocket keepalive ping during onboarding");
        }
      }, 15000);
    }
  
    function stopKeepAlive() {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
    }
  
    function createOnboardingScreen() {
      onboardingScreen = document.createElement("div");
      onboardingScreen.classList.add("screen");
      onboardingScreen.id = "onboarding-screen";
      onboardingScreen.style.display = "none";
  
      onboardingScreen.innerHTML = `
          <div id="onboarding-countdown-display" style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 5px; border: 2px solid #ffcc00; display: none;">
            <div style="color: #ffcc00; font-weight: bold; font-size: 1.1em;">Onboarding Timer</div>
            <div id="onboarding-countdown-timer" style="color: #fff; font-size: 1.3em; text-align: center;">--:--</div>
          </div>
          <h2 id="onboarding-title">Getting Ready...</h2>
          <div id="onboarding-content">
            <p>Preparing your onboarding experience...</p>
          </div>
          <div id="onboarding-sync-status" style="text-align: center; margin-top: 20px;">
            <p>Synchronizing with other participants...</p>
          </div>
        `;
  
      appContainer.appendChild(onboardingScreen);
    }
  
    function startOnboarding(mode, sessionID) {
      currentMode = mode;
      currentScreenIndex = 0;
      onboardingInProgress = true;
      hideAllScreens();
      onboardingScreen.style.display = "block";
  
      startKeepAlive();
  
      if (mode === "solo") {
        document.getElementById("onboarding-title").textContent =
          "Solo Mode Onboarding";
        document.getElementById("onboarding-sync-status").innerHTML =
          "<p>Starting Onboarding...</p>";
        startOnboardingCountdown(ONBOARDING_CONFIG.solo.getTotalTime());
        setTimeout(() => showOnboardingFlow(mode), 1000);
      } else if (mode === "group") {
        document.getElementById("onboarding-title").textContent =
          "Group Mode Onboarding";
        document.getElementById("onboarding-sync-status").innerHTML =
          "<p>Waiting for all participants to be ready...</p>";
        startOnboardingCountdown(ONBOARDING_CONFIG.group.getTotalTime());
        setTimeout(() => showOnboardingFlow(mode), 1000);
      }
    }
  
    function startOnboardingCountdown(totalSeconds) {
      const countdownDisplay = document.getElementById(
        "onboarding-countdown-display"
      );
      const countdownTimer = document.getElementById(
        "onboarding-countdown-timer"
      );
  
      countdownDisplay.style.display = "block";
      let remaining = totalSeconds;
  
      const updateCountdown = () => {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        countdownTimer.textContent = `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;
  
        if (remaining <= 0) {
          clearInterval(onboardingCountdownInterval);
          countdownTimer.textContent = "0:00";
          countdownDisplay.style.display = "none";
        } else {
          remaining--;
        }
      };
  
      updateCountdown(); // Initial update
      onboardingCountdownInterval = setInterval(updateCountdown, 1000);
    }
  
    function showOnboardingFlow(mode) {
      document.getElementById("onboarding-sync-status").style.display = "none";
      currentScreenIndex = 0;
  
      if (mode === "solo") {
        showSoloScreen(0);
      } else if (mode === "group") {
        showGroupScreen(0);
      }
    }
  
    function showSoloScreen(screenIndex) {
      currentScreenIndex = screenIndex;
  
      if (screenIndex === 0) {
        createSoloInitialScreen();
        setTimeout(
          () =>
            startIntroTour(getSoloInitialSteps(), () => {
              showSoloScreen(1);
            }),
          500
        );
      } else if (screenIndex === 1) {
        createSoloFinalScreen();
        setTimeout(
          () =>
            startIntroTour(getSoloFinalSteps(), () => {
              completeOnboarding();
            }),
          500
        );
      }
    }
  
    function showGroupScreen(screenIndex) {
      currentScreenIndex = screenIndex;
  
      if (screenIndex === 0) {
        createGroupInitialScreen();
        setTimeout(
          () =>
            startIntroTour(getGroupInitialSteps(), () => {
              showGroupScreen(1);
            }),
          500
        );
      } else if (screenIndex === 1) {
        createGroupChatScreen();
        setTimeout(
          () =>
            startIntroTour(getGroupChatSteps(), () => {
              showGroupScreen(2);
            }),
          500
        );
      } else if (screenIndex === 2) {
        createGroupFinalScreen();
        setTimeout(
          () =>
            startIntroTour(getGroupFinalSteps(), () => {
              completeOnboarding();
            }),
          500
        );
      }
    }
  
    function createSoloInitialScreen() {
      document.getElementById("onboarding-title").textContent =
        "Solo Mode - Initial Bet Phase";
      document.getElementById("onboarding-content").innerHTML = `
        <div class="onboarding-preview">
          <div id="mock-initial-screen" class="mock-screen">
            <div id="mock-wallet" class="mock-element">
              <p><strong>💰 Wallet: $100</strong></p>
            </div>
            <div id="mock-fighter-table" class="mock-element">
              <table class="fighter-table mock-table">
                <thead>
                  <tr>
                    <th>Stat</th>
                    <th class="winner-column">Fighter A</th>
                    <th>Fighter B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="rationale-row">
                    <td>Career Wins</td>
                    <td class="winner-column-cell">15</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>Career Losses</td>
                    <td class="winner-column-cell">3</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Age</td>
                    <td class="winner-column-cell">28 yrs</td>
                    <td>31 yrs</td>
                  </tr>
                  <tr>
                    <td>Height</td>
                    <td class="winner-column-cell">6'2"</td>
                    <td>6'0"</td>
                  </tr>
                  <tr>
                    <td>Strikes Landed/Min</td>
                    <td class="winner-column-cell">4.2/min</td>
                    <td>3.8/min</td>
                  </tr>
                  <tr>
                    <td>Strike Accuracy</td>
                    <td class="winner-column-cell">65%</td>
                    <td>58%</td>
                  </tr>
                  <tr>
                    <td>Strike Defense</td>
                    <td class="winner-column-cell">72%</td>
                    <td>68%</td>
                  </tr>
                  <tr>
                    <td>Takedown Accuracy</td>
                    <td class="winner-column-cell">85%</td>
                    <td>78%</td>
                  </tr>
                  <tr>
                    <td>Takedown Defense</td>
                    <td class="winner-column-cell">88%</td>
                    <td>82%</td>
                  </tr>
                  <tr>
                    <td>Strikes Avoided/Min</td>
                    <td class="winner-column-cell">2.1/min</td>
                    <td>2.5/min</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div id="mock-ai-prediction" class="mock-element ai-highlight">
              <p><strong>AI Prediction:</strong> Fighter A to win</p>
              <p><strong>Explanation:</strong> Fighter A has superior win record and experience advantage with better striking accuracy.</p>
            </div>
            <div id="mock-initial-wager" class="mock-element wager-slider-container">
              <label>Initial Bet (0-4): <span>2</span></label>
              <input type="range" min="0" max="4" value="2" disabled />
              <button disabled>Confirm Initial Bet</button>
            </div>
          </div>
        </div>
      `;
    }
  
    function createSoloFinalScreen() {
      document.getElementById("onboarding-title").textContent =
        "Solo Mode - Final Bet Phase";
      document.getElementById("onboarding-content").innerHTML = `
        <div class="onboarding-preview">
          <div id="mock-final-screen" class="mock-screen">
            <div id="mock-final-wallet" class="mock-element">
              <p><strong>💰 Wallet: $100</strong></p>
            </div>
            <div class="mock-element">
              <table class="fighter-table mock-table">
                <thead>
                  <tr>
                    <th>Stat</th>
                    <th class="winner-column">Fighter A</th>
                    <th>Fighter B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="rationale-row">
                    <td>Career Wins</td>
                    <td class="winner-column-cell">15</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>Career Losses</td>
                    <td class="winner-column-cell">3</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Age</td>
                    <td class="winner-column-cell">28 yrs</td>
                    <td>31 yrs</td>
                  </tr>
                  <tr>
                    <td>Height</td>
                    <td class="winner-column-cell">6'2"</td>
                    <td>6'0"</td>
                  </tr>
                  <tr>
                    <td>Strikes Landed/Min</td>
                    <td class="winner-column-cell">4.2/min</td>
                    <td>3.8/min</td>
                  </tr>
                  <tr>
                    <td>Strike Accuracy</td>
                    <td class="winner-column-cell">65%</td>
                    <td>58%</td>
                  </tr>
                  <tr>
                    <td>Strike Defense</td>
                    <td class="winner-column-cell">72%</td>
                    <td>68%</td>
                  </tr>
                  <tr>
                    <td>Takedown Accuracy</td>
                    <td class="winner-column-cell">85%</td>
                    <td>78%</td>
                  </tr>
                  <tr>
                    <td>Takedown Defense</td>
                    <td class="winner-column-cell">88%</td>
                    <td>82%</td>
                  </tr>
                  <tr>
                    <td>Strikes Avoided/Min</td>
                    <td class="winner-column-cell">2.1/min</td>
                    <td>2.5/min</td>
                  </tr>
                </tbody>
              </table>
              <div class="ai-highlight">
                <p><strong>AI Prediction:</strong> Fighter A to win</p>
                <p><strong>Explanation:</strong> Same information and AI prediction as before...</p>
              </div>
            </div>
            <div id="mock-final-wager" class="mock-element wager-slider-container">
              <label>Final Bet (0-4): <span>2</span></label>
              <input type="range" min="0" max="4" value="2" disabled />
              <button disabled>Confirm Final Bet</button>
            </div>
          </div>
        </div>
      `;
    }
  
    function createGroupInitialScreen() {
      document.getElementById("onboarding-title").textContent =
        "Group Mode - Initial Bet Phase";
      document.getElementById("onboarding-content").innerHTML = `
        <div class="onboarding-preview">
          <div id="mock-group-initial" class="mock-screen">
            <div id="mock-group-wallet" class="mock-element">
              <p><strong>💰 Wallet: $100</strong></p>
            </div>
            <div id="mock-group-fighter-table" class="mock-element">
              <table class="fighter-table mock-table">
                <thead>
                  <tr>
                    <th>Stat</th>
                    <th class="winner-column">Fighter A</th>
                    <th>Fighter B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="rationale-row">
                    <td>Career Wins</td>
                    <td class="winner-column-cell">15</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>Career Losses</td>
                    <td class="winner-column-cell">3</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Age</td>
                    <td class="winner-column-cell">28 yrs</td>
                    <td>31 yrs</td>
                  </tr>
                  <tr>
                    <td>Height</td>
                    <td class="winner-column-cell">6'2"</td>
                    <td>6'0"</td>
                  </tr>
                  <tr>
                    <td>Strikes Landed/Min</td>
                    <td class="winner-column-cell">4.2/min</td>
                    <td>3.8/min</td>
                  </tr>
                  <tr>
                    <td>Strike Accuracy</td>
                    <td class="winner-column-cell">65%</td>
                    <td>58%</td>
                  </tr>
                  <tr>
                    <td>Strike Defense</td>
                    <td class="winner-column-cell">72%</td>
                    <td>68%</td>
                  </tr>
                  <tr>
                    <td>Takedown Accuracy</td>
                    <td class="winner-column-cell">85%</td>
                    <td>78%</td>
                  </tr>
                  <tr>
                    <td>Takedown Defense</td>
                    <td class="winner-column-cell">88%</td>
                    <td>82%</td>
                  </tr>
                  <tr>
                    <td>Strikes Avoided/Min</td>
                    <td class="winner-column-cell">2.1/min</td>
                    <td>2.5/min</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div id="mock-group-ai" class="mock-element ai-highlight">
              <p><strong>AI Prediction:</strong> Fighter A to win</p>
              <p><strong>Explanation:</strong> Fighter A has superior win record and striking accuracy.</p>
            </div>
            <div id="mock-group-wager" class="mock-element">
              <label>Your Bet (0-4): <span>2</span></label>
              <input type="range" min="0" max="4" value="2" disabled />
              <button disabled>Confirm Bet</button>
            </div>
          </div>
        </div>
      `;
    }
  
    function createGroupChatScreen() {
      document.getElementById("onboarding-title").textContent =
        "Group Mode - Group Bets & Chat Phase";
      document.getElementById("onboarding-content").innerHTML = `
          <div class="onboarding-preview">
            <div id="mock-group-wagers" class="mock-screen">
              <div id="mock-wagers-display" class="mock-element confirmed-wagers-display">
                <h4 class="wagers-title">Initial Bets</h4>
                <div class="wagers-container">
                  <div class="wager-column my-wager">
                    <div class="wager-participant-id">You 🤹‍♂️</div>
                    <div class="wager-value">2</div>
                  </div>
                  <div class="wager-column">
                    <div class="wager-participant-id">Player 2 🤹‍♂️</div>
                    <div class="wager-value">3</div>
                  </div>
                  <div class="wager-column">
                    <div class="wager-participant-id">Player 3 🤹‍♂️</div>
                    <div class="wager-value">1</div>
                  </div>
                </div>
              </div>
              <div id="mock-chat" class="mock-element">
                <h4>Group Chat</h4>
                <div class="chat-container">
                  <div class="chat-message">
                    <span class="user-name">Player 2 🤹‍♂️:</span>
                    <span class="message-text">I think Fighter A's experience is key</span>
                  </div>
                  <div class="chat-message">
                    <span class="user-name">Player 3 🤹‍♂️:</span>
                    <span class="message-text">But Fighter B is younger and faster</span>
                  </div>
                </div>
                <div class="chat-input">
                  <input type="text" placeholder="Type your opinion..." disabled />
                  <button disabled>Send</button>
                </div>
              </div>
            </div>
          </div>
        `;
    }
  
    function createGroupFinalScreen() {
      document.getElementById("onboarding-title").textContent =
        "Group Mode - Final Bet Phase";
      document.getElementById("onboarding-content").innerHTML = `
        <div class="onboarding-preview">
          <div id="mock-group-final" class="mock-screen">
            <div class="mock-element">
              <p><strong>💰 Wallet: $100</strong></p>
            </div>
            <div class="mock-element">
              <table class="fighter-table mock-table">
                <thead>
                  <tr>
                    <th>Stat</th>
                    <th class="winner-column">Fighter A</th>
                    <th>Fighter B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="rationale-row">
                    <td>Career Wins</td>
                    <td class="winner-column-cell">15</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>Career Losses</td>
                    <td class="winner-column-cell">3</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Age</td>
                    <td class="winner-column-cell">28 yrs</td>
                    <td>31 yrs</td>
                  </tr>
                  <tr>
                    <td>Height</td>
                    <td class="winner-column-cell">6'2"</td>
                    <td>6'0"</td>
                  </tr>
                  <tr>
                    <td>Strikes Landed/Min</td>
                    <td class="winner-column-cell">4.2/min</td>
                    <td>3.8/min</td>
                  </tr>
                  <tr>
                    <td>Strike Accuracy</td>
                    <td class="winner-column-cell">65%</td>
                    <td>58%</td>
                  </tr>
                  <tr>
                    <td>Strike Defense</td>
                    <td class="winner-column-cell">72%</td>
                    <td>68%</td>
                  </tr>
                  <tr>
                    <td>Takedown Accuracy</td>
                    <td class="winner-column-cell">85%</td>
                    <td>78%</td>
                  </tr>
                  <tr>
                    <td>Takedown Defense</td>
                    <td class="winner-column-cell">88%</td>
                    <td>82%</td>
                  </tr>
                  <tr>
                    <td>Strikes Avoided/Min</td>
                    <td class="winner-column-cell">2.1/min</td>
                    <td>2.5/min</td>
                  </tr>
                </tbody>
              </table>
              <div class="ai-highlight">
                <p><strong>AI Prediction:</strong> Fighter A to win</p>
                <p><strong>Explanation:</strong> Same AI prediction and explanation as discussed in chat...</p>
              </div>
            </div>
            <div id="mock-group-final-wager" class="mock-element wager-slider-container">
              <label>Final Bet (0-4): <span>2</span></label>
              <input type="range" min="0" max="4" value="2" disabled />
              <button disabled>Confirm Final Bet</button>
            </div>
          </div>
        </div>
      `;
    }
  
    function startIntroTour(steps, onComplete) {
      const intro = introJs();
      intro.setOptions({
        steps: steps,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        exitOnEsc: false,
        showSkipButton: false,
        showStepNumbers: false,
        disableInteraction: true,
        nextLabel: "Next →",
        prevLabel: "← Previous",
        doneLabel: "Continue →",
        autoRefresh: true,
        scrollToElement: true,
        tooltipPosition: "auto",
        showTitle: true,
      });
  
      let currentStep = 0;
      let autoAdvanceTimer = null;
  
      const autoAdvance = () => {
        autoAdvanceTimer = setTimeout(() => {
          if (currentStep < steps.length - 1) {
            intro.nextStep();
          } else {
            intro.exit();
          }
        }, ONBOARDING_CONFIG.itemDuration * 1000);
      };
  
      intro.onchange(function (targetElement) {
        if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
        currentStep = intro._currentStep;
  
        setTimeout(() => {
          const nextBtn = document.querySelector(".introjs-nextbutton");
          const prevBtn = document.querySelector(".introjs-prevbutton");
          const doneBtn = document.querySelector(".introjs-donebutton");
  
          if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.style.opacity = "0.5";
            nextBtn.style.cursor = "not-allowed";
          }
          if (prevBtn) {
            prevBtn.disabled = true;
            prevBtn.style.opacity = "0.5";
            prevBtn.style.cursor = "not-allowed";
          }
          if (doneBtn) {
            doneBtn.disabled = true;
            doneBtn.style.opacity = "0.5";
            doneBtn.style.cursor = "not-allowed";
          }
        }, 10);
  
        autoAdvance();
      });
  
      intro.onstart(function () {
        setTimeout(() => {
          const nextBtn = document.querySelector(".introjs-nextbutton");
          const prevBtn = document.querySelector(".introjs-prevbutton");
  
          if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.style.opacity = "0.5";
            nextBtn.style.cursor = "not-allowed";
          }
          if (prevBtn) {
            prevBtn.disabled = true;
            prevBtn.style.opacity = "0.5";
            prevBtn.style.cursor = "not-allowed";
          }
        }, 10);
  
        autoAdvance();
      });
  
      intro.onexit(function () {
        if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
        if (onComplete) onComplete();
      });
  
      intro.start();
    }
  
    function getSoloInitialSteps() {
      return [
        {
          element: "#mock-wallet",
          title: "Wallet Balance",
          intro:
            "You'll find your current virtual funds at the top left. This is your bankroll, every bet you place subtracts from this total, so pace yourself across all trials.",
          position: "bottom",
        },
        {
          element: "#mock-fighter-table",
          title: "Fighter Statistics & AI Pick",
          intro:
            "Below, compare Fighter A vs. Fighter B on ten key stats.<br><br>" +
            "• <strong>The shaded column</strong> marks the AI's predicted winner.<br>" +
            "• <strong>The highlighted row</strong> shows which stat the AI weighed most heavily.",
          position: "top",
        },
        {
          element: "#mock-initial-wager",
          title: "Place Your Initial Bet",
          intro:
            "Use the slider (0–4) to set your confidence level, then click 'Confirm Initial Bet' to lock in your wager.",
          position: "top",
        },
      ];
    }
  
    function getSoloFinalSteps() {
      return [
        {
          element: "#mock-final-wager",
          title: "Adjust & Confirm Your Final Bet",
          intro:
            "Now that you've seen the bout, review your initial choice. Slide to adjust your confidence if you wish, then click 'Confirm Final Bet' to finalize your wager for this round.",
          position: "top",
        },
      ];
    }
  
    function getGroupInitialSteps() {
      return [
        {
          element: "#mock-group-wallet",
          title: "Wallet Balance",
          intro:
            "Your personal wallet appears here. Manage these funds for your individual wagers in this group session.",
          position: "bottom",
        },
        {
          element: "#mock-group-fighter-table",
          title: "Fighter Statistics & AI Pick",
          intro:
            "Compare Fighter A vs. Fighter B on the same ten stats.<br><br>" +
            "• <strong>Shaded column</strong> = AI's predicted winner.<br>" +
            "• <strong>Highlighted row</strong> = the key stat driving the AI's choice.",
          position: "top",
        },
        {
          element: "#mock-group-wager",
          title: "Place Your Initial Bet",
          intro:
            "Slide (0–4) to set your private wager and click 'Confirm Initial Bet'. No one sees your choice until everyone has submitted.",
          position: "top",
        },
      ];
    }
  
    function getGroupChatSteps() {
      return [
        {
          element: "#mock-wagers-display",
          title: "Review Group Wagers",
          intro:
            "Once everyone has bet, all initial wagers appear side-by-side. See how your peers are voting before you decide.",
          position: "top",
        },
        {
          element: "#mock-chat",
          title: "Collaborative Discussion",
          intro:
            "Use the chat panel to debate fighter strengths, question the AI's pick, and share insights. This is your chance to influence the final outcome.",
          position: "top",
        },
      ];
    }
  
    function getGroupFinalSteps() {
      return [
        {
          element: "#mock-group-final-wager",
          title: "Adjust & Confirm Your Final Bet",
          intro:
            "After discussion, revisit your slider to adjust your confidence. Click 'Confirm Final Bet' to submit your final decision for this round.",
          position: "top",
        },
      ];
    }
  
    function completeOnboarding() {
      if (onboardingCountdownInterval) {
        clearInterval(onboardingCountdownInterval);
      }
      stopKeepAlive();
      showTransitionScreen();
    }
  
    function showTransitionScreen() {
      document.getElementById("onboarding-title").textContent =
        "Onboarding Complete";
      document.getElementById("onboarding-content").innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h3 style="color: #00ff00; margin-bottom: 20px;">✓ Onboarding Completed Successfully!</h3>
        <p style="font-size: 1.1em; margin-bottom: 30px;">
          Great! You're now ready to start the ${
            currentMode === "solo" ? "Solo" : "Group"
          } trials.
        </p>
        <div id="transition-countdown" style="font-size: 1.3em; color: #ffcc00; font-weight: bold;">
          Starting trials in <span id="countdown-timer">5</span> seconds...
        </div>
        <div style="margin-top: 20px; color: #aaa;">
          <p>The first trial will begin automatically.</p>
        </div>
      </div>
    `;
  
      document.getElementById("onboarding-countdown-display").style.display =
        "none";
  
      let remaining = 5;
      const countdownEl = document.getElementById("countdown-timer");
  
      const countdownInterval = setInterval(() => {
        remaining--;
        if (countdownEl) {
          countdownEl.textContent = remaining;
        }
  
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          onboardingInProgress = false;
          onboardingScreen.style.display = "none";
        }
      }, 1000);
  
      document.getElementById("onboarding-sync-status").style.display = "none";
    }
  
    function hideAllScreens() {
      document.querySelectorAll(".screen").forEach((screen) => {
        screen.style.display = "none";
      });
    }
  
    function handleOnboardingMessage(data) {
      if (data.type === "startOnboarding") {
        showOnboardingFlow(data.mode);
      }
    }
  
    return {
      init,
      startOnboarding,
      showOnboardingFlow,
      handleOnboardingMessage,
      completeOnboarding,
      isOnboardingInProgress: () => onboardingInProgress,
      ONBOARDING_CONFIG,
    };
  })();