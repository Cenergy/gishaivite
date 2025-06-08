const frag = `precision highp float;
                      varying vec2 vPixel;
                      
                      // This float contains the time, in milliseconds, since
                      // the webpage was loaded.
                      uniform float uNow;
                      
                      float hue2rgb(float f1, float f2, float hue) {
                          if (hue < 0.0)
                              hue += 1.0;
                          else if (hue > 1.0)
                              hue -= 1.0;
                          float res;
                          if ((6.0 * hue) < 1.0)
                              res = f1 + (f2 - f1) * 6.0 * hue;
                          else if ((2.0 * hue) < 1.0)
                              res = f2;
                          else if ((3.0 * hue) < 2.0)
                              res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
                          else
                              res = f1;
                          return res;
                      }
                      
                      vec3 hsl2rgb(vec3 hsl) {
                          vec3 rgb;
                      
                          if (hsl.y == 0.0) {
                              rgb = vec3(hsl.z); // Luminance
                          } else {
                              float f2;
                              if (hsl.z < 0.5)
                                  f2 = hsl.z * (1.0 + hsl.y);
                              else
                                  f2 = hsl.z + hsl.y - hsl.y * hsl.z;
                              float f1 = 2.0 * hsl.z - f2;
                      
                              rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
                              rgb.g = hue2rgb(f1, f2, hsl.x);
                              rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
                          }
                          return rgb;
                      }
                      
                      void main(void) {
                        float radiusSquared = vPixel.x * vPixel.x + vPixel.y * vPixel.y;
                        float angle = atan(vPixel.y, vPixel.x);
                        float hue = angle / (2.0 * 3.14159);
                      
                        float radius1 = sqrt(radiusSquared)/30.0;
                      
                          // Make the hue a function of the current time.
                          hue += sin(uNow * 3.14159 / 1000.0) * (1.0 - radius1);
                          hue = fract(hue);
                        vec3 colour = hsl2rgb(vec3(hue, 1.0, 0.5));
                      
                        float alpha = smoothstep(30.0*30.0, 28.0*28.0, radiusSquared);
                      
                        gl_FragColor = vec4(colour, alpha);
                      
                      }`;

const vertex = `attribute vec2 aCRSCoords;
attribute vec2 aExtrudeCoords;
uniform mat4 uTransformMatrix;
uniform vec2 uPixelSize;

varying vec2 vPixel;

void main(void) {
  // Copy the input extrude coords to the varying
    vPixel = aExtrudeCoords * 30.0;

  gl_Position =
    uTransformMatrix * vec4(aCRSCoords, 1.0, 1.0) +
    vec4(aExtrudeCoords * uPixelSize * 30.0, 0.0, 0.0);
}`;
export default { frag, vertex };
