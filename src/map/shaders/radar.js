const frag = `precision highp float;
                      varying vec2 vUv;
                      
                      // This float contains the time, in milliseconds, since
                      // the webpage was loaded.
                      uniform float uNow;

                        // 旋转函数
                        vec2 rotate(vec2 uv, float rotation, vec2 mid) {
                            return vec2(cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x, cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y);
                        }


                        void main(void) {

                            vec2 rotateUv = rotate(vUv, -uNow /200.0, vec2(0.0));
                            float alpha = 1.0 - step(0.5, distance(vUv, vec2(0.0)));
                            float angle = atan(rotateUv.x, rotateUv.y);
                            float strength = (angle + 3.14) / 6.28;
                            gl_FragColor = vec4(strength, strength, strength, alpha);
                          }`;


const vertex = `attribute vec2 aCRSCoords;
attribute vec2 aExtrudeCoords;
uniform mat4 uTransformMatrix;
uniform vec2 uPixelSize;

attribute float aPixelSize;

varying vec2 vPixel;
varying vec2 vUv;

void main(void) {
  // Copy the input extrude coords to the varying
    vPixel = aExtrudeCoords * aPixelSize;
    vUv=aExtrudeCoords;

  gl_Position =
    uTransformMatrix * vec4(aCRSCoords, 1.0, 1.0) +
    vec4(vPixel * uPixelSize , 0.0, 0.0);
}`;
export default { frag, vertex };
