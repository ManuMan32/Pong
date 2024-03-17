"use strict";
// Script for Pong game of Retro Collection
// Made by Manuel Crocco

// ---- Variables ----

// Enums
const BALL_DIRECTIONS = {
  TOP_RIGHT: 0,
  TOP_LEFT: 1,
  BOTTOM_LEFT: 2,
  BOTTOM_RIGHT: 3
}
const THEMES = {
  BLACK: "B",
  WHITE: "W",
  GREEN: "G",
  RED: "R",
  BLUE: "BL"
}

// References
const root = document.documentElement;
const ball = document.querySelector(".ball");
const player1 = document.querySelector(".player1");
const player2 = document.querySelector(".player2");
const collisionGoal1 = document.querySelector(".collision-goal1");
const collisionGoal2 = document.querySelector(".collision-goal2");
const countdownElement = document.querySelector(".countdown");
const countdownSpan = document.querySelector(".countdown-number");
const squareSize = 30;
const playerWidth = squareSize * 3;
let clock;
// Values/Positions
let blockedBall = true;
let ballDirection = BALL_DIRECTIONS.TOP_LEFT;
let ballSpeed = 4;
let ballPos = [150, -150];
let playerSpeed = 6.5;
let pointsPlayer1 = 0;
let pointsPlayer2 = 0;
let time = 5;
const playerPositions = {
  'p1pos': 0,
  'p2pos': 0
}
let countdownNumber = 4;
let screenWidth, screenHeight;
window.addEventListener("resize", setDimensions);
setDimensions();
function setDimensions() {
  screenWidth = window.innerWidth;
  if (screenWidth > 900) screenWidth = 900;
  screenHeight = window.innerHeight;
  if (screenHeight > 900) screenHeight = 900;
}
let records = [];
let gamesPlayed = 0;
// Options variables
let options = {
  'gameTime': 4,
  'initialBallSpeed': 4,
  'theme': THEMES.BLACK,
  'saveRecords': false
}
const optionsArray = [
  ["Time per game", "gameTime", [2, 3, 4, 6, 8]],
  ["Ball Speed", "initialBallSpeed", [3, 4, 5]],
  ["Theme", "theme", [...Object.values(THEMES)]],
  ["Save Records", "saveRecords", [true, false]]
]

// ---- CONTROLS ----
let pressedKeys = {};
// Key Actions for desktop
document.addEventListener("keydown", e => {
  if (pressedKeys[e.key] == undefined) {
    switch (e.key) {
      case "ArrowLeft": movePlayer('p1pos', -(playerSpeed)); break;
      case "ArrowRight": movePlayer('p1pos', playerSpeed); break;
      case "a": movePlayer('p2pos', -(playerSpeed)); break;
      case "d": movePlayer('p2pos', playerSpeed); break;
    }
    pressedKeys[e.key] = true;
  }
});
document.addEventListener("keyup", (e) => {
  delete pressedKeys[e.key];
});

// ---- Button Actions ----

// ---- Functions ----

// Makes all the actions in a game frame
function gameFrame() {
  // Ball
  // Update position
  if (!blockedBall) {
    // Check collision with goals
    checkCollision(ball, [collisionGoal1, collisionGoal2], null, target => {
      if (target == collisionGoal1) pointsPlayer2++;
      else if (target == collisionGoal2) pointsPlayer1++;
      ballPos = [200, -200];
      blockedBall = true;
      countdown();
      refreshUI();
    });
    // Moves the ball
    moveBall();
    ball.style.left = `${ballPos[0]}px`;
    ball.style.top = `${ballPos[1]}px`;
  }
  // Checks collision with walls
  if (ballPos[0] < 0 || ballPos[0] > (screenWidth - squareSize)) {
    ballDirection = getInverseDirection("x");
  }
  // Checks collision with players
  checkCollision(ball, [player1, player2], null, () => {
    ballDirection = getInverseDirection("y");
    ballSpeed += 0.25;
  });
  // Players
  // Update position
  player1.style.left = `${playerPositions.p1pos}px`;
  player2.style.left = `${playerPositions.p2pos}px`;
  // Continuous movement
  if ("ArrowLeft" in pressedKeys) movePlayer('p1pos', -(playerSpeed));
  if ("ArrowRight" in pressedKeys) movePlayer('p1pos', playerSpeed);
  if ("a" in pressedKeys) movePlayer('p2pos', -(playerSpeed));
  if ("d" in pressedKeys) movePlayer('p2pos', playerSpeed);
  // Next frame
  requestAnimationFrame(gameFrame);
}
requestAnimationFrame(gameFrame);

