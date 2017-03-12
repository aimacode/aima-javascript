# aima-javascript
Visualization of concepts from Russell And Norvig's "Artificial Intelligence - A Modern Approach", and Javascript code for algorithms. Unlike aima-python, aima-java, and other sibling projects, this project is primarily about the visualizations and secondarily about the code.

[Click here to go to the static hosted page](http://aimacode.github.io/aima-javascript/)

[Click here to go to the gitter chat lobby](https://gitter.im/aimacode/Lobby)

Some Javascript visualizations that I admire, and would like to see similar kinds of things here:
- [Red Blob Games: A* Tutorial](http://www.redblobgames.com/pathfinding/a-star/introduction.html)
- [Qiao Search Demo](https://qiao.github.io/PathFinding.js/visual/)
- [Nicky Case: Simulating the World](http://ncase.me/simulating/)
- [Rafael Matsunaga: Genetic Car Thingy](http://rednuht.org/genetic_cars_2/)
- [Lee Yiyuan: 2048 Bot](http://leeyiyuan.github.io/2048ai/)

## Step by Step to Try

1. Install [Prerequisites](#Prerequisites).
2. Doing [Installation](#Installation).
3. [Deploying](#Deploying) locally.
4. [Running](#Running) Local Server.

### Prerequisites

* Node.js version 0.10.0 or newer
* Install jspm, eslint, gulp globally

```
npm install -g jspm
npm install -g eslint
npm install -g gulp

```

### Installation

To run locally for development.

1. run `npm install`
2. run `jspm install`

### Deploying

To bundle the web app :

* Deploy Locally :
1. Serve `build` folder locally.
2. Run `gulp bundle`.
3. Run `gulp copy` to bundle the app into build folder.
4. Web app in `build` folder.

* Deploy to gh-pages :
1. Run `gulp bundle`.
2. Run `gulp copy`.
3. Deploy it to gh-pages by running `gulp deploy`.

### Running

Start a local server, e.g. `cd build; python -m SimpleHTTPServer 80` for Python 2.x or `cd build; python -m http.server 80` for Python 3.x. Then visit `http://localhost` using your browser. On some systems you may need to use a different port, e.g. 8000.

## Build

This directory contains the minified source code for production deployment.

## Structure

The repository has the following structure for each algorithm:

- There is a directory for each chapter
- Each algorithm will have a `algorithm.js` where the main logic is to be implemented.
- Each algorithm will also have a `c_algorithm.js` which will have the javascript visualization.
- The `index.html` will include both the scripts.
- The `c_algorithm.js` will use AJAX to load `algorithm.js` into `index.html` as plain text for side-by-side reference of the reader.  
- The `index.html` will also include `main.js` which contains minified version of global scripts like jQuery, angular etc
- See the [`index.html`](https://github.com/aimacode/aima-javascript/blob/master/2-Intelligent-Agents/index.html) of [chapter 2](http://ghost---shadow.github.io/aima-javascript/2-Intelligent-Agents/) for reference.

However, there will also be visualizations that do not fit into that structure:

- There may be concepts without pseudocode in the book.
- There may be multiple concepts for an algorithm.
- There may be concepts that do not correspond to a single algorithm.

# Contribution

Put the name of the chapter you want to contribute in the [Division of work](https://github.com/aimacode/aima-javascript/issues/27) thread. Please squash all commits into a single commit. Also see [CONTRIBUTION.md](CONTRIBUTION.md) for know the working status.
