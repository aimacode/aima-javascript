function queens(){
	var soln = [0, 0, 0, 0, 0, 0, 0, 0];
	return soln;
}

var soln = queens();

var col_selected = [ 3, 0, 4, 1, 7, 2, 0, 3, 3, 1, 1, 6 ]; // gives the column to be selected 
var row_selected = [ 5, 3, 4, 6, 3, 1, 2, 7, 6, 6, 5, 7 ]; // gives the row to be selected 	

var index = 0 ; 
function minConflicts(){
		var conflict = conflicts(soln);
		var total_conflicts = conflict.reduce(add, 0);
		col = col_selected[index];
		val = row_selected[index];

		queen_conflict = []; // stores the no. of conflicts for a queen at each row
		for(j=0;j<8;j++){
			queen_conflict[j] = hit(col,j,soln);
		}
		
		min = Math.min.apply(null, queen_conflict); // gives the minimum no. of conflicts for a queen
		
		row = [];
		for(j = 0;j<8;j++){
			if(queen_conflict[j] ==	 min){
				row.push(j);
			}
			else{
				continue;
			}
		}
		prev_row = soln[col]; 
		soln[col] = val; // change the queen's position
		index = index+1; // increment the value to chose the next col and row
		describe(col,queen_conflict,min,val,prev_row);
		toFEN(soln,total_conflicts);
}

//describes the movement on the board
function describe(col,queen_conflict,min,val,prev_row){
	document.getElementById('col').innerHTML = col ;
	document.getElementById('conflicts').innerHTML = queen_conflict ;
	document.getElementById('min-conflict').innerHTML = min ;
	document.getElementById('row').innerHTML = val ;
	document.getElementById('row-prev').innerHTML = prev_row ;
}

//returns an array of total no. of conflicts for each queen
function conflicts(soln){
	conflict = [];
	for(j=0;j<8;j++){
		conflict[j] = hit(j,soln[j],soln);
	}
	return conflict;
}

//gives the total no. of conflicts of each queen
function hit(col, row, soln){
	total = 0;
	for(k=0;k<8;k++){
		if(k==col){
			continue;
		}
		if((soln[k] == row)||(Math.abs(k-col) == Math.abs(soln[k]-row))){
			total++;
		}	
	}
	return total;
}

function add(a,b){
	return a+b;
}

function reset(){
	soln = queens();
	index = 0;
	describe('none','none','none','none','none');
	toFEN(soln);
}

// converts the solution into FEN which can be understood by chessboard.js
function toFEN(soln,total_conflicts){
	fen = ['11111111','11111111','11111111','11111111','11111111','11111111','11111111','11111111'];
	for(k=0;k<8;k++){
		pos = soln[k];
		fen[7-pos]=replaceAt(fen[7-pos],k,'q'); //function to replace that pos with q
	}
	fencode = '';
	for(k=0;k<8;k++){
		if(k!=7){
			fencode = fencode+fen[7-k]+'/';
		}
		else{
			fencode = fencode+fen[0];
		}
	}
	setBoard(fencode,total_conflicts);
}

function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}
