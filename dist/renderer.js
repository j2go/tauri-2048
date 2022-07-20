// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
doucmentWidth = window.screen.availWidth;
gridContainerWidth = 0.92 * doucmentWidth;
cellSideLenth = 0.18 * doucmentWidth;
cellSpace = 0.04 * doucmentWidth;

var gameOver = false;

function getPostop(i, j) {
  return cellSpace + i * (cellSpace + cellSideLenth);
}

function getPosleft(i, j) {
  return cellSpace + j * (cellSpace + cellSideLenth);
}

function getNumberBackgroundColor(number) {
  switch (number) {
    case 2:
      return "#eee4da";
      break;
    case 4:
      return "#ede0c8";
      break;
    case 8:
      return "#f2b179";
      break;
    case 16:
      return "#f59563";
      break;
    case 32:
      return "#f67c5f";
      break;
    case 64:
      return "#f65e3b";
      break;
    case 128:
      return "#edcf72";
      break;
    case 256:
      return "#edcc61";
      break;
    case 512:
      return "#9c0";
      break;
    case 1024:
      return "#33b5e5";
      break;
    case 2048:
      return "#a6c";
      break;
    case 4096:
      return "#93c";
      break;
  }

  return "black";
}

function getNumberColor(number) {
  if (number <= 4) {
    return "#776e65";
  }
  return "white";
}

function nospace(board) {
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (board[i][j] == 0) return false;
    }
  }
  return true;
}

function canMoveLeft(board) {
  for (var i = 0; i < 4; i++)
    for (var j = 1; j < 4; j++) {
      if (board[i][j] != 0)
        if (board[i][j - 1] == 0 || board[i][j - 1] == board[i][j]) return true;
    }

  return false;
}

function canMoveUp(board) {
  for (var j = 0; j < 4; j++)
    for (var i = 1; i < 4; i++) {
      if (board[i][j] != 0)
        if (board[i - 1][j] == 0 || board[i - 1][j] == board[i][j]) return true;
    }

  return false;
}

function canMoveRight(board) {
  for (var i = 0; i < 4; i++)
    for (var j = 2; j >= 0; j--) {
      if (board[i][j] != 0)
        if (board[i][j + 1] == 0 || board[i][j + 1] == board[i][j]) return true;
    }

  return false;
}

function canMoveDown(board) {
  for (var j = 0; j < 4; j++)
    for (var i = 2; i >= 0; i--) {
      if (board[i][j] != 0)
        if (board[i + 1][j] == 0 || board[i + 1][j] == board[i][j]) return true;
    }

  return false;
}

function noBlockHorizontal(row, col1, col2, board) {
  for (var i = col1 + 1; i < col2; i++) {
    if (board[row][i] != 0) return false;
  }
  return true;
}

function noBlockVertical(col, row1, row2, board) {
  for (var i = row1 + 1; i < row2; i++) {
    if (board[i][col] != 0) return false;
  }

  return true;
}

function showNumberWithAnimation(i, j, number) {
  var numberCell = $("#number-cell-" + i + "-" + j);
  numberCell.css("background-color", getNumberBackgroundColor(number));
  numberCell.css("color", getNumberColor(number));
  numberCell.text(number);

  numberCell.animate(
    {
      width: cellSideLenth,
      height: cellSideLenth,
      top: getPostop(i, j),
      left: getPosleft(i, j),
    },
    50
  );
}

function showMoveAnimation(fromx, fromy, tox, toy) {
  var numberCell = $("#number-cell-" + fromx + "-" + fromy);
  numberCell.animate(
    {
      top: getPostop(tox, toy),
      left: getPosleft(tox, toy),
    },
    200
  );
}

function updateScore(score) {
  $("#score").text(score);
}

var board = new Array();
var hasConflict = new Array();
var score = 0;

var startx = 0;
var starty = 0;
var endx = 0;
var endy = 0;

$(document).ready(function () {
  $(".js_ddd").click(function () {
    newgame();
  });
  prepareForMobile();
  newgame();
});

function prepareForMobile() {
  if (doucmentWidth > 1000) {
    gridContainerWidth = 400;
    cellSideLenth = 80;
    cellSpace = 16;
  }

  $("#grid-container").css("width", gridContainerWidth - 2 * cellSpace);
  $("#grid-container").css("height", gridContainerWidth - 2 * cellSpace);
  $("#grid-container").css("padding", cellSpace);
  $("#grid-container").css("border-radius", 0.02 * gridContainerWidth);

  $(".grid-cell").css("width", cellSideLenth);
  $(".grid-cell").css("height", cellSideLenth);
  $(".grid-cell").css("border-radius", 0.02 * cellSideLenth);
}

function newgame() {
  //初始化棋盘格
  init();
  //2个空格子里生成随机数
  generateOneNumber();
  generateOneNumber();
  gameOver = false;
}

