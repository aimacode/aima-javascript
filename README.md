# aima-javascript
Javascript implementation of algorithms (and visualizations) from Russell And Norvig's "Artificial Intelligence - A Modern Approach"

There's nothing here yet, but I wanted to initialize the repository so that contributors can work on it. Some Javascript visualizations that I admire, and would like to see similar kinds of things here:

- [Red Blob Games: A* Tutorial](http://www.redblobgames.com/pathfinding/a-star/introduction.html)
- [Qiao Search Demo](https://qiao.github.io/PathFinding.js/visual/)
- [Nicky Case: Simulating the World](http://ncase.me/simulating/)
- [Rafael Matsunaga: Genetic Car Thingy](http://rednuht.org/genetic_cars_2/)
- [Lee Yiyuan: 2048 Bot](http://leeyiyuan.github.io/2048ai/)


The repository has the following structure:

    There is a directory for each chapter
      Under a chapter directory, there is one directory for each algorithm
        Under a directory of a particular algorithm, there is a index.html which contains the visualizations for the algorithm.
        The index.html will also execute the algorithm itself. You can view the working in the browser console.
        There will also be a JS file in which the algorithm is implemented. This JS will be imported by index.html to execute the algorithm.
    Apart from all chapter directories, there will be several other directories like scripts, css which contain supporting files like require.js, bootstrap, D3, etc.
