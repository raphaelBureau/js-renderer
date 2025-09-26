import { Geo } from "./geo.js";
export class Cube extends Geo {
    constructor(position = [0, 0, 0], rotation = [0, 0, 0], size = 5) {
        let texture = 0;
        let vertices = [0, 0, 0, 1,
            1, 0, 0, 1,
            0, 0, 1, 1,
            1, 0, 1, 1, //column major

            0, 1, 0, 1,
            1, 1, 0, 1,
            0, 1, 1, 1,
            1, 1, 1, 1];
        for (let i = 0; i < vertices.length; i += 4) {//center around 0,0,0
            vertices[i] -= 0.5;
            vertices[i + 1] -= 0.5;
            vertices[i + 2] -= 0.5;
        }
        vertices = new Float32Array(vertices);
        let faces = [];
        super(vertices, faces);
        faces.push([[vertices, 2, 1, 0], [[0, 0], [1, 1], [0, 1], texture], this]);
        faces.push([[vertices, 2, 3, 1], [[0, 0], [1, 0], [1, 1], texture], this]);
        faces.push([[vertices, 4, 0, 1], [[0, 1], [0, 0], [1, 0], texture], this]);
        faces.push([[vertices, 4, 1, 5], [[0, 1], [1, 0], [1, 1], texture], this]);
        faces.push([[vertices, 6, 2, 0], [[0, 1], [0, 0], [1, 0], texture], this]);
        faces.push([[vertices, 6, 0, 4], [[0, 1], [1, 0], [1, 1], texture], this]);
        faces.push([[vertices, 3, 2, 6], [[0, 0], [1, 0], [1, 1], texture], this]);
        faces.push([[vertices, 3, 6, 7], [[0, 0], [1, 1], [0, 1], texture], this]);
        faces.push([[vertices, 7, 1, 3], [[1, 1], [0, 0], [1, 0], texture], this]);
        faces.push([[vertices, 7, 5, 1], [[1, 1], [0, 1], [0, 0], texture], this]);
        faces.push([[vertices, 7, 6, 4], [[0, 0], [1, 0], [1, 1], texture], this]);
        faces.push([[vertices, 7, 4, 5], [[0, 0], [1, 1], [0, 1], texture], this]);
        this.SetPosition(position);
        this.SetRotation(rotation);
        this.SetScale([size, size, size]);
    }
}