function init() {
  for (var i = 0; i < 4; i++)
    for (var j = 0; j < 4; j++) {
      var gridCell = $("#grid-cell-" + i + "-" + j);
      gridCell.css("top", getPostop(i, j));
      gridCell.css("left", getPosleft(i, j));
      gridCell.css("border-radius", "6px");
    }

  for (var i = 0; i < 4; i++) {
    board[i] = new Array();
    hasConflict[i] = new Array();
    for (var j = 0; j < 4; j++) {
      board[i][j] = 0;
      hasConflict[i][j] = false;
    }
  }

  updateBoardView();

  score = 0;
  updateScore(0);
}

function updateBoardView() {
  $(".number-cell").remove();
  for (var i = 0; i < 4; i++)
    for (var j = 0; j < 4; j++) {
      $("#grid-container").append(
        '<div class="number-cell" id="number-cell-' + i + "-" + j + '"></div>'
      );
      var theNumberCell = $("#number-cell-" + i + "-" + j);

      if (board[i][j] == 0) {
        theNumberCell.css("width", "0px");
        theNumberCell.css("height", "0px");
        theNumberCell.css("top", getPostop(i, j) + cellSideLenth / 2);
        theNumberCell.css("left", getPosleft(i, j) + cellSideLenth / 2);
      } else {
        theNumberCell.css("width", cellSideLenth);
        theNumberCell.css("height", cellSideLenth);
        theNumberCell.css("top", getPostop(i, j));
        theNumberCell.css("left", getPosleft(i, j));
        theNumberCell.css(
          "background-color",
          getNumberBackgroundColor(board[i][j])
        );
        theNumberCell.css("color", getNumberColor(board[i][j]));
        theNumberCell.text(board[i][j]);
      }

      hasConflict[i][j] = false;
    }
  $(".number-cell").css("line-height", cellSideLenth + "px");
  $(".number-cell").css("font-size", 0.4 * cellSideLenth + "px");
}

//在随机位置生成一个随机数
function generateOneNumber() {
  if (nospace(board)) return false;

  var times = 0;
  var randx, randy;
  //随机一个位置
  while (times < 50) {
    randx = parseInt(Math.floor(Math.random() * 4));
    randy = parseInt(Math.floor(Math.random() * 4));
    if (board[randx][randy] == 0) break;
    times++;
  }
  if (times == 50) {
    for (var i = 0; i < 4; i++)
      for (var j = 0; j < 4; j++)
        if (board[i][j] == 0) {
          randx = i;
          randy = j;
        }
  }
  //随机一个数字
  var randNumber = Math.random() < 0.75 ? 2 : 4;

  //在随机位置上显示随机数字
  board[randx][randy] = randNumber;
  showNumberWithAnimation(randx, randy, randNumber);

  return true;
}

$(document).keydown(function (event) {
  if (gameOver) return;
  switch (event.keyCode) {
    case 37: //left
      if (moveLeft()) {
        setTimeout(function () {
          generateOneNumber();
        }, 210);
        setTimeout(function () {
          isgameover();
        }, 500);
      }
      break;
    case 38: //up
      if (moveUp()) {
        setTimeout(function () {
          generateOneNumber();
        }, 210);
        setTimeout(function () {
          isgameover();
        }, 500);
      }
      break;
    case 39: //right
      if (moveRight()) {
        setTimeout(function () {
          generateOneNumber();
        }, 210);
        setTimeout(function () {
          isgameover();
        }, 500);
      }
      break;
    case 40: //down
      if (moveDown()) {
        setTimeout(function () {
          generateOneNumber();
        }, 210);
        setTimeout(function () {
          isgameover();
        }, 500);
      }
      break;
    case 67:
      var name = prompt("该死的小白", "0,0");
      if (name) {
        var zs = name.split(",");
        var x = parseInt(zs[0]),
          y = parseInt(zs[1]);
        board[y][x] = 0;
        updateBoardView();
      }
    default:
      break;
  }
});

document.addEventListener("touchstart", function (event) {
  startx = event.touches[0].pageX;
  starty = event.touches[0].pageY;
});

document.addEventListener("touchend", function (event) {
  endx = event.changedTouches[0].pageX;
  endy = event.changedTouches[0].pageY;

  var datax = endx - startx;
  var datay = endy - starty;

  //x
  if (
    Math.abs(datax) >= Math.abs(datay) &&
    Math.abs(datax) > 0.2 * doucmentWidth
  ) {
    //right
    if (datax > 0) {
      if (moveRight()) {
        setTimeout("generateOneNumber()", 210);
        setTimeout(function () {
          isgameover();
        }, 500);
      }
    } else {
      //left
      if (moveLeft()) {
        setTimeout("generateOneNumber()", 210);
        setTimeout(function () {
          isgameover();
        }, 500);
      }
    }
  } else if (Math.abs(datay) > 0.2 * doucmentWidth) {
    //y
    //up
    if (datay < 0) {
      if (moveUp()) {
        setTimeout("generateOneNumber()", 210);
        setTimeout(function () {
          isgameover();
        }, 500);
      }
    } else {
      //down
      if (moveDown()) {
        setTimeout("generateOneNumber()", 210);
        setTimeout(function () {
          isgameover();
        }, 500);
      }
    }
  }
});

