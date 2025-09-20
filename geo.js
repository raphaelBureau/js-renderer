import { Transform } from "./transform.js";
export class Geo extends Transform {
    constructor(vertices, faces) {
        super();
        this.vertices = vertices; //array of Float32Array(3)
        this.faces = faces;//array of [ [v1,v2,v3], normal, [r,g,b,a], [uv1,uv2,uv3], textureIndex ]
    }
}