// Moves the player position
function movePlayer(reference, number) {
  playerPositions[reference] += number;
  if (playerPositions[reference] < 0) playerPositions[reference] = 0;
  if (playerPositions[reference] > (screenWidth - playerWidth)) playerPositions[reference] = (screenWidth - playerWidth);
}

// Moves the ball position depending on its direction
function moveBall() {
  let speedX = ballSpeed;
  let speedY = ballSpeed;
  switch (ballDirection) {
    case BALL_DIRECTIONS.BOTTOM_LEFT:
      speedX *= -1; break;
    case BALL_DIRECTIONS.TOP_RIGHT:
      speedY *= -1; break;
    case BALL_DIRECTIONS.TOP_LEFT:
      speedX *= -1; speedY *= -1; break;
  }
  ballPos[0] += speedX;
  ballPos[1] += speedY;
}

// Checks a collision between two objects
function checkCollision(obj1, obj2, interval, action) {
  const obj1Rect = obj1.getBoundingClientRect();
  const possibleTargets = [...obj2];
  let minDistanceTarget = Infinity;
  let obj2Rect = null;
  let obj2Targeted = null;
  if (possibleTargets.length == 0) clearInterval(interval);
  else {
    possibleTargets.forEach(target => {
      const checkRect = target.getBoundingClientRect();
      const distance = Math.sqrt((obj1Rect.left - checkRect.left) ** 2 + (obj1Rect.top - checkRect.top) ** 2);
      if (distance < minDistanceTarget) {
        minDistanceTarget = distance;
        obj2Rect = checkRect;
        obj2Targeted = target;
      }
    });
    if (
      obj1Rect.right > obj2Rect.left &&
      obj1Rect.left < obj2Rect.right &&
      obj1Rect.bottom > obj2Rect.top &&
      obj1Rect.top < obj2Rect.bottom
    ) {
      action(obj2Targeted);
      clearInterval(interval);
    }
  }
}

// Gets the inverse direction of the ball depending the axis
function getInverseDirection(axis) {
  switch (axis) {
    case "x": switch (ballDirection) {
      case BALL_DIRECTIONS.BOTTOM_LEFT: return BALL_DIRECTIONS.BOTTOM_RIGHT;
      case BALL_DIRECTIONS.BOTTOM_RIGHT: return BALL_DIRECTIONS.BOTTOM_LEFT;
      case BALL_DIRECTIONS.TOP_LEFT: return BALL_DIRECTIONS.TOP_RIGHT;
      case BALL_DIRECTIONS.TOP_RIGHT: return BALL_DIRECTIONS.TOP_LEFT;
    }
    case "y": switch (ballDirection) {
      case BALL_DIRECTIONS.BOTTOM_LEFT: return BALL_DIRECTIONS.TOP_LEFT;
      case BALL_DIRECTIONS.BOTTOM_RIGHT: return BALL_DIRECTIONS.TOP_RIGHT;
      case BALL_DIRECTIONS.TOP_LEFT: return BALL_DIRECTIONS.BOTTOM_LEFT;
      case BALL_DIRECTIONS.TOP_RIGHT: return BALL_DIRECTIONS.BOTTOM_RIGHT;
    }
    default: return null;
  }
}

// Restarts the ball position
function restartBall() {
  ballPos[0] = Math.floor(screenWidth / 2);
  ballPos[1] = Math.floor(screenHeight / 2);
  blockedBall = false;
  ballSpeed = options.initialBallSpeed;
  refreshUI();
}

// Refreshs the UI
function refreshUI() {
  const points1 = document.getElementById("points-p1");
  const points2 = document.getElementById("points-p2");
  points1.innerHTML = pointsPlayer1;
  points2.innerHTML = pointsPlayer2;
}

// Makes the countdown before restarting the ball
function countdown() {
  if (countdownNumber == 4) {
    countdownElement.classList.add("countdown-show");
    let arrowToShow;
    switch (ballDirection) {
      case BALL_DIRECTIONS.TOP_LEFT: default: arrowToShow = ".arrow-up-left"; break;
      case BALL_DIRECTIONS.TOP_RIGHT: arrowToShow = ".arrow-up-right"; break;
      case BALL_DIRECTIONS.BOTTOM_LEFT: arrowToShow = ".arrow-bottom-left"; break;
      case BALL_DIRECTIONS.BOTTOM_RIGHT: arrowToShow = ".arrow-bottom-right"; break;
    }
    arrowToShow = document.querySelector(arrowToShow);
    arrowToShow.classList.add("arrow-show");
  }
  countdownNumber--;
  countdownSpan.innerHTML = countdownNumber;
  if (countdownNumber <= 0) {
    restartBall();
    const arrows = document.querySelectorAll(".arrow");
    arrows.forEach(arrow => {
      arrow.classList.toggle("arrow-show", false);
    });
    if (clock == undefined) timer();
    countdownElement.classList.remove("countdown-show");
    countdownNumber = 4;
  } else {
    setTimeout(() => countdown(), 1000);
  }
}

