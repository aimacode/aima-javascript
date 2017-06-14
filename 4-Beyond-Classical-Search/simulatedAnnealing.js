class SimulatedAnnealing {
  constructor(hill, initial, k) {
    this.states = hill.getStates();
    this.initial = initial;
    this.current = this.initial;
    this.k = k;
  }

  anneal(temperature) {
    let nextState = this.getRandomState();
    let diff = this.states[nextState] - this.states[this.current];
    if (diff > 0) {
      this.current = nextState;
    } else {
      let p = Math.exp((diff) / parseInt(this.k * temperature));
      if (Math.random() < p) {
        this.current = nextState;
      }
    }
    return {
      state: this.current,
      temp: temperature
    };
  }
  getRandomState() {
    let mini = 0;
    let maxi = this.states.length;
    return Math.floor(Math.random() * (maxi - mini + 1)) + mini;
  }
}
