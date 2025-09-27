import { TextureLoader } from "./textureLoader.js";
import { Rasterizer } from "./rasterizer.js";
import { KeyEvents } from "./KeyEvents.js";
import { Camera } from "./camera.js";
import { Cube } from "./cube.js";
import { Draw2D } from "./draw.js";
import { BarycentricRasterizer } from "./barycentricRasterizer.js";
import { InterlacedRasterizer } from "./interlacedRasterizer.js";

const c = document.getElementById("view");
const ctx = c.getContext('2d');

const profiler = new Array(2);
profiler[0] = new Float64Array(6);//timers
//profiler[0][0] loadTime, profiler[0][1] frameTime, profiler[0][2] sceneOperations, profiler[0][3] projections, profiler[0][4] vertexShader, profiler[0][5] fragmentShader
profiler[1] = new BigInt64Array(3);//counters (64 because 1920*1080 is close enough to the u32 max to be a problem)
//profiler[1][0] pixelChecks, profiler[1][1] pixelWrites, profiler[1][2] polygonCount, profiler[1][3] fpsCount

profiler[0][0] = performance.now();

const rasterizer = new Rasterizer(c);
const bcRast = new BarycentricRasterizer(rasterizer);
const intRast = new InterlacedRasterizer(rasterizer);
const TL = new TextureLoader(rasterizer);
const d2 = new Draw2D(ctx);

TL.Get(["buffRaph"]);

const camera = new Camera(90 * Math.PI / 180, c.width / c.height, 0.1, 1000);
camera.SetViewport(c.width, c.height);
const KE = new KeyEvents();
const keys = {
    y: true,
    i: false
};
KE.AddEvent("w", () => camera.movement[0] = 1, () => camera.movement[0] = 0);
KE.AddEvent("s", () => camera.movement[1] = 1, () => camera.movement[1] = 0);
KE.AddEvent("a", () => camera.movement[2] = 1, () => camera.movement[2] = 0);
KE.AddEvent("d", () => camera.movement[3] = 1, () => camera.movement[3] = 0);
KE.AddEvent("shift", () => camera.movement[4] = 1, () => camera.movement[4] = 0);
KE.AddEvent(" ", () => camera.movement[5] = 1, () => camera.movement[5] = 0);
KE.AddEvent("arrowleft", () => camera.look[2] = 1, () => camera.look[2] = 0);
KE.AddEvent("arrowright", () => camera.look[3] = 1, () => camera.look[3] = 0);
KE.AddEvent("arrowup", () => camera.look[0] = 1, () => camera.look[0] = 0);
KE.AddEvent("arrowdown", () => camera.look[1] = 1, () => camera.look[1] = 0);
KE.AddEvent("y", () => keys.y = !keys.y);
KE.AddEvent("i", () => keys.i = !keys.i);

const cube1 = new Cube([0, 0, -50], [0, 0, 0], 10);
const cube2 = new Cube([0, 0, 50], [0, 0, 0], 8);
let objects = [cube1, cube2];

let faceBuffer = [];
for (let obj of objects) {
    faceBuffer.push(...obj.faces);
}
let frameCount = 0;
let avgFPS = 0;
let displayedFPS = avgFPS;
let elapsedTime = 0;
let previousElapsed = 0;
let lastTime = performance.now();
function NewFrame() {
    let thisTime = performance.now();
    let deltaTime = (thisTime - lastTime) / 1000;
    lastTime = thisTime;
    elapsedTime += deltaTime;
    profiler[0][2] = performance.now();
    cube1.AddRotation([0.01, 0.01, 0]);
    camera.Update(deltaTime);
    profiler[0][2] = performance.now() - profiler[0][2];
    profiler[0][3] = performance.now();
    camera.ProjectGeo(objects);
    profiler[0][3] = performance.now() - profiler[0][3];

    profiler[0][4] = 0;
    profiler[0][5] = 0;
    profiler[1][1] = BigInt(0);
    profiler[1][0] = BigInt(0);
    profiler[1][2] = BigInt(0);
    if (keys.i) {
        intRast.DrawPolygons(faceBuffer, profiler);
    }
    else {
        if (keys.y) {
            rasterizer.DrawPolygons(faceBuffer, profiler);
        }
        else {
            bcRast.DrawPolygons(faceBuffer, profiler);
        }
    }
    d2.Line([c.width / 2 - 5, c.height / 2], [c.width / 2 + 5, c.height / 2]);
    d2.Line([c.width / 2, c.height / 2 - 5], [c.width / 2, c.height / 2 + 5]);

    avgFPS = 1 / deltaTime;
    if (elapsedTime > previousElapsed + 1) {
        previousElapsed = elapsedTime;
        displayedFPS = frameCount;
        frameCount = 0;
    }
    d2.Text("FPS:", 0, 30);
    d2.Text(displayedFPS, 150, 30);
    d2.Text("Polygons:", 0, 60);
    d2.Text(faceBuffer.length, 150, 60);
    d2.Text("Rendered:", 0, 90);
    d2.Text(profiler[1][2].toString(), 150, 90);
    d2.Text("Checks:", 0, 120);
    d2.Text(profiler[1][0].toString(), 150, 120);
    d2.Text("Writes:", 0, 150);
    d2.Text(profiler[1][1].toString(), 150, 150);
    d2.Text("Load Time:", 0, 180);
    d2.Text(profiler[0][0].toFixed(2) + " ms", 150, 180);

    d2.BarGraph(c.width - 400, 0, [profiler[0][2], profiler[0][3], profiler[0][4], profiler[0][5]], 400, 100, ["red", "green", "blue", "yellow"]);
    d2.Text("Scene:", c.width - 400, 20, "20px Arial", "black");
    d2.Text(profiler[0][2].toFixed(4), c.width - 325, 20, "20px Arial", "black");
    d2.Text("Proj:", c.width - 400, 40, "20px Arial", "black");
    d2.Text(profiler[0][3].toFixed(4), c.width - 325, 40, "20px Arial", "black");
    d2.Text("Vert:", c.width - 400, 60, "20px Arial", "black");
    d2.Text(profiler[0][4].toFixed(4), c.width - 325, 60, "20px Arial", "black");
    d2.Text("Frag:", c.width - 400, 80, "20px Arial", "black");
    d2.Text(profiler[0][5].toFixed(4), c.width - 325, 80, "20px Arial", "black");

    frameCount++;
    window.requestAnimationFrame(NewFrame);
}
TL.Load(() => {
    profiler[0][0] = performance.now() - profiler[0][0];
    NewFrame();
});