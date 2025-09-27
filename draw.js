export class Draw2D { //utilise les fonctions du canvas
    constructor(ctx) {
        this.ctx = ctx;
    }

    Circle(x, y, size, style = "green") {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fillStyle = style;
        this.ctx.closePath();
        this.ctx.fill();
    }

    Triangle(matrix1, matrix2, matrix3, style = "green") {
        this.ctx.beginPath();
        this.ctx.moveTo(matrix1[0], matrix1[1]);
        this.ctx.lineTo(matrix2[0], matrix2[1]);
        this.ctx.lineTo(matrix3[0], matrix3[1]);
        this.ctx.fillStyle = style;
        this.ctx.fill();
        this.ctx.closePath();
    }

    Polygon(vertices, style = [255, 0, 0, 1], wireframe = false) { //fonctionne pour toutes les formes solides 2d 
        this.ctx.beginPath(); //mettre dans un zbuffer avant et order by z DESC
        this.ctx.fillStyle = "rgba(" + style[0] + "," + style[1] + "," + style[2] + "," + style[3] + ")";
        if (style[3] != 1) {
            this.ctx.strokeStyle = "rgba(" + style[0] + "," + style[1] + "," + style[2] + "," + style[3] * 0.1 + ")";
        }
        else {
            this.ctx.strokeStyle = "rgba(" + style[0] + "," + style[1] + "," + style[2] + ",1)";
        }
        if (style[3] != 1 && wireframe) {
            this.ctx.strokeStyle = "rgba(255,255,255,1)";
        }
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(vertices[0][0], vertices[0][1]);
        for (let i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(vertices[i][0], vertices[i][1]);
        }
        this.ctx.lineTo(vertices[0][0], vertices[0][1]);
        this.ctx.stroke(); //fix transparent borders
        if (!wireframe) {
            this.ctx.fill();//disable for wireframe mode
        }
        this.ctx.closePath();
    }

    Text(text, x, y, font = "30px Arial", style = "green") {
        this.ctx.fillStyle = style
        this.ctx.font = font;
        this.ctx.fillText(text, x, y);
    }

    Line(vertex1, vertex2, style = "red") {
        this.ctx.beginPath();
        this.ctx.strokeStyle = style;
        this.ctx.moveTo(vertex1[0], vertex1[1]);
        this.ctx.lineTo(vertex2[0], vertex2[1]);
        this.ctx.stroke();
    }
    Bar(x = 0, y = 0, amount, width = 100, height = 50, inColor = "red", outColor = "black", border = 0) {
        this.ctx.beginPath();
        this.ctx.fillStyle = outColor;
        this.ctx.rect(x, y, width, height);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.fillStyle = inColor;
        this.ctx.rect(x + border, y + border, width * amount - border * 2, height - border * 2);
        this.ctx.fill();
    }
    BarGraph(x = 0, y = 0, data, width = 500, height = 200, colors = []) {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        let barX = x;
        for (let i = 0; i < data.length; i++) {
            const barWidth = width * data[i] / sum;
            this.ctx.beginPath();
            this.ctx.fillStyle = colors[i];
            this.ctx.rect(barX, y, barWidth, height);
            this.ctx.fill();
            barX += barWidth;
        }
    }
}