// Creates the timer
function timer() {
  clock = setInterval(() => {
    if (time <= 0) {
      ballPos = [200, -200];
      ball.style.left = `${ballPos[0]}px`;
      ball.style.top = `${ballPos[1]}px`;
      blockedBall = true;
      clearInterval(clock);
      clock = undefined;
      countdownElement.classList.add("countdown-show");
      countdownSpan.innerHTML = "Time is out!!";
      setTimeout(() => {
        const resultsWindow = createElement("div", "title-screen");
        const resultsBox = createElement("div", "title-box");
        const result = createElement("div", "title", `${pointsPlayer1} - ${pointsPlayer2}`);
        const winner = createElement("div", "title", (pointsPlayer1 == pointsPlayer2) ? "It's a tie!"
          : "The winner is " + ((pointsPlayer1 > pointsPlayer2) ? "P1" : "P2") + "!");
        const goToTitleScreenButton = createElement("div", "title-button", "Go to Title Screen");
        goToTitleScreenButton.addEventListener("click", () => {
          const resultsTitleBox = document.querySelector(".title-box");
          resultsTitleBox.remove();
          createTitleScreen();
        })
        resultsBox.appendChild(result);
        resultsBox.appendChild(winner);
        resultsBox.appendChild(goToTitleScreenButton);
        resultsWindow.appendChild(resultsBox);
        document.querySelector(".screen").appendChild(resultsWindow);
        saveRecord();
        resetValues();
        refreshUI();
        updateClock();
      }, 1500);
    } else if (!blockedBall) {
      time--;
      updateClock();
    }
  }, 1000);
}
function updateClock() {
  let minutes, seconds;
  minutes = "0" + Math.floor(time / 60);
  seconds = (time - (minutes * 60));
  if (seconds < 10) seconds = "0" + seconds;
  const timerElement = document.getElementById("time");
  timerElement.innerHTML = `${minutes}:${seconds}`;
}

// Resets the game values
function resetValues() {
  pointsPlayer1 = 0;
  pointsPlayer2 = 0;
  time = options.gameTime * 60;
}

// Saves the current game to a record
function saveRecord() {
  gamesPlayed++;
  records.push([gamesPlayed, `${pointsPlayer1} : ${pointsPlayer2}`, ((pointsPlayer1 > pointsPlayer2) ? "P1" : "P2") + " won"]);
}

// Creates the title screen
function createTitleScreen() {
  const titleScreen = document.querySelector(".title-screen");
  const titleBox = createElement("div", "title-box");
  const title = createElement("div", "title", "Pong");
  const titleBoxButtons = createElement("div", "title-box-buttons");
  const buttonPlay = createElement("div", ["title-button", "title-button-play"], "Play");
  buttonPlay.addEventListener("click", () => {
    const title = document.querySelector(".title-screen");
    title.remove();
    countdown();
  });
  const buttonOptions = createElement("div", ["title-button", "title-button-options"], "Options");
  buttonOptions.addEventListener("click", () => {
    const titleOptions = document.querySelector(".title-box");
    titleOptions.remove();
    createOptionsMenu();
  });
  const buttonRecords = createElement("div", ["title-button", "title-button-records"], "Records")
  buttonRecords.addEventListener("click", () => {
    const titleOptions = document.querySelector(".title-box");
    titleOptions.remove();
    createRecordsMenu();
  });
  titleBoxButtons.appendChild(buttonPlay);
  titleBoxButtons.appendChild(buttonOptions);
  titleBoxButtons.appendChild(buttonRecords);
  const titleCredits = createElement("div", "title-credits");
  const titleCreditsSpan = createElement("span", undefined, "Game made by Manuel Crocco");
  titleCredits.appendChild(titleCreditsSpan);
  titleBox.appendChild(title);
  titleBox.appendChild(titleBoxButtons);
  titleBox.appendChild(titleCredits);
  titleScreen.appendChild(titleBox);
}
createTitleScreen();

