/**
 *  HTML SNAKE GAME
 *
 *  Copyright 2019 Aarón Nadal
 *
 *  PUBLISHED UNDER MIT LICENSE
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 *  and associated documentation files (the "Software"), to deal in the Software without restriction,
 *  including without limitation the rights to use, copy, modify, merge, publish, distribute,
 *  sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies or
 *  substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 *  NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 *  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

"use strict";

/**
 * HtmlElement Constructor
 * 
 * Represents an object with one HTML <div> assigned.
 */
function HtmlElement() {
    Object.defineProperty(
        this,
        'element',
        {
            value:         document.createElement('div'),
            writable:      false,
            enumerable:    true,
            configurable : false
        }
    );
}

/**
 * Inserts one HtmlElement inside another HtmlElement.
 */
HtmlElement.prototype.append = function(child) {
    this.element.appendChild(child.element)
}

/**
 * Removes the HtmlElement and all its children from the DOM.
 */
HtmlElement.prototype.remove = function() {
    this.element.remove();
}



/**
 * Item Constructor
 * Extends HtmlComponent
 * 
 * An Item is anything that can be in the Scenario.
 */
function Item(x, y) {
    HtmlElement.call(this);

    /**
     * Item x coordinate.
     */
    Object.defineProperty(
        this,
        'x',
        {
            value:         x || 0,
            writable:      true,
            enumerable:    true,
            configurable : true
        }
    );

    /**
     * Item y coordinate
     */
    Object.defineProperty(
        this,
        'y',
        {
            value:         y || 0,
            writable:      true,
            enumerable:    true,
            configurable : true
        }
    );
}
Item.prototype             = Object.create(HtmlElement.prototype);
Item.prototype.constructor = Item;



/**
 * Snake Constructor
 * Extends Item
 * 
 * A snake. It can move and eat meals.
 */
function Snake(length, direction, speed, x, y) {
    length = length || 1;
    if(length <= 0) {
        throw new RangeError('Length cannot be lower than 1');
    }

    const D   = Snake.prototype.DIRECTIONS;
    direction = direction || D.TOP;
    if(direction !== D.TOP && direction !== D.RIGHT && direction !== D.BOTTOM && direction !== D.LEFT) {
        throw new RangeError('Direction shoud be one constant defined in Snake.prototype.DIRECTIONS');
    }

    Item.call(this, x, y);

    /**
     * Returns the SnakeLinks.
     */
    Object.defineProperty(
        this,
        'links',
        {
            value:      [],
            enumerable: true,
        }
    );

    /**
     * Returns the first SnakeLink.
     */
    Object.defineProperty(
        this,
        'first',
        {
            get:        () => this.links[0],
            enumerable: true,
        }
    );

    /**
     * Returns the last SnakeLink.
     */
    Object.defineProperty(
        this,
        'last',
        {
            get:        () => this.links.slice(-1).pop(),
            enumerable: true,
        }
    );

    /**
     * Returns the x position of its first link.
     */
    Object.defineProperty(
        this,
        'x',
        {
            get:        () => this.first.x,
            enumerable: true,
        }
    );

    /**
     * Returns the y position of its first link.
     */
    Object.defineProperty(
        this,
        'y',
        {
            get:        () => this.first.y,
            enumerable: true,
        }
    );

    /**
     * Returns the direction.
     */
    Object.defineProperty(
        this,
        'direction',
        {
            get:        ()      => direction,
            set:        (value) => {
                if(direction === D.TOP    && value === D.BOTTOM) return;
                if(direction === D.BOTTOM && value === D.TOP)    return;
                if(direction === D.RIGHT  && value === D.LEFT)   return;
                if(direction === D.LEFT   && value === D.RIGHT)  return;

                direction = value;
            },
            enumerable: true,
        }
    );

    /**
     * Returns the number of links of the Snake.
     */
    Object.defineProperty(
        this,
        'length',
        {
            get:        () => links.length,
            enumerable: true,
        }
    );

    /**
     * Returns the Snake speed, in steps per minute.
     */
    Object.defineProperty(
        this,
        'speed',
        {
            value:      speed,
            writable:   true,
            enumerable: true,
        }
    );

    // Create the links depending on the length.
    for(let i = 0; i < length; i++) {
        this.append(new SnakeLink(direction, x, y++));
    }
}
Snake.prototype             = Object.create(Item.prototype);
Snake.prototype.constructor = Snake;
Object.defineProperty(
    Snake.prototype,
    'DIRECTIONS',
    {
        value:      {
            TOP:    'top',
            RIGHT:  'right',
            BOTTOM: 'bottom',
            LEFT:   'left',
        },
        enumerable: true,
    }
);

