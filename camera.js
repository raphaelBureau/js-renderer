import { MatrixRecycler } from "../Libs/matrixRecycler.js";
import { V3D } from "../Libs/vec3D.js";

export class Camera {
    constructor(fov,aspect,near,far) {
        this.position = new Float32Array(3);
        this.rotation = new Float32Array(3);
        this.projectionMatrix = MatrixRecycler.Identity();
        this.translationMatrix = MatrixRecycler.Identity();
        this.rotationMatrix = MatrixRecycler.Identity();
        this.MatrixRecycler = new MatrixRecycler();
        this.intermediateMatrix = MatrixRecycler.Identity();
        this.viewportMatrix = MatrixRecycler.Identity();
        this.SetPerspective(fov,aspect,near,far);
        this.speed = 15;
        this.movement = [0, 0, 0, 0, 0, 0]; //forward, backward, left, right, up, down
        this.look = [0, 0, 0, 0]; //up, down, left, right
        this.lookSpeed = 0.45;
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
        this.viewportMatrix[3] = width / 2;

        this.viewportMatrix[4] = 0;
        this.viewportMatrix[5] = -height / 2;
        this.viewportMatrix[6] = 0;
        this.viewportMatrix[7] = height / 2;

        this.viewportMatrix[8] = 0;
        this.viewportMatrix[9] = 0;
        this.viewportMatrix[10] = 1;
        this.viewportMatrix[11] = 0;

        this.viewportMatrix[12] = 0;
        this.viewportMatrix[13] = 0;
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
    ProjectGeo(geo) {
        const intermediateMatrix = this.intermediateMatrix;
        const MR = this.MatrixRecycler;
        for (let i = 0; i < geo.length; i++) {
            geo[i].vertices.set(geo[i].initialVertices);
            MR.MatProdInto(this.translationMatrix, geo[i].transformMatrix, intermediateMatrix);
            MR.MatProd(this.rotationMatrix, intermediateMatrix);
            MR.MatProd(this.projectionMatrix, intermediateMatrix);
            MR.TransformVertexArray(intermediateMatrix, geo[i].vertices);
            for(let j=0; j<geo[i].vertices.length; j+=4) {
                geo[i].wValues[j/4] = geo[i].vertices[j+3];
                geo[i].vertices[j] /= geo[i].wValues[j/4];
                geo[i].vertices[j+1] /= geo[i].wValues[j/4];
                geo[i].vertices[j+2] /= geo[i].wValues[j/4];
                geo[i].vertices[j+3] = 1;
            }
            MR.TransformVertexArray(this.viewportMatrix, geo[i].vertices);
        }
    }
    Update(deltaTime) {
        V3D.AddR(this.rotation, V3D.SclR(deltaTime*this.lookSpeed,V3D.UnvR([this.look[1]-this.look[0],this.look[3]-this.look[2],0])));
        this.SetRotation(this.rotation);
        let pos = V3D.RotYR(-this.rotation[1], [(this.movement[2] - this.movement[3]), (this.movement[4] - this.movement[5]), (this.movement[0] - this.movement[1])]);
        V3D.SclR(deltaTime*this.speed,V3D.UnvR(pos));
        V3D.AddR(this.position, pos);
        this.SetPosition(this.position);
    }
}