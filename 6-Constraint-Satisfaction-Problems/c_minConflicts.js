//sets the state of the random function board
function setBoardRandom(FEN,total){
    if(total == 0){
        document.getElementById('status-random').innerHTML='SOLVED';
        describeRandomMinConflict('none','none','none','none','none',13);
    }
    else{
        document.getElementById('status-random').innerHTML='WRONG STATE';   
    }
    var board = ChessBoard('board-random',FEN);
}

//sets the state of min-conflict function board
function setBoardMinConflict(FEN,total){
    if(total == 0){
        document.getElementById('status-minConflict').innerHTML='SOLVED';
        describeBoardMinConflict('none','none','none','none','none');
    }
    else{
        document.getElementById('status-minConflict').innerHTML='WRONG STATE';   
    }
    var board = ChessBoard('board-minConflict',FEN);
}

$(document).ready(function() {
    setBoardRandom();
    setBoardMinConflict();
    resetMinConflict();
    resetRandomConflict();        
});