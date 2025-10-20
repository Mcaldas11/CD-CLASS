export default class Circle {
    R = 10;         // radius is fixed to 10
    COlOR = "blue"; // color is fixed to blue
    VELOCITY = 2;   // fixed velocity of 2 pixels per frame
    constructor(initialX, initialY, direction) {
        // initial position
        this.x = initialX;  
        this.y = initialY;
        // velocity components
        this.dX = this.VELOCITY * Math.cos(direction); 
        this.dY = this.VELOCITY * Math.sin(direction); 
    }

    // class must be independent of any global variables
    // argument ctx is the 2D context of the canvas where to draw the circle
    draw(ctx) {
        ctx.fillStyle = this.COlOR;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.R, 0, 2 * Math.PI);
        ctx.fill();
    }

    // arguments are the width and height of the canvas
    update(canvasW, canvasH) {
        // check Canvas vertical collisions
        if (this.x < this.R || this.x > canvasW - this.R)
            this.dX = -this.dX;

        // check Canvas horizontal collisions
        if (this.y < this.R || this.y > canvasH - this.R)
            this.dY = -this.dY;

        // update position
        this.x += this.dX;  
        this.y += this.dY;  
    }
}