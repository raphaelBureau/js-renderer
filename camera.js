import { MatrixRecycler } from "../Libs/matrixRecycler.js";

export class Camera {
    constructor() {
        this.position = new Float32Array(3);
        this.rotation = new Float32Array(3);
        this.projectionMatrix = MatrixRecycler.Identity();
        this.translationMatrix = MatrixRecycler.Identity();
        this.rotationMatrix = MatrixRecycler.Identity();
        this.MatrixRecycler = new MatrixRecycler();
        this.intermediateMatrix = MatrixRecycler.Identity();
        this.viewportMatrix = MatrixRecycler.Identity();
        this.SetPerspective(90 * Math.PI / 180, 1, 0.1, 1000);
        this.speed = 1;
        this.movement = [false, false, false, false, false, false]; //forward, backward, left, right, up, down
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
        this.projectionMatrix[11] = -1;
        this.projectionMatrix[12] = 0;
        this.projectionMatrix[13] = 0;
        this.projectionMatrix[14] = (2 * far * near) / (near - far);
        this.projectionMatrix[15] = 0;
    }
    SetViewport(width, height) {
        this.viewportMatrix[0] = width / 2;
        this.viewportMatrix[1] = 0;
        this.viewportMatrix[2] = 0;
        this.viewportMatrix[3] = 0;

        this.viewportMatrix[4] = 0;
        this.viewportMatrix[5] = -height / 2;
        this.viewportMatrix[6] = 0;
        this.viewportMatrix[7] = 0;

        this.viewportMatrix[8] = 0;
        this.viewportMatrix[9] = 0;
        this.viewportMatrix[10] = 1;
        this.viewportMatrix[11] = 0;

        this.viewportMatrix[12] = width / 2;
        this.viewportMatrix[13] = height / 2;
        this.viewportMatrix[14] = 0;
        this.viewportMatrix[15] = 1;
    }
    SetPosition(vec) {
        this.translationMatrix[3] = vec[0];
        this.translationMatrix[7] = vec[1];
        this.translationMatrix[11] = vec[2];
        this.position[0] = vec[0];
        this.position[1] = vec[1];
        this.position[2] = vec[2];
    }
    AddPosition(vec) {
        this.translationMatrix[3] += vec[0];
        this.translationMatrix[7] += vec[1];
        this.translationMatrix[11] += vec[2];
        this.position[0] += vec[0];
        this.position[1] += vec[1];
        this.position[2] += vec[2];
    }
    AddRotation(vec) {
        this.rotation[0] += vec[0];
        this.rotation[1] += vec[1];
        this.rotation[2] += vec[2];
        this.SetRotation(this.rotation);
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
    }
    ProjectGeo(geo, buffer) {
        for (let i = 0; i < geo.faces.length; i++) {
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
            let face = [vertCopy, geo.faces[i][1]];
            this.MatrixRecycler.MatProdInto(this.translationMatrix, geo.transformMatrix, this.intermediateMatrix);
            this.MatrixRecycler.MatProd(this.rotationMatrix, this.intermediateMatrix);
            this.MatrixRecycler.MatProd(this.projectionMatrix, this.intermediateMatrix);
            this.MatrixRecycler.MatProd(this.viewportMatrix, this.intermediateMatrix);
            this.MatrixRecycler.Vec3Prod(this.intermediateMatrix, face[0]);
            buffer.push(face);
        }
    }
    Update(deltaTime = 1.016) {
        this.position[0] += (this.movement[3] - this.movement[2]) * this.speed * deltaTime;
        this.position[1] += (this.movement[5] - this.movement[4]) * this.speed * deltaTime;
        this.position[2] += (this.movement[1] - this.movement[0]) * this.speed * deltaTime;
        this.SetPosition(this.position);
    }
}