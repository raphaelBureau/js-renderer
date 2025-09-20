import { TextureLoader } from "./textureLoader.js";
import { Rasterizer } from "./rasterizer.js";
import { KeyEvents } from "./KeyEvents.js";
import { Camera } from "./camera.js";
import { Cube } from "./cube.js";

const c = document.getElementById("view");
const ctx = c.getContext('2d');

const profiler = new Array(2);
profiler[0] = new Float32Array(1);//timers
//profiler[0][0] loadTime, profiler[0][1] frameTime, profiler[0][2] sceneOperations, profiler[0][3] projections, profiler[0][4] rasterisation
profiler[1] = new BigInt64Array(2);//counters (64 because 1920*1080 is close enough to the u32 max to be a problem)
//profiler[1][0] pixelChecks, profiler[1][1] pixelWrites, profiler[1][2] polygonCount, profiler[1][3] fpsCount

const rasterizer = new Rasterizer(c);
const TL = new TextureLoader(rasterizer);

const camera = new Camera();

const cube1 = new Cube([-10, 0, 20], [0, 0, 0], 5);

function NewFrame() {
    let zBuffer = [];
    camera.ProjectGeo(cube1,zBuffer);

    rasterizer.DrawPolygons(zBuffer,profiler);

    window.requestAnimationFrame(NewFrame);   
}
NewFrame();