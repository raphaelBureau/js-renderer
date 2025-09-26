import { Transform } from "./transform.js";
import { MatrixRecycler } from "../Libs/matrixRecycler.js";
export class Geo extends Transform {
    constructor(verticies, faces) {
        super();
        this.vertices = verticies;//column major Float32Array of vec4
        this.wValues = new Float32Array(this.vertices.length / 4);//w values for projection
        this.initialVertices = new Float32Array(verticies);
        this.faces = faces;
        this.MatrixRecycler = new MatrixRecycler();
    }
    FlipUvs() {
        for (let i = 0; i < this.faces.length; i++) {
            for (let j = 0; j < 3; j++) {
                this.faces[i][1][j][1] = 1 - this.faces[i][1][j][1];
            }
        }
    }
}