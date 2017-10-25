//Basic implementation of Fisher-Yates (aka Knuth) Array Shuffle algorithm
function shuffleArray(original) {
  let arr = original.slice();
  let count = arr.length;
  let temp, rIndex;
  while (count > 0) {
    rIndex = Math.floor(Math.random() * count);
    count = count - 1;
    temp = arr[count];
    arr[count] = arr[rIndex];
    arr[rIndex] = temp;
  }
  return arr;
}

class BackTrackingAlgorithm {
  constructor(csp) {
      this.csp = csp;
      //Shuffle the variables
      //Useful when no heurisitc is involved to demonstrate different
      //situations in the algorithm
      this.variables = shuffleArray(this.csp.variables);
      //Inferences represents reductions in domains.
      //It has a list of values that CANNOT be assigned to variables.
      this.inferences = {};
      this.inferedDomains = {};
      for (let i = 0; i < this.csp.variables.length; i++) {
        this.inferences[this.csp.variables[i]] = [];
        //Copies the array
        this.inferedDomains[this.csp.variables[i]] = this.csp.domains[this.csp.variables[i]].slice();
      }
    }
    //Generator that yields states in the algorithm
    //Since its a recursive function, takes depth to keep track of how deep the
    //tree has reached.
    //Heuristics object represents which heurisitics to use
    * backtrack(depth, heuristics) {
      if (this.csp.countUnassigned() == 0) {
        yield {
          'finished': true,
          'success': true,
          'depth': depth
        };
      }
      let variable = this.selectUnassignedVariable(heuristics);
      let valueSet = this.orderDomainValues(variable, heuristics);
      //Try all values
      for (let i = 0; i < valueSet.length; i++) {
        let value = valueSet[i];
        this.csp.assign(variable, value);
        let inference = this.addInference(variable, value);
        yield {
          'finished': false,
          'depth': depth,
          'assignment': this.csp.assignment,
          'variable': variable,
          'value': value,
          'inferedDomains': this.inferedDomains
        };
        if (inference != 'failure') {
          yield * this.backtrack(depth + 1, heuristics);
        }
        this.removeInference(variable, value);
      }
      this.csp.assign(variable, this.csp.noAssignment);
      //Yield 'not successful' so it can backtrack
      yield {
        'finished': true,
        'success': false,
        'depth': depth,
        'assignment': this.csp.assignment,
        'inferedDomains': this.inferedDomains,
        'backtrack': (valueSet.length > 0)
      };
    }

  orderUnassignedVariables(heuristics) {
    let unassigned = this.variables.filter(e => this.csp.assignment[e] == this.csp.noAssignment);
    //MRV
    if (heuristics.mrv) {
      unassigned = unassigned.sort((a, b) => {
        return this.inferedDomains[a].length > this.inferedDomains[b].length;
      });
    }
    //Degree
    if (heuristics.degree) {
      unassigned = unassigned.sort((a, b) => {
        return this.csp.neighbours[a].length < this.csp.neighbours[b].length;
      })
    }
    return unassigned;
  }

  selectUnassignedVariable(heuristics) {
    return this.orderUnassignedVariables(heuristics)[0];
  }

  orderDomainValues(variable, heuristics) {
    let domain = shuffleArray(this.inferedDomains[variable]);
    //LCV Heuristics
    if (heuristics.lcv) {
      let constraintAmount = {};
      for (let i = 0; i < domain.length; i++) {
        let value = domain[i];
        let c = 0;
        for (let j = 0; j < this.csp.neighbours[variable].length; j++) {
          let neighbour = this.csp.neighbours[variable][j];
          if (this.inferedDomains[neighbour].includes(value) && this.csp.assignment[neighbour] == this.csp.noAssignment) {
            c++;
          }
        }
        constraintAmount[value] = c;
      }
      domain = domain.sort((a, b) => {
        return constraintAmount[a] > constraintAmount[b];
      });
    }
    return domain;
  }

  addInference(variable, value) {

    for (let i = 0; i < this.csp.neighbours[variable].length; i++) {
      let neighbour = this.csp.neighbours[variable][i];
      this.inferences[neighbour].push(value);
      //If value is present in domain
      let index = this.inferedDomains[neighbour].indexOf(value);
      if (index > -1) {
        //Remove it
        this.inferedDomains[neighbour].splice(index, 1);
      }
    }
    return 'success';
  }

  removeInference(variable, value) {
    //It simply recalculates inferences after removing last element from this.inferences
    //Remove the last contribution to this.inferences
    for (let i = 0; i < this.csp.neighbours[variable].length; i++) {
      let neighbour = this.csp.neighbours[variable][i];
      this.inferences[neighbour].pop();
    }
    //Reassigns inferedDomains to original csp domains
    for (let i = 0; i < this.variables.length; i++) {
      this.inferedDomains[this.variables[i]] = this.csp.domains[this.variables[i]].slice();
    }
    //Recalulate InferedDomains from inferences
    for (let i = 0; i < this.variables.length; i++) {
      let variable = this.variables[i];
      for (let j = 0; j < this.inferences[variable].length; j++) {
        let valueToRemove = this.inferences[variable][j];
        let index = this.inferedDomains[variable].indexOf(valueToRemove);
        if (index > -1) {
          this.inferedDomains[variable].splice(index, 1);
        }
      }
    }
  }

  isInInferedDomain(variable, value) {
    return (this.inferedDomains[variable].includes(value));
  }
}