document.addEventListener("touchmove", function (event) {
  event.preventDefault();
});

function isgameover() {
  if (nospace(board) && cannotMove(board) && !gameOver) {
    gameOver = true;
    alert("可惜可惜 !! 再来 ~~~");
  } else {
    for (var i = 0; i < 4; i++)
      for (var j = 0; j < 4; j++) if (board[i][j] == 2048) alert("牛X牛X !!!");
  }
}

function cannotMove(board) {
  return !(
    canMoveLeft(board) ||
    canMoveUp(board) ||
    canMoveRight(board) ||
    canMoveDown(board)
  );
}

function moveLeft() {
  //判断是否能左移
  if (!canMoveLeft(board)) {
    return false;
  }

  //左移操作
  for (var i = 0; i < 4; i++)
    for (var j = 1; j < 4; j++) {
      if (board[i][j] != 0) {
        for (var k = 0; k < j; k++) {
          if (board[i][k] == 0 && noBlockHorizontal(i, k, j, board)) {
            //move
            showMoveAnimation(i, j, i, k);
            board[i][k] = board[i][j];
            board[i][j] = 0;
            continue;
          } else if (
            board[i][k] == board[i][j] &&
            noBlockHorizontal(i, k, j, board) &&
            !hasConflict[i][k]
          ) {
            //move
            showMoveAnimation(i, j, i, k);
            //add
            board[i][k] += board[i][j];
            board[i][j] = 0;
            //add score
            score += board[i][k];
            updateScore(score);

            hasConflict[i][k] = true;

            continue;
          }
        }
      }
    }

  setTimeout(function () {
    updateBoardView();
  }, 200);
  return true;
}

function moveUp() {
  //check up
  if (!canMoveUp(board)) {
    return false;
  }

  //move up
  for (var j = 0; j < 4; j++)
    for (var i = 1; i < 4; i++) {
      if (board[i][j] != 0) {
        for (var k = 0; k < i; k++) {
          if (board[k][j] == 0 && noBlockVertical(j, k, i, board)) {
            //move
            showMoveAnimation(i, j, k, j);
            board[k][j] = board[i][j];
            board[i][j] = 0;
            continue;
          } else if (
            board[k][j] == board[i][j] &&
            noBlockVertical(j, k, i, board) &&
            !hasConflict[k][j]
          ) {
            //move
            showMoveAnimation(i, j, k, j);
            //add
            board[k][j] += board[i][j];
            board[i][j] = 0;
            //add score
            score += board[k][j];
            updateScore(score);

            hasConflict[k][j] = true;

            continue;
          }
        }
      }
    }

  setTimeout(function () {
    updateBoardView();
  }, 200);
  return true;
}

function moveRight() {
  //check move right
  if (!canMoveRight(board)) {
    return false;
  }
  //move right
  for (var i = 0; i < 4; i++)
    for (var j = 2; j >= 0; j--) {
      if (board[i][j] != 0) {
        for (var k = 3; k > j; k--) {
          if (board[i][k] == 0 && noBlockHorizontal(i, j, k, board)) {
            //move
            showMoveAnimation(i, j, i, k);
            board[i][k] = board[i][j];
            board[i][j] = 0;
            continue;
          } else if (
            board[i][k] == board[i][j] &&
            noBlockHorizontal(i, j, k, board) &&
            !hasConflict[i][k]
          ) {
            //move
            showMoveAnimation(i, j, i, k);
            //add
            board[i][k] += board[i][j];
            board[i][j] = 0;
            //add score
            score += board[i][k];
            updateScore(score);

            hasConflict[i][k] = true;

            continue;
          }
        }
      }
    }
  setTimeout(function () {
    updateBoardView();
  }, 200);
  return true;
}

function moveDown() {
  //check move down
  if (!canMoveDown(board)) {
    return false;
  }
  //move down
  for (var j = 0; j < 4; j++)
    for (var i = 2; i >= 0; i--) {
      if (board[i][j] != 0) {
        for (var k = 3; k > i; k--) {
          if (board[k][j] == 0 && noBlockVertical(j, i, k, board)) {
            //move
            showMoveAnimation(i, j, k, j);
            board[k][j] = board[i][j];
            board[i][j] = 0;
            continue;
          } else if (
            board[k][j] == board[i][j] &&
            noBlockVertical(j, i, k, board) &&
            !hasConflict[k][j]
          ) {
            //move
            showMoveAnimation(i, j, k, j);
            //add
            board[k][j] += board[i][j];
            board[i][j] = 0;
            //add score
            score += board[k][j];
            updateScore(score);

            hasConflict[k][j] = true;

            continue;
          }
        }
      }
    }

  setTimeout(function () {
    updateBoardView();
  }, 200);
  return true;
}
