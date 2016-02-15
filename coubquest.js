/**
 * function for extending class
 * @param Child
 * @param Parent
 */
function extend(Child, Parent) {
    var F = function () {
    }
    F.prototype = Parent.prototype
    Child.prototype = new F()
    Child.prototype.constructor = Child
    Child.superclass = Parent.prototype
};

/**
 * convert digito to color
 * @param code color code (1 - 10)
 * @returns {*} color code
 */
function codeToColor(code) {
    switch (code) {
        case 1:
            return '#6c7600';
        case 2:
            return '#34760e';
        case 3:
            return '#297673';
        case 4:
            return '#453f76';
        case 5:
            return '#762975';
        case 6:
            return '#766659';
        case 7:
            return '#76251c';
        case 8:
            return '#e96a13';
        case 9:
            return '#53e923';
        case 0:
            return '#717be9';
    }
}

/**
 * represent moving vector
 * @param x start row on gemafield
 * @param y start column on gamefield
 * @param direction direction 1.2.3.4
 * @param length lengt for moving object
 * @constructor
 */
function Vector(x, y, direction, length) {
    this.x = x;
    this.y = y;
    if (length == undefined) {
        this.length = 1;
    } else {
        this.length = length;
    }
    this.direction = direction;

    /**
     * get next relation coordinats using direction
     * @returns {{x: *, y: *}|*}
     */
    this.getEndPoint = function () {
        result = {'x': this.x, 'y': this.y};
        switch (this.direction) {
            case 1 :
            {
                result['x'] = result['x'] - this.length
            }
                break;
            case 2 :
            {
                result['y'] = result['y'] + this.length
            }
                break;
            case 3 :
            {
                result['x'] = result['x'] + this.length
            }
                break;
            case 4 :
            {
                result['y'] = result['y'] - this.length
            }
                break;
        }
        return result;
    }
}

/**
 * Gamefield
 * @constructor
 */
function Gamefield() {
    /**
     * render empty gamefield on page and assign cell id
     * @param rows count ow rows
     * @param cols cont of columns
     */
    this.render = function (rows, cols) {
        var grid = $(".gamefield").first();

        for (var i = 0; i < rows; i++) {
            grid.append("<div id ='" + i + "' class ='row'></div>")
        }
        rows = $('.row');
        for (var i = 0; i < cols; i++) {
            rows.append("<div id ='" + i + "' class ='cell'></div>");
        }
        cells = $('.cell');
        $.each(cells, function (index, cell) {
            $(cell).attr('id', $(cell).parent().attr('id') + $(cell).attr('id'));
        })
    }
}

/**
 * abstracto coub object with basic function
 * @param type coub type
 * @param x row
 * @param y column
 * @param params additional params for initialization
 * @constructor
 */
function CoubObject(type, x, y, params) {
    this.rx = x;
    this.ry = y;
    this.ax = this.rx * 75;
    this.ay = this.ry * 75;
    this.node = $('<div>', {class: type});
    $('body').first().append(this.node);
    var newPosition = $('#' + x + +y).first().offset();
    this.node.css({position: 'absolute'});
    this.node.offset(newPosition);
}

/**
 * move to relation coordinats
 * @param x row
 * @param y column
 * @param after function which will be executed after moving
 */
CoubObject.prototype.movetor = function (x, y, after) {
    this.rx = x;
    this.ry = y;
    this.ax = this.rx * 75;
    this.ay = this.ry * 75;
    newPosition = $('#' + this.rx + +this.ry).first().offset();
    this.movetoa(newPosition.top, newPosition.left, after);
};

/**
 * move to absolute coordinats on window
 * @param x left position
 * @param y top position
 * @param after function which will be executed after moving
 */
CoubObject.prototype.movetoa = function (x, y, after) {
    this.node.animate({top: x, left: y}, 150, after);
};

/**
 * move action
 * @param direction 1 - up 2 - right 3 - down 4 -  left
 * @param after
 */
CoubObject.prototype.move = function (direction, after) {
    vector = new Vector(this.rx, this.ry, direction);
    position = vector.getEndPoint();
    this.movetor(position['x'], position['y'], after);
};

/**
 * tremor in direction
 */
