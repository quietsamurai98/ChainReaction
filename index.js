var DEBUG_MODE = false;
var cornerText = ["&#9562", "&#9556","&#9559","&#9565"];
var boardHeight = 36, boardWidth = 80;
var gameBoard;
var neighbors = [];
var gameLoop = false;
var highScore = 0;
var serverScore = false;


function pageLoad() {
    highScore = getScoreCookie();
    setupScoreStream();
    document.getElementById("highScoreText").textContent = highScore;
    resetBoard();
}

function setupScoreStream() {
    if(typeof(EventSource) !== "undefined") {
        var source = new EventSource("getHighScore.php");
        source.onmessage = function(event) {
            document.getElementById("serverHighScoreText").textContent = event.data;
            serverScore = event.data | 0;
        };
    } else {
        document.getElementById("serverHighScoreText").textContent = "Not available on this browser";
    }
}

function resetBoard(){
    if(!gameLoop){
        gameBoard = genRandomBoard(boardHeight, boardWidth);
        document.getElementById("gameText").innerHTML = boardToHTML(gameBoard);
    }
}

function resetScore(){
    if (confirm("Are you sure you want to reset your high score?") == true) {
        highScore = 0;
        document.getElementById("highScoreText").textContent = highScore;
        setScoreCookie();
    }
}

function setScoreCookie() {
    document.cookie = "highScore=" + highScore + "; expires=Tue, 19 Jan 2038 03:14:07 UTC";
};

function boardToHTML(arr){
    var lr = boardHeight, lc = boardWidth;
    var output = "";
    for(var r = 0; r < lr; r++){ 
        for(var c = 0; c < lc; c++){
            output += "<span id='" + r + "," + c + "' onclick='charClicked(" + r + "," + c + ")'>";
            output += cornerText[arr[r][c]];
            output += "</span>";
        }
        output += "<br>";
    }
    return output;
}

function genRandomBoard(lr, lc){
    var out = [];
    for(var r = 0; r < lr; r++){
        var tempRow = [];
        for(var c = 0; c < lc; c++){
            tempRow.push( (Math.random()*4) | 0);
        }
        out.push(tempRow);
    }
    return out;
}

function charClicked(r, c){
    var newGame = new GameWorker();
    newGame.startReaction(r, c);
}

function getScoreCookie() {
    var name = "highScore=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return parseInt(c.substring(name.length, c.length));
        }
    }
    return 0;
}

function implodeBoard(inputBoard) {
    var boardStr = "";
    for(var r=0; r<inputBoard.length; r++){
        var rowStr = "";
        for(var c = 0; c < inputBoard[0].length; c++){
            rowStr += inputBoard[r][c] + ",";
        }
        boardStr += rowStr.substring(0, rowStr.length-1) + "."; //Remove extrenuous comma, add period seperator
    }
    boardStr = boardStr.substring(0, boardStr.length-1); //Remove extrenuous period
    return boardStr;
}

var GameWorker = function (){
    var score = 0;
    var boardStr;
    var inputRow;
    var inputCol;
    
    var changeCell = function(r, c){
        gameBoard[r][c] = (gameBoard[r][c]+1) % 4;
        document.getElementById(r + "," + c).innerHTML = cornerText[gameBoard[r][c]];
        score++;
    };

    var chainReact = function(){
        if(neighbors.length>0){
            for(var n = 0, l = neighbors.length; n<l; n++){
                changeCell(neighbors[n][0],neighbors[n][1]);
            }
            neighbors = getNeighbors(neighbors, gameBoard);
            document.getElementById("scoreText").textContent = score;
            if(score>highScore){
                highScore=score;
                document.getElementById("highScoreText").textContent = highScore;
                setScoreCookie();
            }
        } else {
            clearInterval(gameLoop);
            gameLoop = false;
            if(serverScore){
                sendGame(boardStr, inputRow, inputCol);
            }
        }
    };

    var getNeighbors = function(parents, arr){
        var out = [];
        var h = arr.length, w = arr[0].length;
        for(var n = 0, l = parents.length; n<l; n++){
            var r = parents[n][0], c = parents[n][1];
            if(r-1>=0){
                if(arr[r][c] % 3 == 0 && arr[r-1][c] % 3 != 0){
                    out.push([r-1,c]);
                }
            }
            if(c-1>=0){
                if(arr[r][c] >= 2 && arr[r][c-1] <= 1){
                    out.push([r,c-1]);
                }
            }
            if(r+1<h){
                if(arr[r][c] % 3 != 0 && arr[r+1][c] % 3 == 0){
                    out.push([r+1,c]);
                }
            }
            if(c+1<w){
                if(arr[r][c] <= 1 && arr[r][c+1] >= 2){
                    out.push([r,c+1]);
                }
            }
        }
        return removeDuplicates(out);
    };

    /**
     * Removes duplicate values from an array
     *    have the same resulting string
     */
    var removeDuplicates = function(arr) {
        var len=arr.length;
        var out=[];
        var strings = [];
        for(var i = 0; i<len; i++){
            strings.push(JSON.stringify(arr[i]));
        }
        for (var i=0;i<len;i++) {
            var flag = true;
            for (var j=i+1; j<len && flag; j++) {
                if (strings[i] == strings[j]){
                    flag = false;
                }
            }
            if (flag){
                out.push(arr[i]);
            }
        }
        return out;
    };
    
    var sendGame = function(board, row, col){
        //Calculate score on the server, and log that score in the database
        var http = new XMLHttpRequest();
        var url = "playGame.php";
        var params = "board=" + board + "&row=" + row + "&col=" + col;
        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                console.log(http.responseText);
            }
        }
        http.send(params);
    }
    
    var self = this;
    self.startReaction = function(r, c){
        if(!gameLoop){
            inputRow=r;
            inputCol=c;
            boardStr=implodeBoard(gameBoard)
            neighbors = [[r,c]];
            gameLoop = setInterval(chainReact, 100);
        }
    };
}