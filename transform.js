import {MatrixRecycler} from "../Libs/matrixRecycler.js";
export class Transform {
    constructor() {
        this.position = new Float32Array(3);
        this.rotation = new Float32Array(3);
        this.translationMatrix = MatrixRecycler.Identity();
        this.rotationMatrix = MatrixRecycler.Identity();
        this.scaleMatrix = MatrixRecycler.Identity();
        this.transformMatrix = MatrixRecycler.Identity();
        this.recycler = new MatrixRecycler();
    }
    SetPosition(vec) {
        this.translationMatrix[3] = vec[0];
        this.translationMatrix[7] = vec[1];
        this.translationMatrix[11] = vec[2];
        this.position[0] = vec[0];
        this.position[1] = vec[1];
        this.position[2] = vec[2];
        this.UpdateTransform();
    }
    AddPosition(vec) {
        this.translationMatrix[3] += vec[0];
        this.translationMatrix[7] += vec[1];
        this.translationMatrix[11] += vec[2];
        this.position[0] += vec[0];
        this.position[1] += vec[1];
        this.position[2] += vec[2];
        this.UpdateTransform();
    }
    SetRotation(vec) {
        this.rotationMatrix[0] = Math.cos(vec[1]) * Math.cos(vec[2]);
        this.rotationMatrix[1] = -Math.cos(vec[1]) * Math.sin(vec[2]);
        this.rotationMatrix[2] = Math.sin(vec[1]);
        this.rotationMatrix[4] = Math.sin(vec[0]) * Math.sin(vec[1]) * Math.cos(vec[2]) + Math.cos(vec[0]) * Math.sin(vec[2]);
        this.rotationMatrix[5] = -Math.sin(vec[0]) * Math.sin(vec[1]) * Math.sin(vec[2]) + Math.cos(vec[0]) * Math.cos(vec[2]);
        this.rotationMatrix[6] = -Math.sin(vec[0]) * Math.cos(vec[1]);
        this.rotationMatrix[8] = -Math.cos(vec[0]) * Math.sin(vec[1]) * Math.cos(vec[2]) + Math.sin(vec[0]) * Math.sin(vec[2]);
        this.rotationMatrix[9] = Math.cos(vec[0]) * Math.sin(vec[1]) * Math.sin(vec[2]) + Math.sin(vec[0]) * Math.cos(vec[2]);
        this.rotationMatrix[10] = Math.cos(vec[0]) * Math.cos(vec[1]);
        this.rotation[0] = vec[0];
        this.rotation[1] = vec[1];
        this.rotation[2] = vec[2];
        this.UpdateTransform();
    }
    AddRotation(vec) {
        this.rotation[0] += vec[0];
        this.rotation[1] += vec[1];
        this.rotation[2] += vec[2];
        this.SetRotation(this.rotation);
        this.UpdateTransform();
    }
    SetScale(vec) {
        this.scaleMatrix[0] = vec[0];
        this.scaleMatrix[5] = vec[1];
        this.scaleMatrix[10] = vec[2];
        this.UpdateTransform();
    }
    
    UpdateTransform() {
        this.recycler.MatProdInto(this.rotationMatrix, this.scaleMatrix, this.transformMatrix)
        this.recycler.MatProd(this.translationMatrix,this.transformMatrix);
    }
}