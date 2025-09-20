import {MatrixRecycler} from "./Libs/matrixRecycler.js";

export default class Camera {
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
    ProjectGeo(geo) {
        let projectedFaces = [];
        for(let i =0; i<geo.faces.length; i++) {
            let face = [[ ...geo.faces[i][0][0], ...geo.faces[i][0][1], ...geo.faces[i][0][2]],geo.faces[i][1],geo.faces[i][2]];
            MatrixRecycler.Transpose(face[0]);
            MatrixRecycler.MatProd(this.viewMatrix, face[0]);
            projectedFaces.push(face);
        }
    }
}