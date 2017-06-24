class mapColoringProblem {
  constructor(variables, domains, neighbours, condition) {
      this.variables = variables;
      this.domains = domains;
      this.neighbours = neighbours;
      this.condition = condition;
      this.assignment = {};
      this.emptyAssignment();
    }
    //Assigns value 'a' to variable 'A'
  assign(A, a) {
    //Check if given value is in domain
    let domain = this.domains[A];
    if (domain.includes(a)) {
      this.assignment[A] = a;
      return true;
    } else {
      return false;
    }
  }

  emptyAssignment() {
    for (let i = 0; i < this.variables.length; i++) {
      //'NIL' represents No assignment
      this.assignment[this.variables[i]] = 'nc';
    }
  }

  countUnassigned() {
    let answer = 0;
    for (let i = 0; i < this.variables.length; i++) {
      //'NIL' represents No assignment
      if (this.assignment[this.variables[i]] == 'nc') {
        answer++;
      };
    }
    return answer;
  }

  checkConsistency() {
    //'consistence' is true if the current assignment is correct
    //inconsistencies contains the list of neighbours that violate the condition
    let answer = {
      'consistent': true,
      'inconsistencies': []
    }

    for (let i = 0; i < this.variables.length; i++) {
      let variable = this.variables[i];
      for (let j = 0; j < this.neighbours[variable].length; j++) {
        let neighbour = this.neighbours[variable][j];
        if (!this.condition(variable, this.assignment[variable], neighbour, this.assignment[neighbour])) {
          answer['consistent'] = false;
          answer['inconsistencies'].push([variable, neighbour]);
        }
      }
    }
    return answer;
  }

}

//Map Coloring Problem for Australia
var australiaMapColoringProblem = new mapColoringProblem(
  ["WA", "NT", "SA", "Q", "NSW", "V", "T"], {
    "WA": ["r", "g", "b"],
    "NT": ["r", "g", "b"],
    "SA": ["r", "g", "b"],
    "Q": ["r", "g", "b"],
    "NSW": ["r", "g", "b"],
    "V": ["r", "g", "b"],
    "T": ["r", "g", "b"]
  }, {
    "WA": ["NT", "SA"],
    "NT": ["WA", "SA", "Q"],
    "SA": ["WA", "NT", "Q", "NSW", "V"],
    "Q": ["NT", "SA", "NSW"],
    "NSW": ["Q", "SA", "V"],
    "V": ["SA", "NSW"],
    "T": []
  },
  function(A, a, B, b) {
    //If no color
    if (a == 'nc' || b == 'nc') {
      return true;
    }
    return a != b;
  });
