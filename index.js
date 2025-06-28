let monsterHP = parseInt(localStorage.getItem("monsterHP"));
if (isNaN(monsterHP)) monsterHP = 100;

let playerXP = parseInt(localStorage.getItem("playerXP"));
if (isNaN(playerXP)) playerXP = 0;

let distractions = parseInt(localStorage.getItem("distractions"));
if (isNaN(distractions)) distractions = 0;

let isHyperfocus = false;
let hyperfocusInterval;

const hyperfocusBtn = document.getElementById("hyperfocusBtn");
const hyperfocusTimer = document.getElementById("hyperfocusTimer");
const timerCountdown = document.getElementById("timerCountdown");
const progressBar = document.getElementById("progressBar");
const rewardScreen = document.getElementById("rewardScreen");

const attackSound = new Audio("Sounds_forfm/attack.mp3");
const distractSound = new Audio("Sounds_forfm/distract.mp3");
const hyperfocusStartSound = new Audio("Sounds_forfm/focus_start.mp3");
const hyperfocusEndSound = new Audio("Sounds_forfm/focus_end.mp3");

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");

const monsterHPDisplay = document.getElementById("monsterHP");
const playerXPDisplay = document.getElementById("playerXP");
const distractionDisplay = document.getElementById("distractions");
const monsterImg = document.getElementById("monsterImage");

// Create and style Exit Hyperfocus Button
const exitHyperfocusBtn = document.createElement("button");
exitHyperfocusBtn.id = "exitHyperfocusBtn";
exitHyperfocusBtn.textContent = "Exit Hyperfocus";
Object.assign(exitHyperfocusBtn.style, {
  position: "fixed",
  bottom: "20px",
  left: "20px",
  padding: "10px 15px",
  fontSize: "14px",
  backgroundColor: "#ff5555",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  display: "none", // hidden initially
  userSelect: "none",
  boxShadow: "0 3px 7px rgba(255, 85, 85, 0.7)"
});
document.body.appendChild(exitHyperfocusBtn);

exitHyperfocusBtn.addEventListener("click", () => {
  if (isHyperfocus) {
    clearInterval(hyperfocusInterval);
    hyperfocusInterval = null;
    endHyperfocusMode();
  }
});

function playAnimation(animationName, animationDuration) {
  const idleSrc = "images_forfm/Idle.png";
  const animationSrc = "images_forfm/" + animationName.replace(/\s/g, "") + ".png";
  monsterImg.src = animationSrc;
  setTimeout(() => {
    monsterImg.src = idleSrc;
  }, animationDuration);
}

