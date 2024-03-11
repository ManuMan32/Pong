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
const squareSize = 30;
// Values/Positions
let blockedBall = true;
let ballDirection = BALL_DIRECTIONS.TOP_LEFT;
let ballSpeed = 4;
let ballPos = [150, 150];
let playerSpeed = 6;
let pointsPlayer1 = 0;
let pointsPlayer2 = 0;
let p1pos = 0; // X axis
let p2pos = 0; // X axis
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
      case " ": blockedBall = false; break;
    }
    pressedKeys[e.key] = true;
  }
});
document.addEventListener("keyup", (e) => {
  delete pressedKeys[e.key];
});

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
  });
  // Players
  // Update position
  player1.style.left = `${p1pos}px`;
  player2.style.left = `${p2pos}px`; 6
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