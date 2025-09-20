import {MatrixRecycler} from "../Libs/matrixRecycler.js";

export class Camera {
    constructor() {
        this.position = new Float32Array(3);
        this.rotation = new Float32Array(3);
        this.projectionMatrix = MatrixRecycler.Identity();
        this.translationMatrix = MatrixRecycler.Identity();
        this.rotationMatrix = MatrixRecycler.Identity();
        this.viewMatrix = MatrixRecycler.Identity();
        this.MatrixRecycler = new MatrixRecycler();
        this.SetPerspective(90 * Math.PI / 180, 1, 0.1, 1000);
    }
    SetPerspective(fov, aspect, near, far) {
        let f = 1.0 / Math.tan(fov / 2);
        this.projectionMatrix[0] = f / aspect;
        this.projectionMatrix[1] = 0;
        this.projectionMatrix[2] = 0;
        this.projectionMatrix[3] = 0;
        this.projectionMatrix[4] = 0;
        this.projectionMatrix[5] = f;
        this.projectionMatrix[6] = 0;
        this.projectionMatrix[7] = 0;
        this.projectionMatrix[8] = 0;
        this.projectionMatrix[9] = 0;
        this.projectionMatrix[10] = (far + near) / (near - far);
        this.projectionMatrix[11] = (2 * far * near) / (near - far);
        this.projectionMatrix[12] = 0;
        this.projectionMatrix[13] = 0;
        this.projectionMatrix[14] = -1;
        this.projectionMatrix[15] = 0;
    }
    UpdateView() {
        this.MatrixRecycler.MatProdInto(this.translationMatrix, this.rotationMatrix, this.viewMatrix);
        this.MatrixRecycler.MatProd(this.projectionMatrix, this.viewMatrix);
    }
    setPosition(vec) {
        this.translationMatrix[3] = vec[0];
        this.translationMatrix[7] = vec[1];
        this.translationMatrix[11] = vec[2];
        this.position[0] = vec[0];
        this.position[1] = vec[1];
        this.position[2] = vec[2];
        this.UpdateView();
    }
    addPosition(vec) {
        this.translationMatrix[3] += vec[0];
        this.translationMatrix[7] += vec[1];
        this.translationMatrix[11] += vec[2];
        this.position[0] += vec[0];
        this.position[1] += vec[1];
        this.position[2] += vec[2];
        this.UpdateView();
    }
    ProjectGeo(geo,buffer) {
        for(let i =0; i<geo.faces.length; i++) {
            let vertCopy = new Float32Array(12);
            vertCopy[0] = geo.faces[i][0][0];
            vertCopy[1] = geo.faces[i][0][1];
            vertCopy[2] = geo.faces[i][0][2];
            vertCopy[3] = geo.faces[i][0][3];
            vertCopy[4] = geo.faces[i][0][4];
            vertCopy[5] = geo.faces[i][0][5];
            vertCopy[6] = geo.faces[i][0][6];
            vertCopy[7] = geo.faces[i][0][7];
            vertCopy[8] = geo.faces[i][0][8];
            vertCopy[9] = geo.faces[i][0][9];
            vertCopy[10] = geo.faces[i][0][10];
            vertCopy[11] = geo.faces[i][0][11];
            let face = [vertCopy,geo.faces[i][1]];
            this.MatrixRecycler.Vec3Prod(geo.transformMatrix, face[0]);
            //this.MatrixRecycler.Vec3Prod(this.viewMatrix, face[0]);
            buffer.push(face);
        }
    }
}