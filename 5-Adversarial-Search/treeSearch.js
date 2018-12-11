const treeSearchView = {
	display : ()=> {
		treeSearchView.two.clear();
		drawTree(treeSearchView.tree, treeSearchView.two)
	},
	init : ()=> {
		treeSearchView.two = new Two({ width: 800, height: 300 }).appendTo(document.getElementById("treeSearchCanvas"));
		treeSearchView.board = new Board([0,0,1,-1,-1,0,1,1,-1], 1, 4)
		treeSearchView.tree = new Tree(treeSearchView.board, 4);
		treeSearchView.current = treeSearchView.tree;
		treeSearchView.hover = null;
		treeSearchView.display();
	}
}