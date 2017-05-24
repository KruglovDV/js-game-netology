'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (vector instanceof Vector) {
      const x = this.x + vector.x;
      const y = this.y + vector.y;
      return new Vector(x, y);
    }
    throw new Error('Можно прибавлять к вектору только вектор типа ');
  }

  times(multiplier) {
    const x = this.x * multiplier;
    const y = this.y * multiplier;
    return new Vector(x, y);
  }
}

class Actor {
  constructor(pos = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
    if (!(pos instanceof Vector) ||
        !(size instanceof Vector) ||
        !(speed instanceof Vector)) {
          throw Error('arguments error');
        }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
    this._type = 'actor';
  }

  act() {

  }

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  get type() {
    return this._type;
  }

  isIntersect(actor) {
    if (!(actor instanceof Actor) ||
        actor === undefined) {
          throw Error('arguments error');
        }
    if (actor === this) {
      return false;
    }
    if (actor.size.x < 0 || actor.size.y < 0) {
      return false;
    }


      // actor === player!!!!

    if ( ((actor.top >= this.top && actor.top <= this.bottom) &&
          ((actor.left >= this.left && actor.left <= this.right) ||
          (actor.right >= this.left && actor.right <= this.right))) ||
         ((actor.bottom >= this.top && actor.bottom <= this.bottom) &&
          ((actor.left >= this.left && actor.left <= this.right) ||
          (actor.right >= this.left && actor.right <= this.right))) ||
            (this.top > actor.top && this.bottom < actor.bottom && (this.left <= actor.right && this.right >= actor.right)) ||
          (this.top > actor.top && this.bottom < actor.bottom && (this.right >= actor.left && this.left <= actor.left)) ||
        (this.top > actor.top && this.bottom < actor.bottom && this.left >= actor.left && this.right <= actor.right))

     {

      if ((actor.top === this.bottom) || (actor.bottom === this.top ) ||
          (actor.left === this.right) || (actor.right === this.left) ) {
        return false;
      }
     return true;
    }
    return false;
  }
}

const isInteger = (num) => {
  return num - Math.floor(num) !== 0 ? false : true;
};

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.height = grid.length;
    this.width = grid.reduce((acc, el) => el.length > acc ? el.length : acc, 0);
    this.status = null;
    this.finishDelay = 1;
    this.player = actors.find(el => el.type === 'player');
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0 ? true : false;
  }

  actorAt(actor) {
    if (!actor || !(actor instanceof Actor)) {
      throw Error('arguments error');
    }
   return this.actors.find(el => el.isIntersect(actor));
  }

  obstacleAt(nextPos, size) {
    if (!(nextPos instanceof Vector) || !(size instanceof Vector)) {
      throw Error('arguments error');
    }
    const grid = this.grid;
    const x = nextPos.x;
    const y = nextPos.y;
    const left = Math.floor(x);
    const top = Math.floor(y);
    const bottom = Math.floor(y + size.y);
    const rigth = Math.floor(x + size.x);
    const isPlaier = !isInteger(size.x);

    if (isPlaier) {

      if (grid[bottom] && grid[bottom][left] &&
            (grid[bottom][left] === 'lava' || grid[bottom][left] === 'wall')) {
              return grid[bottom][left];
        }
      if (grid[top] && grid[top][left] &&
          (grid[top][left] === 'lava' || grid[top][left] === 'wall')) {
            return grid[top][left];
        }
      if (grid[top] && grid[top][rigth] &&
          (grid[top][rigth] === 'lava' || grid[top][rigth] === 'wall')) {
            return grid[top][rigth];
        }
      if (grid[bottom] && grid[bottom][rigth] &&
            (grid[bottom][rigth] === 'lava' || grid[bottom][rigth] === 'wall')) {
              return grid[bottom][rigth];
        }
    } else {
      if (isInteger(nextPos.x)) {
        if (grid[top] && grid[top][left] &&
           ((grid[top][left] === 'wall') || (grid[top][left] === 'lava'))) {
          return grid[top][left];
        }

        if (grid[bottom] && grid[bottom][left] &&
           ((grid[bottom][left] === 'wall') || (grid[bottom][left] === 'lava'))) {
          return grid[bottom][x];
        }
      } else {
        if (grid[top] && grid[top][left] &&
           ((grid[top][left] === 'wall') || (grid[top][left] === 'lava'))) {
          return grid[top][left];
        }

        if (grid[top] && grid[top][rigth] &&
           ((grid[top][rigth] === 'wall') || (grid[top][rigth] === 'lava'))) {
          return grid[top][rigth];
        }
      }
    }

    if (left < 0 || nextPos.x + size.x > this.width || top < 0) {
      return 'wall';
    }
    if (nextPos.y + size.y > this.height) {
      return 'lava';
    }
  }

  removeActor(actor) {
    this.actors = this.actors.filter(el => el !== actor);
  }

  noMoreActors(type) {
    const result = this.actors.filter(el => el.type === type);
    return result.length > 0 ? false : true;
  }

  playerTouched(type, actor) {
    if (this.status !== null) {
      return;
    }
    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    } else if (type === 'coin') {
      this.removeActor(actor);
      if (!this.actors.find(el => el.type === 'coin')) {
        this.status = 'won';
      }
    }
  }
}