CoubObject.prototype.tremor = function (direction) {
    if (direction == 1 || direction == 3) {
        vector = 'top';
    } else {
        vector = 'left';
    }
    if ((direction == 2) || (direction == 3))
        foward = '+';
    else {
        foward = '-';
    }
    backward = foward == '-' ? '+' : '-';

    this.node.animate({[vector]:foward + "=8"}, 50);
    this.node.animate({[vector]:backward + "=8"},50);
    this.node.animate({[vector]:foward + "=4"},50);
    this.node.animate({[vector]:backward + "=4"},50);
};

/**
 * check if coub can move there. check end of grid
 * @param direction direction for moving
 * @returns return true if coub can move
 */
CoubObject.prototype.canCoubMoveThere = function (direction) {
    newPosition = new Vector(this.rx, this.ry, direction).getEndPoint();
    if ((newPosition.x >= 0) && (newPosition.x <= 6) &&
        (newPosition.y >= 0) && (newPosition.y <= 6)) {
        return true
    } else {
        return false;
    }
};

/**
 * abstract action with logging
 */
CoubObject.prototype.coubMovedThere = function () {
    console.log("coub moved there");
};
/**
 * abstract action with logging
 */
CoubObject.prototype.coubMovedOutThere = function () {
    console.log("coub moved out there");
};
/**
 * abstract action with logging
 */
CoubObject.prototype.coubMovedDuring = function (direction) {
    console.log("coum moving now");
}

/**
 * main coub. This coub will be controlled by gamer. physic object
 * @param px row on grid
 * @param py column on grid
 * @constructor
 */
function Coub(px, py) {
    Coub.superclass.constructor.call(this, 'coub', px, py);

    /**
     * check if coum can move in direction.
     * check block and effect game fields
     * @param direction
     * @returns {return|boolean}
     */
    this.canCoubMoveThere = function (direction) {
        var infield = Coub.superclass.canCoubMoveThere.call(this, direction);
        var newPosition = new Vector(this.rx, this.ry, direction).getEndPoint();
        if ((newPosition.x >= 0) && (newPosition.x <= 6) &&
            (newPosition.y >= 0) && (newPosition.y <= 6)) {
            var target = g.blockfield[newPosition.x][newPosition.y];
            var efect = g.gamefield[newPosition.x][newPosition.y];
        }
        var canMove2 = ((efect == null) || (efect.canCoubMoveThere(direction)));
        var canMove = ((target == null) || (target.canCoubMoveThere(direction)))
        return infield && canMove && canMove2;
    }

    /**
     * hande arrow key pressing
     * after moving apply coumMovedThere of target objects
     * target is object when coub will be after moving
     * if can't move execute tremor
     * @param direction direction for moving
     */
    this.handleMovingAction = function (direction) {
        if (this.canCoubMoveThere(direction)) {
            var currentblock = g.gamefield[this.rx][this.ry];
            if (currentblock != null) {
                currentblock.coubMovedOutThere()
            }
            var newPosition = new Vector(this.rx, this.ry, direction).getEndPoint();
            var target = g.blockfield[newPosition.x][newPosition.y];
            var effect = g.gamefield[newPosition.x][newPosition.y];
            (target != null) ? target.coubMovedDuring(direction) : null;
            var self = this;
            var f = (effect != null) ? function () {
                effect.coubMovedThere(self)
            } : null;
            this.move(direction, f);
        } else {
            this.tremor(direction);
        }
    }
}

/**
 * Finish cell. This cell need to be destinated by coub
 * @param px grid row
 * @param py grid column
 * @constructor
 */
function FinishCell(px, py) {
    FinishCell.superclass.constructor.call(this, 'finish', px, py);

    /**
     * any coub type always can move there
     * @returns {boolean} true
     */
    this.canCoubMoveThere = function () {
        return true;
    }

    /**
     * init next level if main coub there
     */
    this.coubMovedThere = function () {
        var target = g.blockfield[this.rx][this.ry];
        if (target == null)
            g.nextLevel();
    }
}

/**
 * not moving coub
 * @param px grid row
 * @param py grid column
 */
function notMovingBlock(px, py) {

    /**
     * any can't move there
     */
    notMovingBlock.superclass.constructor.call(this, 'notMovingBlock', px, py);
    this.canCoubMoveThere = function () {
        return false;
    }
}