/**
 * Overrides the append method from HtmlElement.
 * Inserts one SnakeLink inside the Snake.
 */
Snake.prototype.append      = function(child) {
    if(!child instanceof SnakeLink) {
        throw TypeError('Childs of Snake must be SnakeLink instances');
    }

    Item.prototype.append.call(this, child);
    this.links.push(child);
};

/**
 * Moves the snake one step further.
 */
Snake.prototype.move = function() {
    // Calculate the new coordinates depending on the direction.
    let xDiff = 0;
    let yDiff = 0;
    if(this.direction === Snake.prototype.DIRECTIONS.TOP)    yDiff = -1;
    if(this.direction === Snake.prototype.DIRECTIONS.BOTTOM) yDiff = 1;
    if(this.direction === Snake.prototype.DIRECTIONS.RIGHT)  xDiff = 1;
    if(this.direction === Snake.prototype.DIRECTIONS.LEFT)   xDiff = -1;

    let x         = this.x + xDiff;
    let y         = this.y + yDiff;
    let direction = this.direction;
    let fat       = false;

    // Loop over the links and move all them one step forward.
    // The first link will be moved to the new coordinates.
    // The second one, will be moved to the coordinates where the first one was.
    // The third will take the place of the second.
    // And so on.
    for(let i = 0; i < this.links.length; i++) {
        const link = this.links[i];

        const xTmp         = link.x;
        const yTmp         = link.y;
        const directionTmp = link.direction;
        const fatTmp       = link.fat;

        link.x         = x;
        link.y         = y;
        link.direction = direction;
        link.fat       = fat;

        x         = xTmp;
        y         = yTmp;
        direction = directionTmp;
        fat       = fatTmp;
    }
};

/**
 * Checks if the Snake can eat a Meal.
 */
Snake.prototype.canEat = function(meal) {
    if(!meal instanceof Meal) {
        throw TypeError('Snake only likes eating instances of Meal!');
    }

    return meal.x === this.x && meal.y === this.y;
};

/**
 * Creates a new link which will be appended at the end of the Snake to make it one link longer.
 */
Snake.prototype.createGrowLink = function() {
    const lastLink = this.last;
    const newLink  = new SnakeLink(lastLink.direction, lastLink.x, lastLink.y);

    return newLink;
};



/**
 * SnakeLink Constructor
 */
function SnakeLink(direction, x, y) {
    Item.call(this, x, y);

    Object.defineProperty(
        this,
        'direction',
        {
            value:      direction,
            writable:   true,
            enumerable: false,
        }
    );

    /**
     * Determines if the SnakeLink is fat because it has a meal inside or not.
     */
    Object.defineProperty(
        this,
        'fat',
        {
            value:      false,
            writable:   true,
            enumerable: false,
        }
    );
}
SnakeLink.prototype             = Object.create(Item.prototype);
SnakeLink.prototype.constructor = SnakeLink;



/**
 * Meal Constructor
 */
function Meal(x, y) {
    Item.call(this, x, y);

    const type = Meal.prototype.TYPES[Math.floor(Math.random() * Meal.prototype.TYPES.length)];
    Object.defineProperty(
        this,
        'type',
        {
            value:      type,
            writable:   false,
            enumerable: true,
        }
    );
}
Meal.prototype             = Object.create(Item.prototype);
Meal.prototype.constructor = Meal;
Meal.prototype.TYPES       = ['apple', 'pear', 'orange', 'banana', 'kiwi', 'plum', 'strawberry'];



/**
 * Scenario Constructor
 */
