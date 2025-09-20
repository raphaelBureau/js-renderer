import {MatrixRecycler} from "./Libs/matrixRecycler.js";
export default class Transform {
    constructor() {
        this.position = new Float32Array(3);
        this.rotation = new Float32Array(3);
        this.translationMatrix = new Float32Array(16);
        this.rotationMatrix = new Float32Array(16);
        this.transformMatrix = new Float32Array(16);
        this.recycler = new MatrixRecycler();
    }
    setPosition(vec) {
        this.translationMatrix[3] = vec[0];
        this.translationMatrix[7] = vec[1];
        this.translationMatrix[11] = vec[2];
        this.position[0] = vec[0];
        this.position[1] = vec[1];
        this.position[2] = vec[2];
        UpdateTransform();
    }
    addPosition(vec) {
        this.translationMatrix[3] += vec[0];
        this.translationMatrix[7] += vec[1];
        this.translationMatrix[11] += vec[2];
        this.position[0] += vec[0];
        this.position[1] += vec[1];
        this.position[2] += vec[2];
        UpdateTransform();
    }
    UpdateTransform() {
        this.recycler.MatProdInto(this.rotationMatrix,this.translationMatrix,this.transformMatrix);
    }
}