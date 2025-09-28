import { Geo } from "../geo.js";
export class Cone extends Geo {
    constructor(position = [0, 0, 0], rotation = [0, 0, 0], width = 5, height = 5, sides = 4, texture = 0) {
        let vertices = new Float32Array((sides + 2) * 4);
        vertices[0] = 0; vertices[1] = 1; vertices[2] = 0; vertices[3] = 1; //tip
        vertices[4] = 0; vertices[5] = 0; vertices[6] = 0; vertices[7] = 1; //base
        let rad = 2 * Math.PI / sides;
        let angle = rad;
        for (let i = 0; i < sides*4; i++) {
            let x = Math.cos(angle);
            let z = Math.sin(angle);
            vertices[i * 4 + 8] = x;
            vertices[i * 4 + 9] = 0;
            vertices[i * 4 + 10] = z;
            vertices[i * 4 + 11] = 1;
            angle += rad;
        }
        //center vertices around 0,0,0
        for (let i = 0; i < vertices.length; i += 4) {
            vertices[i + 1] -= 0.5;
        }
        let faces = [];
        super(vertices, faces);
        function uv(i) {
            let u = 0.5 - Math.cos(2 * Math.PI / sides * i) * 0.5;
            let v = 0.5 + Math.sin(2 * Math.PI / sides * i) * 0.5;
            return [u, v];
        }
        faces.push([[vertices, 0, sides + 1, 2], [[0.5, 1], [0, 0], [1 / sides, 0], texture], this]);//side
        faces.push([[vertices, 1, 2, sides + 1], [[0.5, 0.5], uv(0), uv(sides - 1), texture], this]);//bottom
        for (let i = 1; i < sides; i++) {
            faces.push([[vertices, 0, i+1, i + 2], [[0.5, 1], [1 / sides * (i-1), 0], [1 / sides * i, 0], texture], this]);//side
            faces.push([[vertices, 1, i + 2, i+ 1], [[0.5, 0.5], uv(i), uv(i-1), texture], this]);//bottom
        }
        this.FlipUvs();
        this.SetPosition(position);
        this.SetRotation(rotation);
        this.SetScale([width, height, width]);
    }
}