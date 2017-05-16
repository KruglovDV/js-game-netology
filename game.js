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
    this.act = function(){};
    this._type = 'actor';
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
    if ( ((actor.top >= this.top && actor.top <= this.bottom) &&
          ((actor.left >= this.left && actor.left <= this.right) ||
          (actor.right >= this.left && actor.right <= this.right))) ||
         ((actor.bottom >= this.top && actor.bottom <= this.bottom) &&
          ((actor.left >= this.left && actor.left <= this.right) ||
          (actor.right >= this.left && actor.right <= this.right)))) {
      if ((actor.top === this.bottom) ||
          (actor.bottom === this.top ) ||
          (actor.left === this.right) ||
          (actor.right === this.left) ) {
        return false;
      }
     return true;
    }
    return false;
  }
}

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
    const bottom = nextPos.y + size.y;
    const rigth = nextPos.x + size.x
    const top = nextPos.y;
    const left = nextPos.x;
    if (!(nextPos instanceof Vector) || !(size instanceof Vector)) {
      throw Error('arguments error');
    }

    if (left < 0 || rigth > this.width || top < 0 || nextPos.x % 2 > 0 || nextPos.y % 2 > 0) {
      return 'wall';
    }
    if (bottom > this.height) {
      return 'lava';
    }

    if(this.grid[nextPos.y][nextPos.x] === 'lava' || this.grid[nextPos.y][nextPos.x] === 'wall') {
      return this.grid[nextPos.y][nextPos.x];
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
    if (this.status != null) return;

    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    } else if (type === 'coin') {
      this.actors = this.actors.filter(el => el !== actor);
      if (this.actors.length === 0) {
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

const schema = [
  '         ',
  '         ',
  '         ',
  '         ',
  '     !xxx',
  ' @       ',
  'xxx!     ',
  '         '
];
const actorDict = {
  '@': Player
}
const parser = new LevelParser(actorDict);
const level = parser.parse(schema);
runLevel(level, DOMDisplay);
