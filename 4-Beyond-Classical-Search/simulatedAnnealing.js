class SimulatedAnnealing {
  constructor(hill, initial, schedule, T, w, k) {
    this.states = hill.getStates();
    this.initial = initial;
    //Schedule is a function that maps time with Temperature
    this.schedule = schedule;
    this.T = T;
    this.w = w;
    this.current = this.initial;
    this.k = k;
  }

  * anneal() {
    for (let t = 0; t < this.T; t++) {
      let temperature = this.schedule(t);
      if (temperature == 0) {
        return {
					state : this.current,
					temp : temperature
      	};
			}
      let nextState = this.getRandomState();
      let diff = this.states[nextState] - this.states[this.current];
      if (diff > 0) {
        this.current = nextState;
      } else {
        let p = Math.exp((diff) / parseInt(this.k*temperature));
        if (Math.random() < p) {
          this.current = nextState;
        }
      }
			yield {
				state : this.current,
				temp : temperature
    	};
		}
		return {
			state : this.current,
			temp : 0
		};
  }
  getRandomState() {
    let mini = Math.max(0, this.current - this.w);
    let maxi = Math.min(this.states.length, this.current + this.w);
    return Math.floor(Math.random() * (maxi - mini + 1)) + mini;
  }
}