/**
 * moving coub. behaviour of this coub alike main coub.
 * but this coub type can't finish level. can be moved by main coub, but can't move anything
 * @param px grid row
 * @param py grid column
 */
function movingMovingBlock(px, py) {
    movingMovingBlock.superclass.constructor.call(this, 'movingBlock', px, py);

    /**
     * coub can move there if this coub also can moved
     * @param direction direction of moving
     * @returns {return|boolean|return|boolean} true if moving can be executed
     */
    this.canCoubMoveThere = function (direction) {
        var infield = Coub.superclass.canCoubMoveThere.call(this, direction);
        var newPosition = new Vector(this.rx, this.ry, direction).getEndPoint();
        if ((newPosition.x >= 0) && (newPosition.x <= 6) &&
            (newPosition.y >= 0) && (newPosition.y <= 6)) {
            var target = g.blockfield[newPosition.x][newPosition.y];
            var efect = g.gamefield[newPosition.x][newPosition.y];
        }
        var canMove2 = ((efect == null) || (efect.canCoubMoveThere(direction)));
        return infield && (target == undefined) && canMove2;
    }

    /**
     * this function executed during moving of main coub
     * @param direction direction of moving
     */
    this.coubMovedDuring = function (direction) {
        var newPosition = new Vector(this.rx, this.ry, direction).getEndPoint();
        var effect = g.gamefield[newPosition.x][newPosition.y];
        var self = this;
        var f = (effect != null) ? function () {
            effect.coubMovedThere(self)
        } : null;
        this.move(direction, f);
    }

    /**
     * move to related grid coordinats and rewrite self in game matrix
     * @param x grid row
     * @param y grid column
     * @param f execute when moving will be finished
     */
    this.movetor = function (x, y, f) {
        g.blockfield[this.rx][this.ry] = null;
        movingMovingBlock.superclass.movetor.call(this, x, y, f);
        g.blockfield[this.rx][this.ry] = this;
    }
}

/**
 * teleport block. can teleport main coub an moving coub to paired telebort
 * @param px grid row
 * @param py grid column
 * @param group group number of teleport. need to define colour
 */
function teleportBlock(px, py, group) {
    teleportBlock.superclass.constructor.call(this, 'teleportBlock', px, py);
    this.node.css('background-color', codeToColor(9 - group));
    this.pair = null;

    /**
     * move coub to pair teleport
     * @param coub coub for teleporting
     */
    this.coubMovedThere = function (coub) {
        if (this.pair != null)
            coub.movetor(this.pair.rx, this.pair.ry);
    }

    /**
     * if pair teleport is empty, coub can move there
     * @returns {boolean}
     */
    this.canCoubMoveThere = function () {
        var target = g.blockfield[this.pair.rx][this.pair.ry]
        if (target == null) {
            return true
        } else {
            return false;
        }
    }
}

/**
 * door button. can open and close door
 * @param px grid row
 * @param py grid column
 * @param group group number
 * @constructor
 */
function DorButton(px, py, group) {
    DorButton.superclass.constructor.call(this, 'dorButton', px, py);
    this.node.css('background-color', codeToColor(group));
    this.pair = null;

    /**
     * after moving coub there, open the dor
     * @param
     */
    this.coubMovedThere = function (coub) {
        if (this.pair != null)
            this.pair.open();
    }

    /**
     * if coub need move out, check if door coub is empty, close paired door.
     */
    this.coubMovedOutThere = function () {
        if (this.pair != null) {
            var target = g.blockfield[this.pair.rx][this.pair.ry]
            if (target == null) {
                this.pair.close();
            }
        }
    }

    /**
     * coub an main coub always can move there
     * @returns {boolean}
     */
    this.canCoubMoveThere = function () {
        return true;
    }
}

/**
 * Dor. can be in opened and closed state. controled by paired door button. if some object there, can't close
 * @param px grid row
 * @param py grid column
 * @param group number
 * @constructor
 */
