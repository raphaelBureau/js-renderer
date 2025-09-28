import { Transform } from "./transform.js";
import { MatrixRecycler } from "../Libs/matrixRecycler.js";
export class Geo extends Transform {
    constructor(verticies, faces, normals) {
        super();
        this.vertices = verticies;//column major Float32Array of vec4
        this.wValues = new Float32Array(this.vertices.length / 4);//w values for projection
        this.initialVertices = new Float32Array(verticies);
        this.faces = faces;
        this.normals = normals;
        this.MatrixRecycler = new MatrixRecycler();
    }
    FlipUvs() {
        for (let i = 0; i < this.faces.length; i++) {
            for (let j = 0; j < 3; j++) {
                this.faces[i][1][j][1] = 1 - this.faces[i][1][j][1];
            }
        }
    }
    GenerateSmoothNormals() { //generate averaged face normals for each vertex
        //will save operations by reusing indices
        let normals = [];
        for(let i = 0; i < this.faces.length; i++) {
            const V = this.faces[i][0][0];
            const x0 = V[i0 * 4], y0 = V[i0 * 4 + 1], z0 = V[i0 * 4 + 2];
            const x1 = V[i1 * 4], y1 = V[i1 * 4 + 1], z1 = V[i1 * 4 + 2];
        }
    }
    GenerateFaceNormals() { //generate flat face normals for each face
        //will save operations by reusing indices
    }
}