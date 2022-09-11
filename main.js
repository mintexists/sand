/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("canvas");
let size = 4000;
canvas.width = size;
canvas.height = size;
let pixels = new Uint8Array(size * size * 4);
const gl = canvas.getContext("webgl");

let shaderImports = ["classicnoise2D"]

shaderImports.forEach(shader => {
    window[shader] = `Import ${shader}\n${getShaderFromUrl(`${shader}.glsl`)}`;
})

function getShaderFromUrl(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    let text = req.responseText;
    return eval(`\`${text}\``);
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

let firstFrame = true;

class Machine {
    constructor(gl, vs, fs, arrays) {
        this.gl = gl;
        this.vs = getShaderFromUrl(vs);
        this.fs = getShaderFromUrl(fs);
        this.arrays = arrays;

        this.programInfo = twgl.createProgramInfo(this.gl, [this.vs, this.fs]);
        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, this.arrays);

        // this.framebuffer = twgl.createFramebufferInfo(gl, [{ attachment: this.texture }]);
        // twgl.bindFramebufferInfo(gl, null);

        console.group("%cShader", "font-size: large");
        console.log(this.vs);
        console.log(this.fs);
        console.groupEnd();
    }

    render(texture) {
        let uniforms = {
            firstFrame,
            texture,
            resolution: [gl.canvas.width, gl.canvas.height],
            time: performance.now() / 1000.0,
            cursor: cursor,
            mouseDown,
        }
        firstFrame = false;
        
        gl.useProgram(this.programInfo.program);
        twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);
        twgl.setUniforms(this.programInfo, uniforms);
        twgl.drawBufferInfo(gl, this.bufferInfo, gl.TRIANGLE_STRIP);
    }
}

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

let MachineX = new Machine(gl, "shader.vert", "shader.frag", arrays);
let MachineY = new Machine(gl, "shader.vert", "display.frag", arrays);

let TextureA = twgl.createTexture(gl, { width: size, height: size });
let TextureB = twgl.createTexture(gl, { width: size, height: size });

let FBA = twgl.createFramebufferInfo(gl, [{ attachment: TextureA }]);
let FBB = twgl.createFramebufferInfo(gl, [{ attachment: TextureB }]);
twgl.bindFramebufferInfo(gl, null);

let frame = 0;

function render() {
    if (frame % 2 == 0) {
        twgl.bindFramebufferInfo(gl, FBA);
        MachineX.render(FBB.attachments[0]);
        twgl.bindFramebufferInfo(gl, null);
        MachineY.render(FBA.attachments[0]);
    } else {
        twgl.bindFramebufferInfo(gl, FBB);
        MachineX.render(FBA.attachments[0]);
        twgl.bindFramebufferInfo(gl, null);
        MachineY.render(FBB.attachments[0]);
    }

    frame++;

    requestAnimationFrame(render);
}

window.onload = () => requestAnimationFrame(render);

// function render() {
//     let uniforms = {
//         resolution: [gl.canvas.width, gl.canvas.height],
//         time: performance.now() / 1000.0,
//         cursor: cursor,
//         mouseDown,
//         texture,
//     };

//     gl.useProgram(programInfo.program);
//     twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
//     twgl.setUniforms(programInfo, uniforms);
//     twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP);

//     requestAnimationFrame(render);
// }

// window.onload = () => {
//     requestAnimationFrame(render);
// }