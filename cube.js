import { Geo } from "./geo.js";
export class Cube extends Geo {
    constructor(position = [0, 0, 0], rotation = [0, 0, 0], size = 5) {
        let texture = 0;
        let vertices = [[0, 0, 0, 1], [1, 0, 0, 1], [0, 0, 1, 1], [1, 0, 1, 1],
        [0, 1, 0, 1], [1, 1, 0, 1], [0, 1, 1, 1], [1, 1, 1, 1]];
        for (let i = 0; i < vertices.length; i++) {
            vertices[i][0] -= 0.5;
            vertices[i][1] -= 0.5;
            vertices[i][2] -= 0.5;
        }
        console.log(vertices);
        let faces = [];
        faces.push([Geo.CreateVertexMatrix(vertices[2], vertices[1], vertices[0]), [[0, 0], [1, 1], [0, 1], texture]]);
        faces.push([Geo.CreateVertexMatrix(vertices[2], vertices[3], vertices[1]), [[0, 0], [1, 0], [1, 1], texture]]);
        faces.push([Geo.CreateVertexMatrix(vertices[4], vertices[0], vertices[1]), [[0, 1], [0, 0], [1, 0], texture]]);
        faces.push([Geo.CreateVertexMatrix(vertices[4], vertices[1], vertices[5]), [[0, 1], [1, 0], [1, 1], texture]]);
        faces.push([Geo.CreateVertexMatrix(vertices[6], vertices[2], vertices[0]), [[0, 1], [0, 0], [1, 0], texture]]);
        faces.push([Geo.CreateVertexMatrix(vertices[6], vertices[0], vertices[4]), [[0, 1], [1, 0], [1, 1], texture]]);
        faces.push([Geo.CreateVertexMatrix(vertices[3], vertices[2], vertices[6]), [[0, 0], [1, 0], [1, 1], texture]]);
        faces.push([Geo.CreateVertexMatrix(vertices[3], vertices[6], vertices[7]), [[0, 0], [1, 1], [0, 1], texture]]);
        faces.push([Geo.CreateVertexMatrix(vertices[7], vertices[1], vertices[3]), [[1, 1], [0, 0], [1, 0], texture]]);
        faces.push([Geo.CreateVertexMatrix(vertices[7], vertices[5], vertices[1]), [[1, 1], [0, 1], [0, 0], texture]]);
        faces.push([Geo.CreateVertexMatrix(vertices[7], vertices[6], vertices[4]), [[0, 0], [1, 0], [1, 1], texture]]);
        faces.push([Geo.CreateVertexMatrix(vertices[7], vertices[4], vertices[5]), [[0, 0], [1, 1], [0, 1], texture]]);
        super(faces);
        this.SetPosition(position);
        this.SetRotation(rotation);
        this.SetScale([size, size, size]);
    }
}