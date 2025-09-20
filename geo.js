import { Transform } from "./transform.js";
export class Geo extends Transform {
    constructor(faces) {
        super();
        this.faces = faces;//array of [ [v1,v2,v3], normal, [r,g,b,a], [uv1,uv2,uv3], textureIndex ]
    }
    static CreateVertexMatrix(v1, v2, v3) {
        let mat = new Float32Array(12);
        mat[0] = v1[0];
        mat[1] = v2[0];
        mat[2] = v3[0];
        mat[3] = v1[1];
        mat[4] = v2[1];
        mat[5] = v3[1];
        mat[6] = v1[2];
        mat[7] = v2[2];
        mat[8] = v3[2];
        mat[9] = v1[3];
        mat[10] = v2[3];
        mat[11] = v3[3];
        return mat;
    }
}