function Dor(px, py, group) {
    Dor.superclass.constructor.call(this, 'dorClosed', px, py);
    this.node.css('background-color', codeToColor(group));
    this.pair = null;
    this.isOpen = false;

    /**
     * coub can move there only if door is opened
     * @returns {boolean}
     */
    this.canCoubMoveThere = function () {
        return this.isOpen;
    }

    /**
     * if coub will be moved out and button is not pressed, close the door
     */
    this.coubMovedOutThere = function () {
        var block = g.blockfield[this.pair.rx][this.pair.ry];
        if (block == null) {
            this.close();
        }
    }

    /**
     * open the door
     */
    this.open = function () {
        this.isOpen = true;
        this.node.fadeTo("fast", 0);
    }

    /**
     * close the door
     */
    this.close = function () {
        this.isOpen = false;
        this.node.fadeTo("fast", 1);
    }
}

/**
 * binding pair function. use for pinding door and teleport
 * @param object1
 * @param object2
 */
function bindingPair(object1, object2) {
    object1.pair = object2;
    object2.pair = object1;
}


/**
 * Level generator object.
 * contain all level and can construct the level
 * @constructor
 */
function LevelGenerator() {
    /**
     * 0 emppty
     * 1 coub
     * 9 target
     * 8 not moved
     * 7 moved
     * 4x teleport
     * 5x1 dor button
     * 5x2 dor
     * @type {Array}
     */
    this.level = [];
    this.level[1] = [[1, 8, 0, 0, 0, 0, 0],
        [0, 8, 0, 8, 8, 8, 0],
        [0, 8, 0, 8, 9, 8, 0],
        [0, 8, 0, 8, 0, 8, 0],
        [0, 8, 0, 0, 0, 8, 0],
        [0, 8, 8, 8, 8, 8, 0],
        [0, 0, 0, 0, 0, 0, 0]];


    this.level[2] = [[0, 8, 0, 0, 0, 0, 9],
        [7, 8, 0, 7, 7, 8, 7],
        [0, 7, 0, 8, 1, 8, 7],
        [7, 0, 7, 0, 7, 8, 0],
        [0, 7, 8, 7, 0, 8, 0],
        [7, 0, 7, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]];

    this.level[3] = [[0, 7, 0, 0, 8, 8, 1],
        [0, 8, 0, 8, 9, 8, 0],
        [0, 8, 0, 8, 0, 8, 0],
        [0, 8, 0, 8, 0, 8, 0],
        [0, 8, 0, 8, 0, 8, 0],
        [0, 8, 0, 8, 0, 8, 41],
        [41, 8, 0, 0, 7, 0, 8]];

    this.level[4] = [[0, 0, 512, 0, 0, 7, 511],
        [0, 8, 7, 7, 1, 7, 7],
        [0, 8, 7, 7, 7, 7, 7],
        [0, 8, 7, 7, 7, 7, 7],
        [0, 0, 522, 532, 542, 552, 7],
        [8, 7, 7, 7, 7, 7, 9],
        [8, 521, 531, 541, 551, 0, 8]];

    this.level[6] = [[1, 0, 0, 41, 0, 0, 42],
        [0, 7, 0, 8, 0, 0, 0],
        [0, 42, 0, 8, 0, 0, 41],
        [8, 8, 8, 8, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 511],
        [8, 8, 0, 0, 0, 0, 0],
        [9, 512, 0, 0, 0, 0, 0]];

    this.level[5] = [[9, 0, 46, 8, 41, 0, 44],
        [0, 0, 0, 8, 0, 0, 0],
        [46, 0, 45, 8, 40, 0, 43],
        [8, 8, 8, 8, 8, 8, 8],
        [44, 0, 41, 8, 42, 0, 42],
        [0, 0, 0, 8, 0, 0, 1],
        [45, 0, 40, 8, 43, 0, 8]];

    this.level[7] = [[1, 7, 0, 41, 511, 0, 42],
        [7, 8, 7, 8, 0, 0, 0],
        [0, 0, 0, 8, 0, 8, 0],
        [41, 0, 521, 522, 0, 8, 562],
        [512, 572, 8, 0, 42, 8, 582],
        [0, 571, 0, 0, 581, 8, 592],
        [591, 0, 0, 0, 561, 8, 9]];

    /**
     * construct level using defined level matrix
     * @param level number of level
     */
    this.initLevel = function (level) {
        var lvl = this.level[level];
        var objects1 = [];
        var objects2 = [];
        var k1 = 0;
        var k2 = 0;
        var teleports = [];
        var dors = [];
        for (i = 0; i <= 6; i++)
            for (j = 0; j <= 6; j++) {
                var type = lvl[i][j];
                if (type == 1) {
                    g.coub = new Coub(i, j);
                }
                if (type == 9) {
                    objects1[k1++] = new FinishCell(i, j);
                }
                if (type == 8) {
                    objects2[k2++] = new notMovingBlock(i, j);
                }
                if (type == 7) {
                    objects2[k2++] = new movingMovingBlock(i, j);
                }
                if (type >= 40 && type <= 49) {
                    var number = type % 10;
                    if (teleports[number] == null) {
                        teleports[number] = new teleportBlock(i, j, number);
                    } else {
                        t = new teleportBlock(i, j, number);
                        objects1[k1++] = t;
                        objects1[k1++] = teleports[number];
                        bindingPair(t, teleports[number]);
                    }

                }
                if (type >= 501 && type <= 592) {
                    var tp = type % 10;
                    var number = (type - tp - 500) / 10;

                    if (dors[number] == null) {
                        if (tp == 1) {
                            dors[number] = new DorButton(i, j, number);
                        } else {
                            dors[number] = new Dor(i, j, number);
                        }
                    } else {
                        if (tp == 1) {
                            var t = new DorButton(i, j, number);
                        } else {
                            var t = new Dor(i, j, number);
                        }
                        objects1[k1++] = t;
                        objects1[k1++] = dors[number];
                        bindingPair(t, dors[number]);
                    }
                }
            }

        for (var i = 0; i < objects1.length; i++) {
            g.gamefield[objects1[i].rx][objects1[i].ry] = objects1[i];
        }

        for (var i = 0; i < objects2.length; i++) {
            g.blockfield[objects2[i].rx][objects2[i].ry] = objects2[i];
        }
    }


}

