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

// References
const ball = document.querySelector(".ball");
const player1 = document.querySelector(".player1");
const player2 = document.querySelector(".player2");
const collisionGoal1 = document.querySelector(".collision-goal1");
const collisionGoal2 = document.querySelector(".collision-goal2");
const buttonPlay = document.querySelector(".title-button-play");
const buttonOptions = document.querySelector(".title-button-options");
const buttonRecords = document.querySelector(".title-button-records");
const countdownElement = document.querySelector(".countdown");
const countdownSpan = document.querySelector(".countdown-number");
const squareSize = 30;
// Values/Positions
let blockedBall = true;
let ballDirection = BALL_DIRECTIONS.TOP_LEFT;
const ballSpeedInitial = 3;
let ballSpeed = ballSpeedInitial;
let ballPos = [150, -150];
let playerSpeed = 6;
let pointsPlayer1 = 0;
let pointsPlayer2 = 0;
let p1pos = 0; // X axis
let p2pos = 0; // X axis
let countdownNumber = 4;
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
window.addEventListener("resize", () => {
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
});

// ---- CONTROLS ----
let pressedKeys = {};
// Key Actions for desktop
document.addEventListener("keydown", e => {
  if (pressedKeys[e.key] == undefined) {
    switch (e.key) {
      case "ArrowLeft": p1pos -= playerSpeed; break;
      case "ArrowRight": p1pos += playerSpeed; break;
      case "a": p2pos -= playerSpeed; break;
      case "d": p2pos += playerSpeed; break;
    }
    pressedKeys[e.key] = true;
  }
});
document.addEventListener("keyup", (e) => {
  delete pressedKeys[e.key];
});

// ---- Button Actions ----

buttonPlay.addEventListener("click", () => {
  const title = document.querySelector(".title-screen");
  title.remove();
  countdown();
})

// ---- Functions ----

// Makes all the actions in a game frame
function gameFrame() {
  // Ball
  // Update position
  if (!blockedBall) {
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
  // Check collision with goals
  checkCollision(ball, [collisionGoal1, collisionGoal2], null, target => {
    if (target == collisionGoal1) pointsPlayer2++;
    else if (target == collisionGoal2) pointsPlayer1++;
    restartBall();
  })
  // Players
  // Update position
  player1.style.left = `${p1pos}px`;
  player2.style.left = `${p2pos}px`;
  // Continuous movement
  if ("ArrowLeft" in pressedKeys) p1pos -= playerSpeed;
  if ("ArrowRight" in pressedKeys) p1pos += playerSpeed;
  if ("a" in pressedKeys) p2pos -= playerSpeed;
  if ("d" in pressedKeys) p2pos += playerSpeed;
  // Next frame
  requestAnimationFrame(gameFrame);
}
requestAnimationFrame(gameFrame);

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
  ballSpeed = ballSpeedInitial;
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
  }
  countdownNumber--;
  countdownSpan.innerHTML = countdownNumber;
  if (countdownNumber <= 0) {
    restartBall();
    countdownElement.classList.remove("countdown-show");
    countdownNumber = 4;
  } else {
    setTimeout(() => countdown(), 1000);
  }
}