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

TL.Get(["buffRaph"]);

const camera = new Camera();
camera.SetViewport(window.innerWidth, window.innerHeight);
const KE = new KeyEvents();
KE.AddEvent("w", () => camera.movement[0] = 1, () => camera.movement[0] = 0);
KE.AddEvent("s", () => camera.movement[1] = 1, () => camera.movement[1] = 0);
KE.AddEvent("a", () => camera.movement[2] = 1, () => camera.movement[2] = 0);
KE.AddEvent("d", () => camera.movement[3] = 1, () => camera.movement[3] = 0);
KE.AddEvent("shift", () => camera.movement[4] = 1, () => camera.movement[4] = 0);
KE.AddEvent(" ", () => camera.movement[5] = 1, () => camera.movement[5] = 0);
KE.AddEvent("arrowleft", () => camera.AddRotation([0, -0.1, 0]));
KE.AddEvent("arrowright", () => camera.AddRotation([0, 0.1, 0]));
KE.AddEvent("arrowup", () => camera.AddRotation([-0.1, 0, 0]));
KE.AddEvent("arrowdown", () => camera.AddRotation([0.1, 0, 0]));
KE.AddEvent("y", () => rasterizer.uvMode = !rasterizer.uvMode);

const cube1 = new Cube([0, 0, -5], [0, 0, 0], 1);

let buff = [];
camera.ProjectGeo(cube1,buff);
console.log(buff);

function NewFrame() {
    let zBuffer = [];
    cube1.AddRotation([0.01, 0.01, 0]);
    camera.Update();
    camera.ProjectGeo(cube1,zBuffer);

    rasterizer.DrawPolygons(zBuffer,profiler);

    window.requestAnimationFrame(NewFrame);   
}
TL.Load(() => NewFrame());