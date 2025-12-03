// Circle.js
export default class Circle {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;

        // random size (radius)
        this.radius = 5 + Math.random() * 20; // between 5 and 25

        // random color
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        this.color = `rgb(${r}, ${g}, ${b})`;

        // random velocity
        this.speed = 1 + Math.random() * 3; // between 1 and 4
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(W, H) {
        // move
        this.x += this.speed * Math.cos(this.direction);
        this.y += this.speed * Math.sin(this.direction);

        // bounce on walls
        if (this.x - this.radius < 0 || this.x + this.radius > W) {
            this.direction = Math.PI - this.direction;
        }
        if (this.y - this.radius < 0 || this.y + this.radius > H) {
            this.direction = -this.direction;
        }
    }
}
