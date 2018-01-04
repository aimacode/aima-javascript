function setBoard(FEN,total){
    if(total == 0){
        document.getElementById('status').innerHTML='SOLVED';
        describe('none','none','none','none','none');
    }
    else{
        document.getElementById('status').innerHTML='WRONG STATE';   
    }
    var board = ChessBoard('board',FEN);
}

$(document).ready(function() {
    setBoard();
    reset();        
});