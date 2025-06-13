const postTask = (function () {
  let appContainer;
  let postTaskScreen;
  let ws;
  let countdownInterval;
  let allSlidersUpdated = false;

  function init(webSocketInstance) {
    appContainer = document.getElementById("app-container");
    ws = webSocketInstance;

    postTaskScreen = document.createElement("div");
    postTaskScreen.classList.add("screen");
    postTaskScreen.innerHTML = `
      <h2>Post-Task Survey</h2>
      <p>Thank you for participating in the UFC Prediction Experiment!</p><br/>
      <p id="final-wallet">Total Winnings: $0</p><br/>
  
      <p>Now that you've completed the task, please rate how important you believe each of the following fighter stats actually is in predicting UFC fight outcomes.</p><br/>
      <p>Use the sliders to assign values between 1 (Not important at all) and 100 (Extremely important).</p><br/>
      <p>Base your ratings on what you've learned or noticed during the task.</p><br/>
  
      <div class="feature-sliders">
        <div class="slider-group">
          <label>Career Wins (Total number of fights the fighter has won)</label>
          <input type="range" id="post-slider-wins" min="1" max="100" value="0" />
          <span class="slider-value">0</span>
        </div>
  
        <div class="slider-group">
          <label>Career Losses (Total number of fights the fighter has lost)</label>
          <input type="range" id="post-slider-losses" min="1" max="100" value="0" />
          <span class="slider-value">0</span>
        </div>
  
        <div class="slider-group">
          <label>Age (The fighter's current age in years)</label>
          <input type="range" id="post-slider-age" min="1" max="100" value="0" />
          <span class="slider-value">0</span>
        </div>
  
        <div class="slider-group">
          <label>Height (The fighter's height, which can affect reach and leverage)</label>
          <input type="range" id="post-slider-height" min="1" max="100" value="0" />
          <span class="slider-value">0</span>
        </div>
  
        <div class="slider-group">
          <label>Strikes Landed/Minute (Average number of strikes the fighter lands per minute)</label>
          <input type="range" id="post-slider-slpm" min="1" max="100" value="0" />
          <span class="slider-value">0</span>
        </div>
  
        <div class="slider-group">
          <label>Strike Accuracy (Percentage of strikes that land successfully)</label>
          <input type="range" id="post-slider-accuracy" min="1" max="100" value="0" />
          <span class="slider-value">0</span>
        </div>
  
        <div class="slider-group">
          <label>Strike Defense (Percentage of opponent strikes the fighter avoids)</label>
          <input type="range" id="post-slider-defense" min="1" max="100" value="0" />
          <span class="slider-value">0</span>
        </div>
  
        <div class="slider-group">
          <label>Takedown Defense (Percentage of opponent takedown attempts successfully defended)</label>
          <input type="range" id="post-slider-td-defense" min="1" max="100" value="0" />
          <span class="slider-value">0</span>
        </div>
  
        <div class="slider-group">
          <label>Strikes Avoided/Minute (Average number of strikes the fighter avoids per minute)</label>
          <input type="range" id="post-slider-sapm" min="1" max="100" value="0" />
          <span class="slider-value">0</span>
        </div>
  
        <div class="slider-group">
          <label>Takedown Accuracy (Percentage of takedown attempts that are successful)</label>
          <input type="range" id="post-slider-td-accuracy" min="1" max="100" value="0" />
          <span class="slider-value">0</span>
        </div>
      </div>

      <div id="posttask-validation-error" style="display: none; color: #ff4444; text-align: center; margin: 20px 0; font-weight: bold; animation: shake 0.5s ease-in-out infinite;">
        ⚠️ Please review and adjust all sliders above before completing!
      </div>
  
      <button id="btn-finish" disabled style="opacity: 0.5;">Finish</button>
      <div id="posttask-countdown" style="margin-top: 10px;"></div>
      <div id="thank-you-message" style="display: none; text-align: center; margin-top: 20px;">
        <h2>Thank you for your participation!</h2>
        <button id="btn-home">Go to Prolific</button>
      </div>
    `;

    appContainer.appendChild(postTaskScreen);

    const sliderStates = new Map();

    postTaskScreen.querySelectorAll('input[type="range"]').forEach((slider) => {
      const valueDisplay = slider.nextElementSibling;
      sliderStates.set(slider.id, false);

      slider.addEventListener("input", () => {
        valueDisplay.textContent = slider.value;
        sliderStates.set(slider.id, true);
        validateSliders();
      });
    });

    function validateSliders() {
      const allMoved = Array.from(sliderStates.values()).every(
        (moved) => moved
      );
      const finishButton = postTaskScreen.querySelector("#btn-finish");
      const errorMessage = postTaskScreen.querySelector(
        "#posttask-validation-error"
      );

      allSlidersUpdated = allMoved;

      if (allMoved) {
        finishButton.disabled = false;
        finishButton.style.opacity = "1";
        errorMessage.style.display = "none";
      } else {
        finishButton.disabled = true;
        finishButton.style.opacity = "0.5";
        errorMessage.style.display = "block";
      }
    }

    postTaskScreen
      .querySelector("#btn-finish")
      .addEventListener("click", onFinish);
  }

  function showPostTaskScreen() {
    hideAllScreens();
    postTaskScreen.style.display = "block";
    const finalWallet = utilities.getWallet();
    document.getElementById(
      "final-wallet"
    ).textContent = `Total Winnings: $${finalWallet}`;

    const countdownEl = document.getElementById("posttask-countdown");
    let remainTime = 60;
    countdownEl.textContent = `Session ending in ${remainTime} seconds`;

    countdownInterval = setInterval(() => {
      remainTime--;
      countdownEl.textContent = `Session ending in ${remainTime} seconds`;

      if (remainTime <= 0) {
        clearInterval(countdownInterval);

        if (allSlidersUpdated) {
          finishPostTask();
        } else {
          const errorMessage = postTaskScreen.querySelector(
            "#posttask-validation-error"
          );
          const finishButton = postTaskScreen.querySelector("#btn-finish");

          countdownEl.textContent =
            "⏰ Time's up! Please complete all sliders to finish.";
          countdownEl.style.color = "#ff4444";

          errorMessage.style.display = "block";
          errorMessage.innerHTML =
            "⚠️ Please review and adjust all sliders above before completing!";

          errorMessage.style.animation = "shake 0.3s ease-in-out infinite";

          finishButton.style.animation = "pulse 1s ease-in-out infinite";
        }
      }
    }, 1000);
  }

  function onFinish() {
    if (!allSlidersUpdated) {
      const errorMessage = postTaskScreen.querySelector(
        "#posttask-validation-error"
      );
      errorMessage.style.display = "block";
      errorMessage.style.animation = "shake 0.3s ease-in-out infinite";
      return;
    }

    const finishBtn = postTaskScreen.querySelector("#btn-finish");
    finishBtn.disabled = true;

    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    let waitingMsg = postTaskScreen.querySelector(".waiting-message");
    if (!waitingMsg) {
      waitingMsg = document.createElement("p");
      waitingMsg.className = "waiting-message";
      waitingMsg.innerHTML = "<strong>Waiting for session to end...</strong>";
      postTaskScreen.appendChild(waitingMsg);
    }
    finishPostTask();
  }

  function hideAllScreens() {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.style.display = "none";
    });
  }

  function finishPostTask() {
    const postTaskData = {
      clientID: sessionStorage.getItem("PROLIFIC_PID"),
      finalWallet: utilities.getWallet(),
      timestamp: new Date().toISOString(),
      wins: parseInt(postTaskScreen.querySelector("#post-slider-wins").value),
      losses: parseInt(
        postTaskScreen.querySelector("#post-slider-losses").value
      ),
      age: parseInt(postTaskScreen.querySelector("#post-slider-age").value),
      height: parseInt(
        postTaskScreen.querySelector("#post-slider-height").value
      ),
      slpm: parseInt(postTaskScreen.querySelector("#post-slider-slpm").value),
      accuracy: parseInt(
        postTaskScreen.querySelector("#post-slider-accuracy").value
      ),
      defense: parseInt(
        postTaskScreen.querySelector("#post-slider-defense").value
      ),
      tdDefense: parseInt(
        postTaskScreen.querySelector("#post-slider-td-defense").value
      ),
      sapm: parseInt(postTaskScreen.querySelector("#post-slider-sapm").value),
      tdAccuracy: parseInt(
        postTaskScreen.querySelector("#post-slider-td-accuracy").value
      ),
    };
    utilities.savePostTaskData(postTaskData);

    // Send the finish session payload
    ws.send(
      JSON.stringify({
        type: "sendData",
        payload: {
          event: "finishSession",
          data: { clientID: sessionStorage.getItem("PROLIFIC_PID") },
        },
      })
    );

    // Remove the finish button and waiting message
    const finishBtn = postTaskScreen.querySelector("#btn-finish");
    if (finishBtn) {
      finishBtn.remove();
    }
    const waitingMsg = postTaskScreen.querySelector(".waiting-message");
    if (waitingMsg) {
      waitingMsg.remove();
    }

    // Hide the countdown element
    const countdownEl = document.getElementById("posttask-countdown");
    if (countdownEl) {
      countdownEl.style.display = "none";
    }

    // Alert that the session has ended
    alert("Session ended");

    // Then display the thank-you message with the "Go to Home" button
    const thankYouDiv = document.getElementById("thank-you-message");
    thankYouDiv.style.display = "block";
    thankYouDiv.querySelector("#btn-home").addEventListener("click", () => {
      //window.location.reload();
      window.location.href = "https://app.prolific.com/submissions/complete?cc=C17HKXVH";
    });
  }

  return {
    init,
    showPostTaskScreen,
  };
})();