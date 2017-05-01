var DEBUG_MODE = false;
var OFFLINE_MODE = false;
var cornerTextPipes = ["&#9562", "&#9556","&#9559","&#9565"];
var cornerTextLines = ["&#9495", "&#9487","&#9491","&#9499"];
var cornerText = cornerTextLines;
var boardHeight = 36, boardWidth = 80;
var gameBoard;
var gameLoop = false;
var highScore = 0;
var serverScore = false;
var skipNameDialog = false;

function getElem(id){
    return document.getElementById(id);
}

function pageLoad() {
    highScore = getScoreCookie();
    logPageHit();
    setupScoreStream();
    getElem("highScoreText").textContent = highScore;
    getElem("username").value = getNameCookie();
    resetBoard();
}

function resetBoard(){
    if(!gameLoop){
        gameBoard = genRandomBoard(boardHeight, boardWidth);
        setFontSize();
        getElem("gameText").innerHTML = boardToHTML(gameBoard);
    }
}

function resetScore(){
    if (confirm("Are you sure you want to reset your high score?") == true) {
        highScore = 0;
        getElem("highScoreText").textContent = highScore;
        setScoreCookie();
    }
}

function setScoreCookie() {
    document.cookie = "highScore=" + highScore + "; expires=Tue, 19 Jan 2038 03:14:07 UTC";
};

