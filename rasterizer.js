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
        for (let i = 0; i < this.frameBuffer.data.length; i += 4) {
            this.frameBuffer.data[i] = 50;
            this.frameBuffer.data[i + 1] = 50;
            this.frameBuffer.data[i + 2] = 50;
            this.frameBuffer.data[i + 3] = 255;
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
        // -- Setup (locals)
        const i0 = face[0][1], i1 = face[0][2], i2 = face[0][3];
        // screen-space vertices (after viewport; w==1 here):
        const V = face[0][0];
        const x0 = V[i0 * 4], y0 = V[i0 * 4 + 1], z0 = V[i0 * 4 + 2];
        const x1 = V[i1 * 4], y1 = V[i1 * 4 + 1], z1 = V[i1 * 4 + 2];
        const x2 = V[i2 * 4], y2 = V[i2 * 4 + 1], z2 = V[i2 * 4 + 2];

        // per-vertex clip-space w captured earlier (BEFORE divide by w):
        const w0c = face[2].wValues[i0], w1c = face[2].wValues[i1], w2c = face[2].wValues[i2];

        // texture + UVs (match v0,v1,v2 order):
        const texId = face[1][3];
        const texData = this.textures[texId][0];
        const texW = this.textures[texId][1] | 0;
        const texH = this.textures[texId][2] | 0;
        // UVs in [0,1] scaled to texels (top-left origin). If your images are bottom-left,
        // either flip here: uvY* = texH - 1 - (face[1][k][1]*texH) or flip at sample time.
        const u0 = face[1][0][0] * texW, v0uv = face[1][0][1] * texH;
        const u1 = face[1][1][0] * texW, v1uv = face[1][1][1] * texH;
        const u2 = face[1][2][0] * texW, v2uv = face[1][2][1] * texH;

        // --- build bounding box (clamp)
        const W = this.width | 0, H = this.height | 0, DB = this.depthBuffer, FB = this.frameBuffer.data;
        let minX = Math.floor(Math.min(x0, x1, x2));
        let maxX = Math.floor(Math.max(x0, x1, x2));
        let minY = Math.floor(Math.min(y0, y1, y2));
        let maxY = Math.floor(Math.max(y0, y1, y2));
        if (minX < 0) minX = 0; if (minY < 0) minY = 0;
        if (maxX >= W) maxX = W - 1; if (maxY >= H) maxY = H - 1;
        if (minX > maxX || minY > maxY) return;

        // --- edge functions (CCW). Evaluate at pixel centers (x+0.5,y+0.5) for robust coverage.
        const A01 = y0 - y1, B01 = x1 - x0;
        const A12 = y1 - y2, B12 = x2 - x1;
        const A20 = y2 - y0, B20 = x0 - x2;

        // signed area (twice the area). Keep the sign; don’t abs().
        const area = A12 * (x0 - x2) + B12 * (y0 - y2);
        if (area === 0) return; // degenerate
        const invArea = 1.0 / area;

        // start values at top-left pixel center
        const px0 = minX + 0.5, py0 = minY + 0.5;
        let e0Row = (A12 * (px0 - x2) + B12 * (py0 - y2)); // weight for v0
        let e1Row = (A20 * (px0 - x0) + B20 * (py0 - y0)); // weight for v1
        let e2Row = (A01 * (px0 - x1) + B01 * (py0 - y1)); // weight for v2

        // per-pixel edge increments
        const de0dx = A12, de0dy = B12;
        const de1dx = A20, de1dy = B20;
        const de2dx = A01, de2dy = B01;

        // --- build PERSPECTIVE-CORRECT planes --------------------------------------
        // pre-divided per-vertex terms
        const up0 = u0 / w0c, vp0 = v0uv / w0c, wp0 = 1.0 / w0c;
        const up1 = u1 / w1c, vp1 = v1uv / w1c, wp1 = 1.0 / w1c;
        const up2 = u2 / w2c, vp2 = v2uv / w2c, wp2 = 1.0 / w2c;

        // row-start barycentrics (weights for v0,v1; v2 = 1 - w0 - w1)
        let w0Row = e0Row * invArea;
        let w1Row = e1Row * invArea;
        let w2Row = 1.0 - w0Row - w1Row;

        // row-start planes for u', v', w' and depth z (all affine → adds only per pixel)
        let upRow = w0Row * up0 + w1Row * up1 + w2Row * up2;
        let vpRow = w0Row * vp0 + w1Row * vp1 + w2Row * vp2;
        let wpRow = w0Row * wp0 + w1Row * wp1 + w2Row * wp2;
        // depth (you can also keep clip/NDC depth; here we interpolate the screen z)
        let zRow = w0Row * z0 + w1Row * z1 + w2Row * z2;

        // gradients (x)
        const dw0dx = de0dx * invArea;
        const dw1dx = de1dx * invArea;
        const dw2dx = -dw0dx - dw1dx;

        const dupdx = dw0dx * up0 + dw1dx * up1 + dw2dx * up2;
        const dvpdx = dw0dx * vp0 + dw1dx * vp1 + dw2dx * vp2;
        const dwpdx = dw0dx * wp0 + dw1dx * wp1 + dw2dx * wp2;
        const dzdx = dw0dx * z0 + dw1dx * z1 + dw2dx * z2;

        // gradients (y)
        const dw0dy = de0dy * invArea;
        const dw1dy = de1dy * invArea;
        const dw2dy = -dw0dy - dw1dy;

        const dupdy = dw0dy * up0 + dw1dy * up1 + dw2dy * up2;
        const dvpdy = dw0dy * vp0 + dw1dy * vp1 + dw2dy * vp2;
        const dwpdy = dw0dy * wp0 + dw1dy * wp1 + dw2dy * wp2;
        const dzdy = dw0dy * z0 + dw1dy * z1 + dw2dy * z2;

        // --- raster loop ------------------------------------------------------------
        const near = this.near;
        for (let y = minY; y <= maxY; y++) {
            let e0x = e0Row, e1x = e1Row, e2x = e2Row;
            let up = upRow, vp = vpRow, wp = wpRow, z = zRow;

            let di = y * W + minX;
            let pi = ((y * W + minX) << 2);

            for (let x = minX; x <= maxX; x++) {
                // edge test first (top-left rule via >=0). No casts for precision.
                if (e0x >= 0 && e1x >= 0 && e2x >= 0) {
                    // depth test
                    const zOld = DB[di];
                    if (zOld === 0 || z >= near && z < zOld) {
                        DB[di] = z;

                        // perspective unwarp: u = up/wp, v = vp/wp
                        const invWp = 1.0 / wp;
                        let uu = (up * invWp) | 0;
                        let vv = (vp * invWp) | 0;

                        // clamp (cheap unsigned bound check)
                        if ((uu >>> 0) < texW & (vv >>> 0) < texH) {
                            const ti = ((vv * texW + uu) << 2);
                            FB[pi] = texData[ti];
                            FB[pi + 1] = texData[ti + 1];
                            FB[pi + 2] = texData[ti + 2];
                            //FB[pi + 3] = 255;
                        }
                    }
                }
                // advance x
                e0x += de0dx; e1x += de1dx; e2x += de2dx;
                up += dupdx; vp += dvpdx; wp += dwpdx; z += dzdx;
                di++; pi += 4;
            }

            // next scanline
            e0Row += de0dy; e1Row += de1dy; e2Row += de2dy;
            upRow += dupdy; vpRow += dvpdy; wpRow += dwpdy; zRow += dzdy;
        }
    }
}