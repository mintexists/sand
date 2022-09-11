precision mediump float;

uniform bool firstFrame;
uniform sampler2D texture;
uniform vec2 resolution;
uniform float time;
uniform vec2 cursor;
uniform bool mouseDown;

float cnoise(vec2 a);
// ${classicnoise2D}

float mapRange(float value, float low1, float high1, float low2, float high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

bool inEpsilon(float value, float target, float epsilon) {
    return abs(value - target) < epsilon;
}

vec2 pos(vec2 offset) {
    float x = gl_FragCoord.x + offset.x;
    float y = gl_FragCoord.y + offset.y;
    return vec2(x / resolution.x, y / resolution.y);
}

vec4 texture2DOffset(sampler2D tex, vec2 uv) {
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        return vec4(0.0);
    }
    return texture2D(tex, uv);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

    if (firstFrame) {
        if (inEpsilon(uv.x, .5, .5 / resolution.x)) {
            color = vec4(1.0, 1.0, 1.0, 1.0);
        }
        // color.xyz = vec3(mapRange(cnoise(vec2(uv * 20.0)), -1.0, 1.0, 0.0, 1.0) > .7 ? 1.0 : 0.0);
        gl_FragColor = color;
        return;
    }

    color = texture2D(texture, uv);

    int neighbors = 0;

    for (float xM = -1.0; xM < 2.0; xM++) {
        for (float yM = -1.0; yM < 2.0; yM++) {
            if (xM == 0.0 && yM == 0.0) continue;
            vec2 neighbor = pos(vec2(xM, yM));
            if (texture2DOffset(texture, neighbor).xyz == vec3(1)) neighbors++;
        }
    }

    if (texture2D(texture, uv).xyz == vec3(1.0)) {
        if (neighbors < 2 || neighbors > 3) color.xyz = vec3(0.0);
    } else {
        if (neighbors == 3) color.xyz = vec3(1.0);
    }

    if (color.xyz != vec3(1.0)) {
        color.xyz = texture2D(texture, uv).xyz - .005;
    }

    // color.xyz = vec3(float(neighbors) / 10.0);

    // if (uv.x + uv.y > 1.0) {
    //     color = vec4(1.0, 1.0, 1.0, 1.0);
    // } else {
    //     color = vec4(0.0, 0.0, 0.0, 1.0);
    // }

    gl_FragColor = color;
}