function saveTasks() {
  const tasks = [];
  taskList.querySelectorAll("li").forEach(li => {
    const text = li.querySelector(".task-text")?.textContent.trim() || li.firstChild.textContent.trim();
    tasks.push(text);
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

addTaskBtn.addEventListener("click", () => {
  let taskText = taskInput.value.trim();
  taskText = taskText.charAt(0).toUpperCase() + taskText.slice(1);
  if (taskText !== "") {
    const li = document.createElement("li");

    // Wrap text in span for truncation
    const taskSpan = document.createElement("span");
    taskSpan.className = "task-text";
    taskSpan.textContent = taskText;
    li.appendChild(taskSpan);

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✔️ Complete";
    doneBtn.className = "done-btn";
    doneBtn.onclick = () => {
      let xpGain = isHyperfocus ? 20 : 10;
      let damage = isHyperfocus ? 20 : 10;
      playerXP += xpGain;
      monsterHP -= damage;
      updateStats();
      attackSound.currentTime = 0;
      attackSound.play();
      playAnimation("TakeHit", 1000);
      li.remove();
      saveTasks();
      checkVictory();
    };

    const distractBtn = document.createElement("button");
    distractBtn.textContent = "😵 Distracted";
    distractBtn.className = "distracted-btn";
    distractBtn.onclick = () => {
      distractSound.currentTime = 0;
      distractSound.play();

      if (isHyperfocus) {
        clearInterval(hyperfocusInterval);
        hyperfocusInterval = null;
        endHyperfocusMode();
      }

      distractions += 1;
      monsterHP += 5;
      playerXP -= 5;
      updateStats();
      playAnimation("Attack", 800);
      li.remove();
      saveTasks();
    };

    li.appendChild(doneBtn);
    li.appendChild(distractBtn);

    taskList.appendChild(li);
    taskInput.value = "";
    saveTasks();
  }
});

function updateStats() {
  monsterHPDisplay.textContent = monsterHP;
  playerXPDisplay.textContent = playerXP;
  distractionDisplay.textContent = distractions;
  localStorage.setItem("monsterHP", monsterHP);
  localStorage.setItem("playerXP", playerXP);
  localStorage.setItem("distractions", distractions);
}

function checkVictory() {
  if (monsterHP <= 0) {
    alert("🎉 Congratulations, You have defeated the Distraction Monster! 🎉");
    resetGame();
  }
}

function resetGame() {
  monsterHP = 100;
  playerXP = 0;
  distractions = 0;
  taskList.innerHTML = "";
  updateStats();

  // Exit Hyperfocus mode fully
  isHyperfocus = false;

  if (hyperfocusInterval) {
    clearInterval(hyperfocusInterval);
    hyperfocusInterval = null;
  }

  // Reset Hyperfocus UI
  hyperfocusTimer.style.display = "none";
  hyperfocusBtn.disabled = false;
  timerCountdown.textContent = "05:00";
  progressBar.style.width = "0%";
  document.body.classList.remove("hyperfocus-active");
  monsterImg.classList.remove("hyperfocus-glow");

  // Hide reward screen if visible
  rewardScreen.style.display = "none";

  // Hide exit button
  exitHyperfocusBtn.style.display = "none";

  // Clear Hyperfocus end time from storage
  localStorage.removeItem("hyperfocusEndTime");
}

function startHyperfocusModeWithTime(timeLeft) {
  isHyperfocus = true;
  hyperfocusBtn.disabled = true;
  hyperfocusTimer.style.display = "block";
  exitHyperfocusBtn.style.display = "block"; // show exit button
  document.body.classList.add("hyperfocus-active");
  monsterImg.classList.add("hyperfocus-glow");
  hyperfocusStartSound.play();

  const totalTime = timeLeft;
  localStorage.setItem("hyperfocusEndTime", Date.now() + timeLeft * 1000);

  hyperfocusInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerCountdown.textContent = `${minutes}:${seconds}`;
    progressBar.style.width = `${((totalTime - timeLeft) / totalTime) * 100}%`;

    if (timeLeft <= 0) {
      clearInterval(hyperfocusInterval);
      hyperfocusInterval = null;
      endHyperfocusMode();
    }

    timeLeft--;
  }, 1000);
}

function endHyperfocusMode() {
  isHyperfocus = false;
  hyperfocusBtn.disabled = false;
  hyperfocusTimer.style.display = "none";
  exitHyperfocusBtn.style.display = "none"; // hide exit button
  document.body.classList.remove("hyperfocus-active");
  monsterImg.classList.remove("hyperfocus-glow");
  hyperfocusEndSound.play();
  localStorage.removeItem("hyperfocusEndTime");

  // Show reward screen
  rewardScreen.style.display = "block";
  setTimeout(() => {
    rewardScreen.style.display = "none";
  }, 3000);
}

function startHyperfocusMode() {
  startHyperfocusModeWithTime(5 * 60); // 5 minutes
}

hyperfocusBtn.addEventListener("click", startHyperfocusMode);

// Restore Hyperfocus if active on page load, or reset if expired
const savedEndTime = parseInt(localStorage.getItem("hyperfocusEndTime"));
if (savedEndTime && savedEndTime > Date.now()) {
  const timeLeft = Math.floor((savedEndTime - Date.now()) / 1000);
  startHyperfocusModeWithTime(timeLeft);
} else {
  // If expired or no saved hyperfocus, clean state on load
  resetGame();
}

updateStats();


