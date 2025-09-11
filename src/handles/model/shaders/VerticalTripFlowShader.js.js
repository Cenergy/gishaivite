/*
 * @Author: your name
 * @Date: 2020-05-13 16:50:31
 * @LastEditTime: 2020-10-19 17:15:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 
 */

import { THREE, GLTFLoader, FBXLoader, DRACOLoader } from '@/utils/three.js';

class VerticalTripFlowShader {
    constructor(object) {
        this.THREE = THREE;
        this.uniforms = {
            gradualColorStart: {
                value: new THREE.Color("#001327")
            },
            gradualColorEnd: {
                value: new THREE.Color("#00FFFF")
            },
            gradualPositionYStart: {
                value: 0
            },
            gradualPositionYEnd: {
                value: 20
            },
            rowLightHeight: {
                value: 0
            },
            rowLightWidth: {
                value: 10
            },
            selfTexture: {},
            rowLightColor: {
                value: new THREE.Color("#88FF69")
            },
            shaderOpacity: {
                value: .9
            },
            colLineZ: {
                value: -200
            },
            colLineWidth: {
                value: 10
            },
            colLineColor: {
                value: new THREE.Color("#b017ff")
            },
            circleCenter: {
                value: new THREE.Vector3(0, 0, 0)
            },
            circleMinR: {
                value: 0
            },
            circleWidth: {
                value: 20
            },
            colorCircle: {
                value: new THREE.Color("#b017ff")
            }
        };

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: "        varying vec2 vUv;\n        varying vec3 v_p;\n        void main() {\n            vUv = uv;\n            v_p = position;\n            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n         } ",
            fragmentShader: `// 根据片元的高度来渐变
                     const float PI = 3.141592654;
                     uniform float rowLightHeight;        
                     uniform float rowLightWidth;       
                     uniform float shaderOpacity;        
                     //uniform float colLineZ;        
                     //uniform float colLineWidth;        
                     uniform float gradualPositionYStart;        
                     uniform float gradualPositionYEnd;        
                     uniform sampler2D selfTexture;       
                     uniform vec3 gradualColorStart;        
                     uniform vec3 gradualColorEnd;        
                     uniform vec3 rowLightColor;       
                     uniform vec3 colLineColor;        
                     //uniform vec3 colorCircle;        
                     uniform vec3 circleCenter;        
                     //uniform float circleMinR;        
                     //uniform float circleWidth;        
                     varying vec2 vUv;        
                     varying vec3 v_p;       
                     float getLeng(float x, float z){           
                       return  sqrt((x-circleCenter.x)*(x-circleCenter.x)+(z-circleCenter.z)*(z-circleCenter.z)); //sqrt开根号 取R        
                     }             
                     float plot (vec2 st, float pct){          
                       return  smoothstep( pct-rowLightWidth, pct, v_p.y) - smoothstep( pct, pct+0.02, v_p.y);        
                     }        
                    void main(){        
                      float f1 = plot(vUv,rowLightHeight);        
                      vec4 b1 = vec4(rowLightColor.r, rowLightColor.g, rowLightColor.b, 1.0) ;        
                      vec3 gradient =  mix(gradualColorStart, gradualColorEnd, smoothstep( gradualPositionYStart, gradualPositionYEnd, v_p.y)); //内置 smoothstep法渐变        
                      gl_FragColor = mix(vec4(gradient,1.),b1,f1);  //渐变与光效混合       
                      gl_FragColor = mix(texture2D(selfTexture, vUv),vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,shaderOpacity),0.5);  //再混合材质    
                      
                      //扩散扫描shader 先关掉
                      //if( abs(v_p.z - colLineZ) <= colLineWidth ) { // 如果在扫描线范围内           
                      //  gl_FragColor = mix(   vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,1), vec4(colLineColor.r,colLineColor.g,colLineColor.b,(1.0- abs(v_p.z - colLineZ) / colLineWidth) * 0.9), 0.5);
                      //}        
                      //float cr = getLeng(v_p.x,v_p.z);          
                      //  if (abs(cr - circleMinR) <= circleWidth ) {          
                      //    gl_FragColor = mix(vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,1), vec4(colorCircle.r,colorCircle.g,colorCircle.b,(1.0- abs(cr - circleMinR) / circleWidth) * 0.9),0.5);            
                      //}      
                      
                    } `,
            side: THREE.DoubleSide
        });

    }
}

export { VerticalTripFlowShader };
