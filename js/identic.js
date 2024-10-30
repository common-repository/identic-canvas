jQuery(function ($) {
    $(document).ready(function () {
        var canvas = false;
        if (!!document.createElement('canvas').getContext) {
            canvas = true;
        }
        // Init identic
        $('.identic:not(.r)').each(function () {
            var $this = $(this);
            $this.addClass('r');
            var code = $this.attr('data-id');
            if (canvas) {                
                var size = $this.attr('width');
                var node = $this[0];
                var ctx = node.getContext("2d");
                identic_build_figure(ctx, code, size);
            } else {
                var fca = identic_forecolor(code);
                $this.css({background: "rgb(" + fca.r + "," + fca.g + "," + fca.b + ")"});                            
            }
        });
    });
});

function identic_build_figure(ctx, code, size) {
    var patchSize = size / 4;

    // There are 5 components for each figure:
    // 1. Type - Item from a set of shapes (32)
    // 2. Invert - Color inversion (2)
    // 3. Turn - Turn shape (4)
    // 4. Next - A variant of a set of figures (2)
    // 5. Plus - Rotation variant (2)    

    var middleType = code & 15;//31;

    // Middle
    var middleInvert = ((code >> 1) & 1) != 0;
    var middleTurn = (code >> 2) & 3;
    var midlePlus = ((code >> 4) & 1) != 0;

    // Reflection or rotation   
    var midleTurnNext = 1;
    if (midlePlus) {
        midleTurnNext = -1;
    }

    // Corner
    var cornerType = (code >> 5) & 31;
    var cornerInvert = ((code >> 6) & 1) != 0;
    var cornerTurn = (code >> 7) & 3;
    var cornerNext = ((code >> 8) & 1) != 0;
    var cornerPlus = ((code >> 9) & 1) != 0;
    // Shape type  
    if (cornerNext) {
        cornerType += 32;
    }
    // Reflection or rotation     
    var cornerTurnNext = 1;
    if (cornerPlus) {
        cornerTurnNext = -1;
    }

    // Side
    var sideType = (code >> 10) & 31;
    var sideInvert = ((code >> 11) & 1) != 0;
    var sideTurn = (code >> 12) & 3;
    var sideNext = ((code >> 13) & 1) != 0;
    var sidePlus = ((code >> 14) & 1) != 0;
    // Shape type   
    if (sideNext) {
        sideType += 32;
    }
    // Reflection or rotation     
    var sideTurnNext = 1;
    if (sidePlus) {
        sideTurnNext = -1;
    }

    // Side second.    
    var sideSecTurn = (code >> 17) & 3;
    var sideSecPlus = ((code >> 19) & 1) != 0;

    var sideSecTurnNext = 1;
    if (sideSecPlus) {
        sideSecTurnNext = -1;
    }

    // Blank center and edges
    if (middleType == 0 || middleType == 15 || middleType == 31 || middleType == 32 || middleType == 63) {
        if (sideType == 0 || sideType == 15 || sideType == 31 || sideType == 32 || sideType == 63) {
            middleType = (code >> 20) & 15;
            if (middleType == 0) {
                middleType = 1;
            }
        }
    }
    
    var fca = identic_forecolor(code);
    var foreColor = "rgb(" + fca.r + "," + fca.g + "," + fca.b + ")";

    var backColor = "rgb(255,255,255)";

    // Middle patch
    identic_render(ctx, patchSize, patchSize, patchSize, middleType, middleTurn, middleInvert, foreColor, backColor);
    identic_render(ctx, patchSize * 2, patchSize, patchSize, middleType, middleTurn += midleTurnNext, middleInvert, foreColor, backColor);
    identic_render(ctx, patchSize * 2, patchSize * 2, patchSize, middleType, middleTurn += midleTurnNext, middleInvert, foreColor, backColor);
    identic_render(ctx, patchSize, patchSize * 2, patchSize, middleType, middleTurn += midleTurnNext, middleInvert, foreColor, backColor);

    // Side patchs, starting from top and moving clock-wise
    identic_render(ctx, patchSize, 0, patchSize, sideType, sideTurn, sideInvert, foreColor, backColor);
    identic_render(ctx, patchSize * 2, 0, patchSize, sideType, sideSecTurn, sideInvert, foreColor, backColor);

    identic_render(ctx, patchSize * 3, patchSize, patchSize, sideType, sideTurn += sideTurnNext, sideInvert, foreColor, backColor);
    identic_render(ctx, patchSize * 3, patchSize * 2, patchSize, sideType, sideSecTurn += sideSecTurnNext, sideInvert, foreColor, backColor);

    identic_render(ctx, patchSize * 2, patchSize * 3, patchSize, sideType, sideTurn += sideTurnNext, sideInvert, foreColor, backColor);
    identic_render(ctx, patchSize, patchSize * 3, patchSize, sideType, sideSecTurn += sideSecTurnNext, sideInvert, foreColor, backColor);

    identic_render(ctx, 0, patchSize * 2, patchSize, sideType, sideTurn += sideTurnNext, sideInvert, foreColor, backColor);
    identic_render(ctx, 0, patchSize, patchSize, sideType, sideSecTurn += sideSecTurnNext, sideInvert, foreColor, backColor);

    // Corner patchs, starting from top left and moving clock-wise
    identic_render(ctx, 0, 0, patchSize, cornerType, cornerTurn, cornerInvert, foreColor, backColor);
    identic_render(ctx, patchSize * 3, 0, patchSize, cornerType, cornerTurn += cornerTurnNext, cornerInvert, foreColor, backColor);
    identic_render(ctx, patchSize * 3, patchSize * 3, patchSize, cornerType, cornerTurn += cornerTurnNext, cornerInvert, foreColor, backColor);
    identic_render(ctx, 0, patchSize * 3, patchSize, cornerType, cornerTurn += cornerTurnNext, cornerInvert, foreColor, backColor);
}

