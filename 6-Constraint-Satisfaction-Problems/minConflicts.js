function queens(){
	var soln = [0, 0, 0, 0, 0, 0, 0, 0];
	return soln;
}

var soln_minConflict = queens();
var soln_randomConflict = queens();

var col_selected = [ 3, 0, 4, 1, 7, 2, 0, 3, 3, 1, 1, 6 ]; // gives the column to be selected 
var row_selected = [ 5, 3, 4, 6, 3, 1, 2, 7, 6, 6, 5, 7 ]; // gives the row to be selected 	

var index = 0;
var count = 0;

//Runs update function for Min-Conflict
var x = [];
var intervalMinConflict; 
function animateMinConflicts(){
	intervalMinConflict = setInterval(function(){
		x = minConflicts();
		setBoardMinConflict(x[0],x[1]);},1000);
}

function minConflicts(){
	var conflict = conflicts(soln_minConflict);
	var total_conflicts = conflict.reduce(add, 0);
	col = col_selected[index];
	val = row_selected[index];

	queen_conflict = []; // stores the no. of conflicts for a queen at each row
	for(j=0;j<8;j++){
		queen_conflict[j] = hit(col,j,soln_minConflict);
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
	prev_row = soln_minConflict[col]; 
	soln_minConflict[col] = val; // change the queen's position
	index = index+1; // increment the value to chose the next col and row
	describeBoardMinConflict(col,queen_conflict,min,val,prev_row,index);
	fen = toFEN(soln_minConflict);
	return [fen, total_conflicts];
}

function describeBoardMinConflict(col,queen_conflict,min,val,prev_row,index){
	document.getElementById('col').innerHTML = col ;
	document.getElementById('conflicts').innerHTML = queen_conflict ;
	document.getElementById('min-conflict').innerHTML = min ;
	document.getElementById('row').innerHTML = val ;
	document.getElementById('row-prev').innerHTML = prev_row ;
	document.getElementById('index').innerHTML = index;
}

//Runs update function for Random-Conflict
var  y = [];
var intervalRandomConflict;
function animateRandomConflicts(){
	intervalRandomConflict = setInterval(function(){
	y = randomConflict();
	setBoardRandom(y[0],y[1]);},500);
}

function randomConflict(){
	var conflict = conflicts(soln_randomConflict);
	var total_conflicts = conflict.reduce(add,0);
	if(total_conflicts == 0){
		fen = toFEN(soln_randomConflict);
		return [fen, 0];
	}

	col = Math.floor(Math.random()*8); // randomly select a col for changing
	val = Math.floor(Math.random()*8); // randomly select a row for changing
	
	queen_conflict = []; // stores the no. of conflict for a queen at each row
	for(k=0;k<8;k++){
		queen_conflict[k] = hit(col,j,soln_randomConflict);
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
	prev_row = soln_randomConflict[col];
	soln_randomConflict[col] = val;
	count++;
	describeBoardRandom(col,queen_conflict,min,val,prev_row,count);
	fen = toFEN(soln_randomConflict,);
	return [fen, total_conflicts];
}

function describeBoardRandom(col,queen_conflict,min,val,prev_row,count){
	document.getElementById('col-r').innerHTML = col ;
	document.getElementById('conflicts-r').innerHTML = queen_conflict ;
	document.getElementById('min-conflict-r').innerHTML = min ;
	document.getElementById('row-r').innerHTML = val ;
	document.getElementById('row-prev-r').innerHTML = prev_row ;
	document.getElementById('count').innerHTML = count;
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

// converts the solution into FEN which can be understood by chessboard.js
function toFEN(soln){
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
	//setBoardRandom(fencode,total_conflicts);
	return fencode;
}

function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}

//resets the board state
function resetMinConflict(){
	clearInterval(intervalMinConflict);
	soln_minConflict = queens();
	index = 0;
	describeBoardMinConflict('none','none','none','none','none',0);
	fencode = toFEN(soln_minConflict);
	setBoardMinConflict(fencode);
}

function resetRandomConflict(){
	clearInterval(intervalRandomConflict);
	soln_randomConflict = queens();
	count = 0;
	describeBoardRandom('none','none','none','none','none',0);
	fencode = toFEN(soln_randomConflict);
	setBoardRandom(fencode);
}