function Scenario(snake, width, height) {
    if(!snake instanceof Snake) {
        throw TypeError('The snake of any Scenario must be an instance of Snake!');
    }

    Item.call(this);

    Object.defineProperty(
        this,
        'snake',
        {
            value:      snake,
            writable:   false,
            enumerable: true,
        }
    );

    const meals = [];
    Object.defineProperty(
        this,
        'meals',
        {
            value:      meals,
            writable:   false,
            enumerable: true,
        }
    );

    this.addMeal = function(meal) {
        if(!meal instanceof Meal) {
            throw TypeError('Must be a Meal!');
        }

        this.meals.push(meal);
        this.append(meal);
    }

    this.removeMeal = function(index) {
        if(!Number.isInteger(index)) {
            throw TypeError('Must be a valid index!');
        }

        const removed = this.meals.splice(index, 1);
        removed.map((meal) => meal.remove());
    }

    Object.defineProperty(
        this,
        'width',
        {
            value:      width,
            writable:   false,
            enumerable: true,
        }
    );

    Object.defineProperty(
        this,
        'height',
        {
            value:      height,
            writable:   false,
            enumerable: true,
        }
    );

    this.append(this.snake);
}
Scenario.prototype               = Object.create(HtmlElement.prototype);
Scenario.prototype.constructor   = Scenario;
Scenario.prototype.somethingAt = function(x, y) {
    for(let i = 0; i < this.snake.links.length; i++) {
        if(this.snake.links[i].x === x && this.snake.links[i].y === y) {
            return true;
        }
    }

    for(let i = 0; i < this.meals.length; i++) {
        if(this.meals[i].x === x && this.meals[i].y === y) {
            return true;
        }
    }

    return false;
}
Scenario.prototype.addRandomMeal = function() {
    let x, y;
    do {
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
    }
    while(this.somethingAt(x, y));

    const meal = new Meal(x, y);
    this.addMeal(meal);
}



function ScenarioHtmlRenderer(scenario) {
    if(!scenario instanceof Scenario) {
        throw TypeError('The scenario must be an instance of Scenario!');
    }

    this.scenario = scenario;
    this.snake    = scenario.snake;
    this.links    = scenario.snake.links;
    this.meals    = scenario.meals;

    this.scenario.element.className    = 'scenario';
    this.scenario.element.style.width  = scenario.width + 'em';
    this.scenario.element.style.height = scenario.height + 'em';

    document.body.appendChild(this.scenario.element);
}
ScenarioHtmlRenderer.prototype.render = function() {
    // Render snake
    this.snake.element.className = 'snake ' + this.snake.direction;

    let nextDir = null;
    for(let i = 0; i < this.links.length; i++) {
        const link = this.links[i];

        if(nextDir) {
            link.element.setAttribute('data-next-dir', nextDir);
            nextDir = null;
        }
        else {
            link.element.removeAttribute('data-next-dir');
        }

        if(link.previousDirection) {
            if(link.direction !== link.previousDirection) {
                nextDir = link.direction;
            }
        }
        link.previousDirection = link.direction;

        link.element.className  = 'snake-link ' + link.direction + (link.fat ? ' fat' : '');
        link.element.style.top  = link.y + 'em';
        link.element.style.left = link.x + 'em';
    }

    for(let j = 0; j < this.meals.length; j++) {
        const meal = this.meals[j];

        meal.element.className  = 'meal ' + meal.type;
        meal.element.style.top  = meal.y + 'em';
        meal.element.style.left = meal.x + 'em';
    }
};



/**
 * Is the item going to be moved in this iteration?
 * 
 * @param int itemSpeed       Item speed in steps per minute.
 * @param int iteration       Current iteration in the loop
 * @param int refreshInterval Frame refresh interval in milliseconds 
 */
function moveItemInCurrentIteration(itemSpeed, iteration, refreshInterval) {
    const movementInterval  = 1000 / (itemSpeed / 60);
    const movementModule    = Math.ceil(movementInterval / refreshInterval);
    const move              = 0 == iteration % (movementModule);
    
    return move;
}



/**
 * Attaches the event handlers for moving the Snake.
 */