function identic_forecolor(code){
    // Shapes that are too light
    var blue = (code >> 21) & 31;
    var green = (code >> 24) & 31;
    var red = (code >> 27) & 31;
    var r = red << 3;
    var g = green << 3;
    var b = blue << 3;
    if (r > 180 && g > 180 && b > 180) {
        var color_min = (code >> 28) & 2;
        if (color_min == 0) {
            r -= 100;
        } else if (color_min == 1) {
            g -= 100;
        } else {
            b -= 100;
        }
    }
    return {r:r,g:g,b:b};
}

function identic_render(ctx, x, y, size, patch, turn, invert, foreColor, backColor) {
    turn %= 4;
    var vertices = identic_figures[patch];
    var offset = size / 2;
    var scale = size / 4;
    ctx.save();

    // Paint background
    ctx.fillStyle = invert ? foreColor : backColor;
    ctx.fillRect(x, y, size, size);

    // Build patch path
    ctx.translate(x + offset, y + offset);
    ctx.rotate(turn * Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo((vertices[0] % 5 * scale - offset), (Math.floor(vertices[0] / 5) * scale - offset));
    for (var i = 1; i < vertices.length; i++)
        ctx.lineTo((vertices[i] % 5 * scale - offset), (Math.floor(vertices[i] / 5) * scale - offset));
    ctx.closePath();

    // Offset and rotate coordinate space by patch position (x, y) and
    // 'turn' before rendering patch shape

    // Render rotated patch using fore color (back color if inverted)
    ctx.fillStyle = invert ? backColor : foreColor;
    ctx.fill();

    // Restore rotation
    ctx.restore();
}

var identic_figures = [
    Array(0, 4, 24, 20),
    Array(20, 21, 16, 18, 23, 24, 19, 18, 8, 9, 4, 3, 8, 6, 1, 0, 5, 6, 16, 15),
    Array(0, 24, 22, 0, 14, 4),
    Array(2, 14, 22, 10),
    Array(7, 11, 0, 7, 4, 13, 7, 13, 24, 17, 13, 7, 11, 17, 20, 11),
    Array(12, 14, 24, 22, 12, 20, 10, 12, 2, 4),
    Array(6, 2, 14, 22, 10, 6, 16, 18, 8),
    Array(10, 2, 14, 22, 10, 11, 17, 13, 7, 11),
    Array(17, 13, 7, 11),
    Array(12, 14, 24, 0, 10, 12, 22, 20, 4, 2),
    Array(4, 24, 12, 14, 2, 22, 10, 12, 0),
    Array(20, 12, 22, 14, 2, 12, 0),
    Array(0, 7, 12, 13, 24, 17, 12, 11),
    Array(10, 2, 22, 14),
    Array(11, 0, 7, 4, 13, 24, 17, 20),
    Array(),
    Array(10, 0, 2, 22, 24, 14),
    Array(10, 0, 2, 14, 24, 22),
    Array(11, 6, 7, 17, 18, 13),
    Array(0, 2, 14, 22, 10),
    Array(10, 12, 2, 14, 22),
    Array(6, 18, 16),
    Array(10, 6, 18, 14, 8, 16),
    Array(12, 14, 24, 0, 10),
    Array(0, 12, 20, 22, 14, 2),
    Array(20, 2, 22),
    Array(10, 11, 17, 13, 7, 2, 14, 22),
    Array(20, 12, 2, 4, 24),
    Array(0, 2, 14, 22, 20),
    Array(20, 2, 14, 22),
    Array(20, 2, 4, 22),
    Array(),

    // Second option
    Array(0, 4, 24, 20),
    Array(0, 4, 20),
    Array(0, 4, 14),
    Array(0, 14, 12, 22),
    Array(0, 14, 22),
    Array(0, 24, 22),
    Array(4, 20, 10, 12, 2),
    Array(20, 12, 24),
    Array(0, 2, 12, 10),
    Array(20, 0, 2, 22),
    Array(0, 4, 20, 24),
    Array(20, 17, 0, 13, 4, 24),
    Array(0, 7, 4, 24, 17, 20),
    Array(0, 2, 20, 22),
    Array(4, 17, 24, 20, 7, 0),
    Array(0, 18, 15),
    Array(2, 24, 22, 13, 11, 22, 20),
    Array(10, 2, 12),
    Array(11, 2, 13, 22),
    Array(0, 2, 10),
    Array(0, 14, 20),
    Array(10, 14, 22),
    Array(0, 2, 14, 20),
    Array(0, 14, 24, 22),
    Array(10, 17, 20, 24, 14, 7, 4, 0),
    Array(10, 17, 20, 22, 13, 24, 4, 0),
    Array(10, 17, 20, 22, 13, 24, 14, 7, 4, 0),
    Array(10, 11, 2, 4, 14, 13, 22, 20),
    Array(0, 14, 20, 12),
    Array(4, 10, 22, 12, 14),
    Array(0, 24, 2, 4, 20, 22, 4),
    Array(),
];