// Creates the options menu
function createOptionsMenu() {
  const titleScreen = document.querySelector(".title-screen");
  const titleBox = createElement("div", "title-box");
  const xButton = createElement("div", "x-button", "<-");
  xButton.addEventListener("click", () => {
    const optionsTitleBox = document.querySelector(".title-box");
    optionsTitleBox.remove();
    createTitleScreen();
  });
  const title = createElement("div", "title", "Options");
  const optionsBox = createElement("div", "options-box");
  optionsArray.forEach((optionsSet, i) => {
    const opTitle = optionsSet[0];
    const opKey = optionsSet[1];
    const opOptions = optionsSet[2];
    const optionElement = createElement("div", "option");
    const optionElementTitle = createElement("div", "option-title", opTitle);
    const optionInputBox = createElement("div", "option-inputs-box");
    optionInputBox.id = `optionRow${i}`;
    opOptions.forEach(e => {
      const input = createElement("div", "option-input", e.toString());
      if (options[opKey] == e) input.classList.add("option-checked");
      input.addEventListener("click", () => {
        options[opKey] = e;
        const row = document.getElementById(`optionRow${i}`);
        row.childNodes.forEach(el => el.classList.toggle("option-checked", false));
        input.classList.toggle("option-checked", true);
        for (let t in THEMES) {
          if (e == THEMES[t]) changeTheme(THEMES[t]);
        }
      })
      optionInputBox.appendChild(input);
    });
    optionElement.appendChild(optionElementTitle);
    optionElement.appendChild(optionInputBox);
    optionsBox.appendChild(optionElement);
  });
  titleBox.appendChild(xButton);
  titleBox.appendChild(title);
  titleBox.appendChild(optionsBox);
  titleScreen.append(titleBox);
}

// Creates the records menu
function createRecordsMenu() {
  const titleScreen = document.querySelector(".title-screen");
  const titleBox = createElement("div", "title-box");
  const recordsBox = createElement("div", "records-box");
  const xButton = createElement("div", "x-button", "<-");
  xButton.addEventListener("click", () => {
    const recordsTitleBox = document.querySelector(".title-box");
    recordsTitleBox.remove();
    createTitleScreen();
  });
  records.forEach(record => {
    const r = createElement("div", "record");
    const zeros = 4 - record[0].toString().length;
    const zerosString = "0".repeat(zeros);
    r.appendChild(createElement("span", undefined, `Game ${zerosString}${record[0]}`));
    r.appendChild(createElement("span", undefined, record[1]));
    r.appendChild(createElement("span", undefined, record[2]));
    recordsBox.appendChild(r);
  });
  titleBox.appendChild(xButton);
  titleBox.appendChild(recordsBox);
  titleScreen.appendChild(titleBox);
}

// Creates a DOM Element
function createElement(type, elementClass = undefined, text = undefined) {
  const e = document.createElement(type);
  if (elementClass) {
    if (typeof elementClass == "string") e.classList.add(elementClass);
    else if (typeof elementClass == "object") {
      elementClass.forEach(cl => e.classList.add(cl));
    } else console.log("error carajo")
  }
  if (text) e.innerHTML = text;
  return e;
}

// Changes the game theme
function changeTheme(newTheme) {
  switch (newTheme) {
    case THEMES.BLACK:
    default:
      root.style.setProperty('--back', '#000');
      root.style.setProperty('--back-title', '#000a');
      root.style.setProperty('--ui', '#fff');
      root.style.setProperty('--ui-hover', '#ccc');
      break;
    case THEMES.WHITE:
      root.style.setProperty('--back', '#fff');
      root.style.setProperty('--back-title', '#fffa');
      root.style.setProperty('--ui', '#000');
      root.style.setProperty('--ui-hover', '#444');
      break;
    case THEMES.GREEN:
      root.style.setProperty('--back', '#0f0');
      root.style.setProperty('--back-title', '#0f0a');
      root.style.setProperty('--ui', '#000');
      root.style.setProperty('--ui-hover', '#040');
      break;
    case THEMES.RED:
      root.style.setProperty('--back', '#f00');
      root.style.setProperty('--back-title', '#f00a');
      root.style.setProperty('--ui', '#000');
      root.style.setProperty('--ui-hover', '#400');
      break;
    case THEMES.BLUE:
      root.style.setProperty('--back', '#00f');
      root.style.setProperty('--back-title', '#00fa');
      root.style.setProperty('--ui', '#fff');
      root.style.setProperty('--ui-hover', '#ccf');
      break;
  }
}

// Save and load functions
// Save
window.addEventListener("beforeunload", () => {
  const optionsJSON = JSON.stringify(options);
  localStorage.setItem("PGoptions", optionsJSON);
})
// Load
window.addEventListener("load", () => {
  const optionsJSON = localStorage.getItem("PGoptions");
  if (optionsJSON != null) options = JSON.parse(optionsJSON);
  changeTheme(options.theme);
})