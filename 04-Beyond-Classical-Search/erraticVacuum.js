class VacuumWorld {
  constructor(floorCount) {
    this.floorCount = (floorCount == undefined) ? 2 : floorCount;
    this.dirt = new Array(this.floorCount).fill(false);
    this.robotLocation = 0;
  }

  moveLeft() {
    this.robotLocation = Math.max(this.robotLocation - 1, 0);
  }

  moveRight() {
    this.robotLocation = Math.min(this.robotLocation + 1, this.floorCount - 1);
  }

  clean(i) {
    if (i >= 0 && i < this.floorCount) {
      this.dirt[i] = false;
    }
  }

  makeDirt(i) {
    if (i >= 0 && i < this.floorCount) {
      this.dirt[i] = true;
    }
  }

  suck() {
    this.clean(this.robotLocation);
  }

  randomize() {
    for (let i = 0; i < this.floorCount; i++) {
      this.dirt[i] = (Math.random() < 0.5);
    }
    this.robotLocation = Math.floor(Math.random() * this.floorCount);
  }
}

class ErraticWorld extends VacuumWorld {

  constructor(floorCount) {
    super(floorCount);
  }

  erraticSuck() {
    let i = this.robotLocation;
    if (this.dirt[i]) {
      //If the tile is dirty,
      this.clean(i);
      if (Math.random() < 0.75) {
        //Clean up adjacent tiles with 50% probability
        this.clean(i - 1);
      }
      if (Math.random() < 0.75) {
        //Clean up adjacent tiles with 50% probability
        this.clean(i + 1);
      }
    } else {
      //if tile clean
      if (Math.random() < 0.75) {
        //Make the tile dirty with 50% probability
        this.makeDirt(i);
      }
    }

  }
};
