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
    return 'actor';
  }

  isIntersect(actor) {
    if (!(actor instanceof Actor) ||
        actor === undefined) {
          throw Error('arguments error');
        }
    if (actor === this) {
      return false;
    }

    if (((actor.top > this.top && actor.bottom < this.bottom) ||
        (actor.left > this.left && actor.right < this.right))) {
          return true;
    }
    return false;
  }
}