function setNameCookie(username) {
    document.cookie = "username=" + username + "; expires=Tue, 19 Jan 2038 03:14:07 UTC";
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

window.addEventListener("resize", function(event) {
    setFontSize();
})

getElem("username").onkeypress = function(e) {
    var chr = String.fromCharCode(e.which);
    if ("qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890".indexOf(chr) < 0){
        return false;
    } else {
        setNameCookie(getElem("username").value + chr);
    }
};

function setFontSize(){
    var viewWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var fontSize = Math.floor(viewWidth/boardWidth + .5);
    getElem("gameText").style.fontSize = Math.min(fontSize, 20) +"px";
    getElem("globalScoreAlign").style.width = Math.floor(viewWidth/3.2)+"px";
    getElem("currentScoreAlign").style.width = Math.floor(viewWidth/3.2)+"px";
    getElem("highScoreAlign").style.width = Math.floor(viewWidth/3.2)+"px";
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
function getNameCookie() {
    var name = "username=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
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
    var neighbors = [];
    var oldNeighbors = [];
    var boardStr;
    var inputRow;
    var inputCol;
    
    var turnCell = function(r, c){
        gameBoard[r][c] = (gameBoard[r][c]+1) % 4;
        getElem(r + "," + c).innerHTML = cornerText[gameBoard[r][c]];
        getElem(r + "," + c).style = "color:blue;";
        score++;
    };
    
    var fadeCell = function(r, c){
        getElem(r + "," + c).style = "color:red;";
    };

    var chainReact = function(){
        if(neighbors.length>0){
            setTimeout(chainReact,  getElem("delaySlider").value | 0);
            for(var n = 0, l = oldNeighbors.length; n<l; n++){
                fadeCell(oldNeighbors[n][0],oldNeighbors[n][1]);
            }
            for(var n = 0, l = neighbors.length; n<l; n++){
                turnCell(neighbors[n][0],neighbors[n][1]);
            }
            oldNeighbors = JSON.parse(JSON.stringify(neighbors));
            neighbors = getNeighbors(neighbors, gameBoard);
            getElem("scoreText").textContent = score;
            if(score>highScore){
                highScore=score;
                getElem("highScoreText").textContent = highScore;
                setScoreCookie();
            }
        } else {
            gameLoop = false;
            if(!(serverScore === false)){
                if(score==highScore){
                    getServerScore();
                }
                if(!(serverScore === false) && score>=1000){
                    if(getElem("username").value == ""){
                        if(!skipNameDialog && confirm("That was a pretty good score! However, since you haven't set a display name, your score can't appear on the leaderboard. Would you like to set your display name now?")){
                            var str = prompt("Enter your display name\n(Alphanumeric characters only)");
                            while(str!="" && /[^a-zA-Z0-9]/.test(str)) {
                                str = prompt("Enter your display name\n(Alphanumeric characters ONLY)");
                            }
                            if (str == null || str == ""){
                                alert("Your score wasn't logged on the server.\nFeel free to set your display name at any time.");
                                skipNameDialog = true;
                            } else {
                                getElem("username").value = str;
                                setScoreCookie(str);
                                sendGame(score, boardStr, inputRow, inputCol);
                            }
                        } else if(!skipNameDialog) {
                            alert("Your score wasn't logged on the server.\nFeel free to set your display name at any time.");
                            skipNameDialog = true;
                        }
                    } else {
                        sendGame(score, boardStr, inputRow, inputCol);
                    }
                } else {
                    if(!(serverScore === false)){
                        console.log("Score was not logged on the server. (Reason: score was too low)");
                    } else {
                        console.log("Score was not logged on the server. (Reason: serverScore === false. Perhaps there was an error on the server within the last 30 seconds?)");
                    }
                }
            }
            ga('send', 'event', 'Game', 'play', undefined, score); //Log game in google analytics
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
    var self = this;
    self.startReaction = function(r, c){
        if(!gameLoop){
            getElem("gameText").innerHTML = boardToHTML(gameBoard);
            inputRow=r;
            inputCol=c;
            boardStr=implodeBoard(gameBoard)
            neighbors = [[r,c]];
            oldNeighbors = [[r,c]];
            gameLoop = true;
            chainReact();
        }
    };
}

function getLeaderboard(){
    if (OFFLINE_MODE){
        console.log("getLeaderboard was cancelled. Reason: OFFLINE_MODE === true");
        return;
    }
    
    ajaxPoster("getLeaderboard.php", "", function(httpObj){
        var leaderboardDiv = getElem('leaderboardDiv');
        leaderboardDiv.innerHTML = httpObj.responseText;
    });
}

function sendGame(score, board, row, col){
    if (OFFLINE_MODE){
        console.log("sendGame was cancelled. Reason: OFFLINE_MODE === true");
        return;
    }
    if(score<1000){
        console.log("Score was not logged on the server. (Reason: score was too low)");
        return;
    }
    var params = "board=" + board + "&row=" + row + "&col=" + col + "&name=" + getElem("username").value;
    ajaxPoster("playGame.php", params, function(httpObj){
        console.log(httpObj.responseText);
    });
}

function logPageHit() {
    if (OFFLINE_MODE){
        console.log("logPageHit was cancelled. Reason: OFFLINE_MODE === true");
        return;
    }
    
    ajaxPoster("logPageHit.php", "", function(httpObj){
        console.log(httpObj.responseText);
    });
}

function setupScoreStream() {
    if (OFFLINE_MODE){
        console.log("setupScoreStream was cancelled. Reason: OFFLINE_MODE === true");
        return;
    }
     
    if(typeof(EventSource) !== "undefined") {
        var source = new EventSource("getHighScore.php");
        source.onmessage = function(event) {
            getElem("serverHighScoreText").textContent = event.data;
            serverScore = event.data | 0;
            console.log(event.data);
        };
    } else {
        console.log("Event streams aren't available for your web browser. Consider updating to a modern web browser.");
        getServerScore();
        setInterval(getServerScore,30000);
    }
}

function getServerScore() {
    if (OFFLINE_MODE){
        console.log("getServerScore was cancelled. Reason: OFFLINE_MODE === true");
        return;
    }
    
    ajaxPoster("getHighScore.php", "", function(httpObj){
        if (isNaN(httpObj.responseText.substring(17))){
            console.log(httpObj.responseText); //responseText should be a string that is a number. If it isnt, responseText is likely an error message
            serverScore === false;
        } else {
            serverScore = parseInt(httpObj.responseText.substring(17));
            getElem("serverHighScoreText").textContent = serverScore;
            console.log("Server score was manually updated.\nserverScore now has a value of " + serverScore + ".");
        }
    });
}

function ajaxPoster(ajaxURL, ajaxParams, readystatechangeFunction){
    var http = new XMLHttpRequest();
    var url = ajaxURL;
    var params = ajaxParams;
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            readystatechangeFunction(http);
        }
    }
    http.send(params);
}
//MODAL CODE
    // Get the modal
    var modal = getElem('myModal');

    // Get the button that opens the modal
    var btn = getElem("myBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal 
    btn.onclick = function() {
        modal.style.display = "block";
        getLeaderboard();
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
//END MODAL CODE