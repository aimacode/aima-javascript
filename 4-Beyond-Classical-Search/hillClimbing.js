class Hill {

  getRandomValues() {
    this.spacing = 10;
    this.random = [];
    for (let i = 0; i < this.spacing + 1; i++) {
      this.random.push(Math.floor(Math.random() * (100 - 5 + 1) + 5));
    }
  }
  f(i) {
    let x1 = Math.floor(i / this.spacing);
    let x2 = Math.ceil(i / this.spacing);
    let interAmount = (i % this.spacing) / this.spacing;
    let n1 = this.random[x1];
    let n2 = this.random[x2];
    let k = 0.5 - 0.5 * Math.cos(interAmount * Math.PI);
    let ans = (1 - k) * n1 + k * n2;
    return ans;
  }

  generateRandomHill() {
    this.getRandomValues();
    let states = [];
    for (let i = 0; i < 100; i++) {
      states.push(this.f(i));
    }
    return states;
  }

  constructor(states) {
    this.states = (states !== undefined) ? states : this.generateRandomHill();
  }

  getStates() {
    return this.states;
  }
  getObjective(i) {
    return this.states[i];
  }

  getBestStates() {
    let bestStates = [];
    let max = Math.max.apply(Math, this.states);
    for (let i = 0; i < this.states.length; i++) {
      if (this.states[i] == max) {
        bestStates.push(i);
      }
    }
    return bestStates;
  }

}

class HillClimber {

  constructor(hill) {
    this.hill = hill;
    this.currentState = Math.floor(Math.random() * (this.hill.getStates().length));
  }

  changeState(i) {
    this.currentState = i;
  }
  getCurrentState() {
    return this.currentState;
  }

  decideNewState(options) {
    let answer = options[0];
    for (let i = 1; i < options.length; i++) {
      let option = options[i];
      if (this.hill.getObjective(answer) < this.hill.getObjective(option)) {
        answer = option;
      }
    }
    return answer;
  }

  //For hillclimbSearch
  getNewState() {
    let currentState = this.currentState;
    let options = [];
    options.push(currentState);
    if (currentState + 1 < this.hill.getStates().length) {
      options.push(currentState + 1);
    }
    if (currentState - 1 >= 0) {
      options.push(currentState - 1);
    }
    return this.decideNewState(options);
  }

  * climb() {
    let newState = this.getNewState();
    while (this.currentState != newState) {
      yield newState;
      newState = this.getNewState();
    }
    return newState;
  }
}
