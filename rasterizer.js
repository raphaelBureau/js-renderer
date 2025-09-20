import { MatrixRecycler } from "../Libs/matrixRecycler.js";
export class Rasterizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });
        this.zBuffer;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        canvas.width = this.width;
        canvas.height = this.height;
        this.depthBuffer = new Float32Array(this.width * this.height);
        this.frameBuffer = this.ctx.createImageData(this.width, this.height);
        this.near = 0.1;
        this.textures = []; //[] 0:texture Byte Array, 1: Width, 2: Height
        this.uvMode = false; //show barycentric coordinates of textures
        this.MatrixRecycler = new MatrixRecycler();
    }
    CopyCanvas() {
        let image = this.canvasData;
        let fb = this.frameBuffer;
        let data = image.data;
        for (let i = data.length; i--;) {
            fb[i] = data[i];
        }
        for (let i = this.width * this.height; i < i--;) {
            fb[i] = 0;
        }
    }
    DrawPolygons(buffer, profiler) {
        let len = buffer.length;
        for(let i =0; i<this.frameBuffer.data.length; i+=4) {
            this.frameBuffer.data[i] = 50;
            this.frameBuffer.data[i+1] = 50;
            this.frameBuffer.data[i+2] = 50;
            this.frameBuffer.data[i+3] = 255;
        }
        for (let i = this.depthBuffer.length; i--;) {
            this.depthBuffer[i] = 0;
        }
        for (let i = 0; i < len; i++) {
            this.DrawTriangle(buffer[i], profiler);
        }
        this.SendFrameData();
    }
    SendFrameData() {
        this.ctx.putImageData(this.frameBuffer, 0, 0);
    }
    DrawTriangle(face, profiler) {
        let verts = face;
        let rgba = face[2];
        //bounding box
        let minX = ~~(Math.min(face[0][0], face[0][1], face[0][2]));
        let minY = ~~(Math.min(face[0][3], face[0][4], face[0][5]));
        let maxX = ~~(Math.max(face[0][0], face[0][1], face[0][2]));
        let maxY = ~~(Math.max(face[0][3], face[0][4], face[0][5]));

        let bestZ = Math.min(face[0][6], face[0][7], face[0][8]);
        let farthestZ = Math.max(face[0][6], face[0][7], face[0][8]);
        if (farthestZ < this.near) {
            return;
        }
        let near = this.near;

        minX = Math.max(minX, 0);
        let vecMX = minX - 1;
        minX = Math.min(minX, this.width);

        maxX = Math.max(maxX, 0);
        maxX = Math.min(maxX, this.width);


        minY = Math.max(minY, 0);
        minY = Math.min(minY, this.height);

        maxY = Math.max(maxY, 0);
        maxY = Math.min(maxY, this.height);

        let InTri = false;
        let v0 = [face[0][1] - face[0][0], face[0][4] - face[0][3]];
        let v1 = [face[0][2] - face[0][0], face[0][5] - face[0][3]];
        let DBI = 0;
        //declare les variables hors du scope pour sauver au max 1.8m de declarations inutiles
        let denom = 1 / (v0[0] * v1[1] - v1[0] * v0[1]); //multiplication plus rapide que division
        let alpha = 0;
        let beta = 0;
        let gamma = 0;
        let depth = 0;
        let pixelI = 0;
        let DB = this.depthBuffer;
        let FB = this.frameBuffer.data;
        let depthValue = 0;
        let pixelY = 0;
        let Vy1 = 0
        let Vy2 = 0
        let v32x = (face[0][2] - face[0][1]);
        let v13x = face[0][0] - face[0][2];
        let v21x = face[0][1] - face[0][0];

        let v32y = (face[0][5] - face[0][4]);
        let v13y = face[0][3] - face[0][5];
        let v21y = face[0][4] - face[0][3];

        let vertXv32y = v32y * face[0][4];
        let vertXv13y = v13y * face[0][5];
        let vertXv21y = v21y * face[0][0];

        let yv1y = 0
        let yv2y = 0
        let yv3y = 0
        let c1 = 0;
        let c2 = 0;
        let c3 = 0;
        let preXv32 = 0;
        let preXv21 = 0;
        let preXv13 = 0;

        let shade = 1;
        let preCalcShade = 255;

        let textureColor;
        let textureX;
        let textureY;
        let uvX0;
        let uvX1;
        let uvX2;
        let uvY0;
        let uvY1;
        let uvY2;
        let index = 0;
        textureColor = this.textures[face[1][3]][0];
        textureX = this.textures[face[1][3]][1];
        textureY = this.textures[face[1][3]][2];
        uvX0 = textureX * face[1][0][0];
        uvX1 = textureX * face[1][1][0];
        uvX2 = textureX * face[1][2][0];
        uvY0 = textureY * face[1][0][1];
        uvY1 = textureY * face[1][1][1];
        uvY2 = textureY * face[1][2][1];
        //debut des boucles fin de la complexite o de 1 qui est vraiment crazy
        for (let y = minY; y <= maxY; y++) {//optimisations possibles GENRE BEAUCOUP
            //complexite o de n
            DBI = y * this.width + vecMX;
            pixelY = y * this.width * 4;
            Vy1 = (y - face[0][3]) * v0[1];
            Vy2 = (y - face[0][3]) * v1[1];
            yv1y = y - face[0][3];
            yv2y = y - face[0][4];
            yv3y = y - face[0][5];

            c1 = (v32x) * (yv2y)
            c2 = (v13x) * (yv3y)
            c3 = (v21x) * (yv1y)

            preXv32 = c1 - (vecMX) * v32y;
            preXv13 = c2 - (vecMX) * v13y;
            preXv21 = c3 - (vecMX) * v21y;

            for (let x = minX; x <= maxX; x++) {
                //complexite o de n^2 donc mettre le plus de choses avant
                preXv32 -= v32y;
                preXv13 -= v13y;
                preXv21 -= v21y;
                profiler[1][0]++;//metrics
                DBI++;
                depthValue = DB[DBI];
                if (depthValue == 0 || bestZ < depthValue) {//si le cote le plus proche du triangle est plus loin que le point ecris au buffer, skip
                    if (
                        preXv32 + vertXv32y > 0 &&
                        preXv13 + vertXv13y > 0 &&
                        preXv21 + vertXv21y > 0
                    ) {//tank la performance
                        //je sauve des function calls en faisant ca

                        alpha = ((x - face[0][0]) * v1[1] - v1[0] * (y - face[0][3])) * denom;
                        beta = (v0[0] * (y - face[0][3]) - (x - face[0][0]) * v0[1]) * denom;
                        gamma = 1 - alpha - beta;
                        depth = gamma * face[0][6] + alpha * face[0][7] + beta * face[0][8];
                        if ((depthValue == 0 || depthValue > depth) && depth > near) {
                            DB[DBI] = depth;
                            profiler[1][1]++;//metrics
                            //light calculations
                            if (false) {

                                shade = (1 - (verts[0][3][1] * gamma + verts[1][3][1] * alpha + verts[2][3][1] * beta)) / 2
                                if (shade < 0.1) {
                                    shade = 0.1;
                                }
                            }
                            pixelI = pixelY + (x - 1) * 4;
                            if (this.uvMode) {
                                preCalcShade = 255 * shade
                                FB[pixelI] = gamma * preCalcShade;
                                FB[pixelI + 1] = alpha * preCalcShade;
                                FB[pixelI + 2] = beta * preCalcShade;
                            }
                            else {
                                    index = 4 * (~~(gamma * uvX0 + alpha * uvX1 + beta * uvX2) + ~~(gamma * uvY0 + alpha * uvY1 + beta * uvY2) * textureX);//coute genre 20fps

                                    FB[pixelI] = textureColor[index] * shade;
                                    FB[pixelI + 1] = textureColor[index + 1] * shade;
                                    FB[pixelI + 2] = textureColor[index + 2] * shade;
                            }
                        }
                        InTri = true;
                    }
                    else {
                        if (InTri) {
                            //si on etais dans le triangle et maintenant on est sorti, il est impossible de retourner dans le triangle a partir de la meme ligne
                            //pixelRef[2] += maxX - x;
                            break;
                        }
                    }
                }
            }
            InTri = false;
        }
    }
}