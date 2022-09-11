precision mediump float;

uniform bool firstFrame;
uniform sampler2D texture;
uniform vec2 resolution;
uniform float time;
uniform vec2 cursor;
uniform bool mouseDown;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    color = texture2D(texture, uv);

    // color.xy = uv;

    // if (uv.x + uv.y > 1.0) {
    //     color = vec4(1.0, 1.0, 1.0, 1.0);
    // } else {
    //     color = vec4(0.0, 0.0, 0.0, 1.0);
    // }

    gl_FragColor = color;
}
