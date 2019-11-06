class mapColoringProblem {
  constructor(variables, domains, neighbours, condition) {
      this.noAssignment = 'nc'
      this.variables = variables;
      this.domains = domains;
      this.neighbours = neighbours;
      this.condition = condition;
      this.assignment = {};
      this.emptyAssignment();
    }
    //Assigns value 'a' to variable 'A'

  assign(A, a) {
    this.assignment[A] = a;
  }

  isAssigned(A, a) {
    return (this.assignment[A] == a);
  }

  emptyAssignment() {
    for (let i = 0; i < this.variables.length; i++) {
      //'nc' represents No assignment
      this.assignment[this.variables[i]] = this.noAssignment;
    }
  }

  countUnassigned() {
    let answer = 0;
    for (let i = 0; i < this.variables.length; i++) {
      //'nc' represents No assignment
      if (this.assignment[this.variables[i]] == this.noAssignment) {
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

  isInDomain(variable, value) {
    return this.domains[variable].includes(value);
  }

  removeFromDomain(variable, value) {
    this.domains[variable] = this.domains[variable].filter(e => e !== value);
  }

  addToDomain(variable, value) {
    this.domains[variable].push(value);
  }

  getAssignments() {
    let assignment = {};
    for (let variable in this.assignment) {
      assignment[variable] = this.assignment[variable];
    }
    return assignment;
  }
}