class LevelParser {
  constructor(entities) {
    this.entities = entities;
  }

  actorFromSymbol(entiti) {
    if (!entiti) return;
    const key = Object.keys(this.entities).find(key => key === entiti);
    return key ? this.entities[key] : key;
  }

  obstacleFromSymbol(entiti) {
    switch(entiti) {
      case 'x': return 'wall';
      case '!': return 'lava';
      default: return;
    }
  }

  createGrid(masOfString) {
    return masOfString.map(str => str.split('').map(el => {
      if(el === '!') {
        return 'lava';
      } else if (el === 'x') {
        return 'wall';
      }
    }));
  }

  createActors(masOfActors) {
    const mas = masOfActors.map(str => str.split(''));
    const actors = [];
    mas.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (this.entities !== undefined && this.entities[cell] !== undefined) {
          actors.push(new this.entities[cell](new Vector(x, y)));
        }
      });
    });
    return actors;
  }

  parse(plan) {
    const grid = this.createGrid(plan);
    const actors = this.createActors(plan);
    return new Level(grid, actors);
  }
}

class Player extends Actor {
  constructor(location) {
    super(location, new Vector(0.8, 1.5));
    this._type = 'player';
    this.pos.y -= 0.5;
  }
}

class Fireball extends Actor {
  constructor(location = new Vector(), speed = new Vector()) {
    super(location, undefined, speed);
    this._type = 'fireball';
  }

  act(time, level) {
    const nextPos = this.getNextPosition(time);
    const obj = level.obstacleAt(nextPos, this.size);
    if (obj) {
      this.handleObstacle();
      return;
    }
    this.pos = nextPos;
  }

  getNextPosition(time = 1) {
    return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
  }

  handleObstacle() {
    if (this.speed.x > 0 || this.speed.y > 0) {
      this.speed.x = -this.speed.x;
      this.speed.y = -this.speed.y;
    } else {
      this.speed.x = Math.abs(this.speed.x);
      this.speed.y = Math.abs(this.speed.y);
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(location) {
    super(location, new Vector(2, 0));
  }
}

class VerticalFireball extends Fireball {
  constructor(location) {
    super(location, new Vector(0, 2));
  }
}

class FireRain extends Fireball {
  constructor(location) {
    super(location, new Vector(0, 3));
    this.start = location;
  }

  handleObstacle() {
    this.pos = this.start;
  }
}

class Coin extends Actor {
  constructor(location = new Vector()) {
    super(location, new Vector(0.6, 0.6));
    this.pos.x += 0.2;
    this.pos.y += 0.1;
    this._type = 'coin';
    this.location = location;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * (Math.PI * 2);
  }

  act(time) {
    const next = this.getNextPosition(time);
    this.pos = next;
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    const newVector = this.getSpringVector();
    return new Vector(this.location.x + newVector.x, this.location.y + newVector.y);
  }
}

const schemas = [
  [
    '         ',
    '       | ',
    '         ',
    '    =    ',
    ' o@o ooo',
    'oo oo xxx',
    'xxxxx    ',
    '         '
  ],
  [
    '      v  ',
    '         ',
    '  v      ',
    '        o',
    '@       x',
    '    x    ',
    'x        ',
    '         '
  ]
];
const actorDict = {
  '@': Player,
  'v': FireRain,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'o': Coin
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => alert('Вы выиграли приз!'));