function attachMoveEvents(snake) {
    const isUp = (evt) => {
        if(evt.type === 'keydown' && evt.code === 'ArrowUp') {
            return true;
        }

        if(evt.type === 'touchend') {
            const touch = evt.changedTouches[0];
            if(document.lastTouchY > touch.pageY && Math.abs(document.lastTouchX - touch.pageX) < 100) {
                return true;
            }
        }

        return false;
    }

    const isDown = (evt) => {
        if(evt.type === 'keydown' && evt.code === 'ArrowDown') {
            return true;
        }

        if(evt.type === 'touchend') {
            const touch = evt.changedTouches[0];
            if(document.lastTouchY < touch.pageY && Math.abs(document.lastTouchX - touch.pageX) < 100) {
                return true;
            }
        }

        return false;
    }

    const isLeft = (evt) => {
        if(evt.type === 'keydown' && evt.code === 'ArrowLeft') {
            return true;
        }

        if(evt.type === 'touchend') {
            const touch = evt.changedTouches[0];
            if(document.lastTouchX > touch.pageX && Math.abs(document.lastTouchY - touch.pageY) < 100) {
                return true;
            }
        }

        return false;
    }

    const isRight = (evt) => {
        if(evt.type === 'keydown' && evt.code === 'ArrowRight') {
            return true;
        }

        if(evt.type === 'touchend') {
            const touch = evt.changedTouches[0];
            if(document.lastTouchX < touch.pageX && Math.abs(document.lastTouchY - touch.pageY) < 100) {
                return true;
            }
        }

        return false;
    }

    const handler = (evt) => {
        evt.preventDefault();

        if(evt.type === 'touchstart') {
            document.lastTouchX = evt.changedTouches[0].pageX;
            document.lastTouchY = evt.changedTouches[0].pageY;
            return;
        }

        if(isUp(evt)) {
            snake.direction = Snake.prototype.DIRECTIONS.TOP;
        }

        else if(isDown(evt)) {
            snake.direction = Snake.prototype.DIRECTIONS.BOTTOM;
        }

        else if(isLeft(evt)) {
            snake.direction = Snake.prototype.DIRECTIONS.LEFT;
        }

        else if(isRight(evt)) {
            snake.direction = Snake.prototype.DIRECTIONS.RIGHT;
        }
    }

    document.addEventListener('keydown', handler);
    document.addEventListener('touchstart', handler, {passive: false});
    document.addEventListener('touchmove', handler, {passive: false});
    document.addEventListener('touchend', handler, {passive: false});
}



/**
 * Starts the game.
 */
function start(renderer, refreshInterval) {
    const scenario = renderer.scenario;
    const snake    = scenario.snake;
    scenario.addRandomMeal();
    attachMoveEvents(snake);

    let growLink = null;
    let loop     = null;
    if(loop === null) {
        renderer.iteration = 0;

        const step = function() {
            renderer.iteration++;

            let somethingMoved = false;

            if(moveItemInCurrentIteration(snake.speed, renderer.iteration, refreshInterval)) {
                snake.move();
                somethingMoved = true;

                scenario.meals.forEach(meal => {
                    if(snake.canEat(meal)) {
                        meal.remove();
                        snake.first.fat = true;
                    }
                });

                if(growLink) {
                    snake.append(growLink);
                    growLink = null;
                }

                if(snake.first.fat) {
                    scenario.addRandomMeal();
                    snake.speed = snake.speed + 10;
                }

                if(snake.last.fat) {
                    growLink = snake.createGrowLink();
                }
            }

            if(somethingMoved) {
                renderer.render();
            }

            loop = setTimeout(step, refreshInterval);
        };
        loop = setTimeout(step, refreshInterval);
    }
}



/**
 * On load callback. Logic initialization.
 */
function init() {
    const snake    = new Snake(3, Snake.prototype.DIRECTIONS.TOP, 350, 25, 25);
    const scenario = new Scenario(snake, 51, 51);
    const renderer = new ScenarioHtmlRenderer(scenario);

    renderer.render();
    
    const letsStart = (evt) => {
        if(evt.type === 'touchstart' || (evt.type === 'keydown' && evt.code === 'ArrowUp')) {
            document.removeEventListener('keydown', letsStart);
            document.removeEventListener('touchstart', letsStart);
            start(renderer, 200);
        }
    };
    document.addEventListener('keydown', letsStart);
    document.addEventListener('touchstart', letsStart);

    window.scenario = scenario;

    document.body.appendChild(scenario.element);
}


