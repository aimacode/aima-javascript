# aima-javascript
Javascript implementation of algorithms (and visualizations) from Russell And Norvig's "Artificial Intelligence - A Modern Approach"

Some Javascript visualizations that I admire, and would like to see similar kinds of things here:
- [Red Blob Games: A* Tutorial](http://www.redblobgames.com/pathfinding/a-star/introduction.html)
- [Qiao Search Demo](https://qiao.github.io/PathFinding.js/visual/)
- [Nicky Case: Simulating the World](http://ncase.me/simulating/)
- [Rafael Matsunaga: Genetic Car Thingy](http://rednuht.org/genetic_cars_2/)
- [Lee Yiyuan: 2048 Bot](http://leeyiyuan.github.io/2048ai/)


## Prerequisites

* Node.js version 0.10.0 or newer
* Install jspm, eslint, gulp globally

```
npm install -g jspm
npm install -g eslint
npm install -g gulp

```
## Installation

To run locally for development.

1. run `npm install`
2. run `jspm install`

## Running

Start a local server, e.g. `python -m SimpleHTTPServer`.

## Deploying

To bundle the web app

1. run `gulp bundle` followed by `gulp copy` to bundle the app into build folder
2. Either serve `build` folder locally.
3. Or deploy it to gh-pages by running `gulp deploy`.

## build

This directory contains the minified source code for production deployment.

The repository has the following structure:

    There is a directory for each chapter
      Under a chapter directory, there is one directory for each algorithm
        Under a directory of a particular algorithm, there is a index.html which contains the visualizations for the algorithm.
        The index.html will also execute the algorithm itself. You can view the working in the browser console.
        There will also be a JS file in which the algorithm is implemented. This JS will be imported by index.html to execute the algorithm.
    Apart from all chapter directories, there will be several other directories like scripts, css which contain supporting files like require.js, bootstrap, D3, etc.
