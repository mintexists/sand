/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("canvas");
let size = 3000;
canvas.width = size;
canvas.height = size;
let pixels = new Uint8Array(size * size * 4);
const gl = canvas.getContext("webgl");

function getShaderFromUrl(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return req.responseText;
}

//#region Mouse

function  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    let scaleX = 1 / rect.width;
    let scaleY = 1 / rect.height;
    let x = (evt.clientX - rect.left) * scaleX;
    let y = (evt.clientY - rect.top) * scaleY;
    y = 1 - y;
    return { x, y };
}

cursor = [0, 0];
document.addEventListener("mousemove", e => {
    let pos = getMousePos(canvas, e);
    cursor = [pos.x, pos.y];   
});
mouseDown = false;
document.addEventListener("mousedown", e => {
    mouseDown = true;
});
document.addEventListener("mouseup", e => {
    mouseDown = false;
});

//#endregion

let vs = getShaderFromUrl("shader.vert");
let fs = getShaderFromUrl("shader.frag");

console.group("%cShader", "font-size: large");
console.log(vs);
console.log(fs);
console.groupEnd();

const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

const arrays = {
    position:  {
        data: [
            1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
            -1.0, -1.0,
        ],
        numComponents: 2,
    },
};

const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

let texture = twgl.createTexture(gl, {
    width: size,
    height: size,
})

let fb = twgl.createFramebufferInfo(gl, [
    { attachment: texture },
], size, size);

twgl.bindFramebufferInfo(gl, null);

// twgl.setTextureFromArray(gl, texture, pixels);

function render() {
    let uniforms = {
        resolution: [gl.canvas.width, gl.canvas.height],
        time: performance.now() / 1000.0,
        cursor: cursor,
        mouseDown,
        texture,
    };

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP);

    requestAnimationFrame(render);
}

window.onload = () => {
    requestAnimationFrame(render);
}