/**
 * extending objects
 */
extend(Coub, CoubObject);
extend(DorButton, CoubObject);
extend(Dor, CoubObject);
extend(movingMovingBlock, CoubObject);
extend(notMovingBlock, CoubObject);
extend(FinishCell, CoubObject);
extend(teleportBlock, CoubObject);

/**
 * game object. contain game fields and game functions
 * @constructor
 */
function Game() {
    this.currentLevel = 1;
    this.gamefield = [],
    this.blockfield = [],
    this.field = new Gamefield(),

    /**
     * init game. construct level by curreint level which setted in game
     */
        this.initGame = function () {
            this.field.render(7, 7);

            for (var i = 0; i < 7; i++) {
                this.gamefield[i] = [];
            }
            for (var i = 0; i < 7; i++) {
                this.blockfield[i] = [];
            }
            var lg = new LevelGenerator();
            lg.initLevel(this.currentLevel);
        },
    /**
     * construct next level.
     * if this is last level, show "you win" message and construct firs level
     */
        this.nextLevel = function () {
            if (this.currentLevel == 7) {
                alert("you win");
                this.currentLevel = 1;
            } else {
                this.currentLevel++;
            }
            $('body').html('<div class="grid"><div class="gamefield"></div></div>');
            this.initGame();
        }

    /**
     * restart current level
     */
    this.restart = function () {
        $('body').html('<div class="grid"><div class="gamefield"></div></div>');
        this.initGame();
    }

    /**
     * init user interface controll
     */
    this.addUIcontroll = function () {
        $('body').keyup(function (event) {
            g.pressed = false;
        });
        $('body').keydown(function (event) {
            direction = 0;
            if (!g.pressed) {
                g.pressed = true;
                switch (event.keyCode) {
                    case 37:
                        direction = 4;
                        break;
                    case 38:
                        direction = 1;
                        break;
                    case 39:
                        direction = 2;
                        break;
                    case 40:
                        direction = 3;
                        break;
                    case 82:
                        g.restart();
                        break;
                }
                console.log(direction + ' ' + event.keyCode)
                g.coub.handleMovingAction(direction);
            }
        });
    }
}
var g;

/**
 * create game when document will be loaded
 */
$(document).ready(function () {
    document.addEventListener("keydown", function (e) {
        if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
            // Do whatever else you want with the keydown event (i.e. your navigation).
        }
    }, false);
    g = new Game();
    g.initGame();
    g.addUIcontroll();
})
