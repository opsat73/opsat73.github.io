/**
 * Created by opsat73 on 21.12.15.
 */

function Gamefield() {
    /**
     * render empty gamefield on page and assign cell id
     * @param rows count ow rows
     * @param cols cont of columns
     */
    this.render = function(rows, cols) {
        var grid = $(".gamefield").first();

        for (var i = 0; i <rows; i++) {
            grid.append("<div id ='"+ i + "' class ='row'></div>")
        }
        rows = $('.row');
        for (var i = 0; i < cols; i++) {
             rows.append("<div id ='"+ i + "' class ='cell'></div>");
        }
        cells = $('.cell');
        $.each(cells, function(index, cell) {
            $(cell).attr('id', $(cell).attr('id')+$(cell).parent().attr('id'));
        })
    }
}

function moveFastToCoordinats(object,x, y) {
    newPosition = $('#' + x+ +y).first().offset();
    if (object == undefined) {
        return newPosition;
    }
    object.css({position: 'absolute'});
    object.offset(newPosition);
};

function animateMovingToCoordinats (object,x, y, f, que) {
    q = true;
    if (que != undefined)
        q = que;
    newPositon = moveFastToCoordinats(undefined, x, y);
    object.animate({left: newPositon.left, top: newPositon.top, queue: q},150, f)

};

function Coub(){
    this.x,
    this.y,
    this.node,
    this.init = function(x, y) {
        this.x = x;
        this.y = y;
        $('body').first().append('<div class = "coub"></div>');
        this.node = $('.coub').first();
        moveFastToCoordinats(this.node, x, y);
        return this;
    },
    this.handleMovingAction = function(vector, plusOrMinus) {
        canMove = true;
        isChangeheight = vector == 'left'? false:true;

        y = this.y;
        x = this.x;
        if (isChangeheight) {
            if (plusOrMinus == '-') {
                y-=1
            } else y +=1;
        } else {
            if (plusOrMinus == '-') {
                x-=1
            } else x+=1;
        }

        if (x <0 || x > 6 || y < 0 || y > 6) {
            canMove = false;
        } else
            target = g.gamefield[x][y];
        if (target != undefined) {
            canMove = target.canMoveThere;
        }

        if (canMove) {
            if (target != undefined && target.amazingMooving) {
                target.moveCoubThere(this);
            } else
                animateMovingToCoordinats(this.node, x, y, function() {
                    if (target != undefined) {
                        target.coubThere();
                    }
            });
            this.x = x;
            this.y = y;

        } else {
            this.tremor(vector, plusOrMinus);
        }


    },
    this.tremor = function(vector, plusMinus) {
        foward = plusMinus;
        backward = plusMinus=='-'? '+' : '-';

        this.node.animate({[vector]: foward+"=8"},50);
        this.node.animate({[vector]: backward+"=8"},50);
        this.node.animate({[vector]: foward+"=4"},50);
        this.node.animate({[vector]: backward+"=4"},50);
    };
}

function FinishCell() {
    this.x,
    this.y,
    this.node
    this.canMoveThere = true,
    this.amazingMooving = false,
    this.init = function(x, y) {
        this.x = x;
        this.y = y;
        $('body').first().append('<div class = "finish"></div>');
        this.node = $('.finish').first();
         moveFastToCoordinats(this.node, x, y);
        return this;
    },
    this.coubThere = function() {
        alert('you won');
    }
}

function notMovingBlock() {
    this.x,
        this.y,
        this.node,
        this.canMoveThere = false,
        this.amazingMooving = false,
        this.init = function(x, y) {
            this.x = x;
            this.y = y;
            $('body').first().append('<div class = "notMovingBlock"></div>');
            this.node = $('.notMovingBlock').first();
            moveFastToCoordinats(this.node, x, y);
            return this;
        },
        this.moveCoubThere = function(coub) {

        }
}

function movingMovingBlock() {
    this.x,
        this.y,
        this.node,
        this.canMoveThere = true,
        this.amazingMooving = true,
        this.init = function(x, y) {
            this.x = x;
            this.y = y;
            $('body').first().append('<div class = "movingBlock"></div>');
            this.node = $('.movingBlock').first();
            moveFastToCoordinats(this.node, x, y);
            return this;
        },
        this.moveCoubThere = function(coub) {
            yDirrection = this.y - coub.y;
            xDirrection = this.x - coub.x;
            x = this.x + xDirrection;
            y = this.y + yDirrection;
            animateMovingToCoordinats(coub.node, this.x, this.y, null, false);
            animateMovingToCoordinats(this.node, x, y, null, false);
            g.gamefield[this.x][this.y] = undefined;
            this.x = x;
            this.y = y;
            g.gamefield[this.x][this.y] = this;

        }
}

function Game() {
    this.coub = new Coub(),
    this.finish = new FinishCell(),
    this.gamefield = [],
    this.field = new Gamefield(),
    this.initGame = function(start, finish) {
        this.field.render(7, 7);

        for (var i = 0; i < 7; i++) {
            this.gamefield[i] = [];
        }
        this.finish.init(4, 4);
        this.coub.init(2, 2);
        this.gamefield[5][3] = new notMovingBlock().init(5,3);
        this.gamefield[5][5] = new movingMovingBlock().init(5,5);
        this.gamefield[4][4] = this.finish;
    },

        //37 left
        //38 up
        //39 right
        //40 down

    this.addUIcontroll = function() {
        $('body').keydown(function(event) {
            vector = null;
            plusorminus = null;
            needhandle = false;

            if (event.keyCode == 37) {
               needhandle = true;
                vector = 'left';
                plusorminus = '-';
            }
            if (event.keyCode == 38) {
                needhandle = true;
                vector = 'top';
                plusorminus = '-';
            }

            if (event.keyCode == 39) {
                needhandle = true;
                vector = 'left';
                plusorminus = '+';
            }

            if (event.keyCode == 40) {
                needhandle = true;
                vector = 'top';
                plusorminus = '+';
            }
            if (needhandle) {
                g.coub.handleMovingAction(vector, plusorminus);
            };
        });
    }
}

var g;

$(document).ready(function() {

    document.addEventListener("keydown", function (e) {
        if([37,38,39,40].indexOf(e.keyCode) > -1){
            e.preventDefault();
            // Do whatever else you want with the keydown event (i.e. your navigation).
        }
    }, false);


    g = new Game();
    g.initGame(22, 44);
    g.addUIcontroll();
})
