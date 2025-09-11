/*
 * @Author: your name
 * @Date: 2020-05-13 16:50:31
 * @LastEditTime: 2020-10-19 17:15:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 
 */

import { THREE, GLTFLoader, FBXLoader, DRACOLoader } from '@/utils/three.js';

class VerticalFlowShader {
    constructor(object) {
        this.THREE =THREE;
        this.uniforms = {
            lightCenterHeight: {
                value: 0
            },
            bottomGradientDistance: {
                value: 50
            },
            topGradientDistance: {
                value: 0
            },
            geometryMaxHeight: {
                value: 0
            },
            bottomColor: {
                value: new THREE.Color("rgb(0,19,39)")
            },
            topColor: {
                value: new THREE.Color('rgb(0,255,255)')// 
            },
            flowColor: {
                value: new THREE.Color("rgb(255,103,19)") //流动效果颜色
            },
            opacity: {
                value: 1
            },
        };
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `varying vec2 vUv;
                             varying float v_py;   
                             void main() {       
                                vUv = uv;        
                                v_py = position.y;//本地坐标Y值
                                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);        
                             } `,
            fragmentShader: ` 
               //根据片元的高度来渐变    
               varying vec2 vUv;        
               uniform float lightCenterHeight;//效果中心的高度        
               uniform float topGradientDistance;//效果向上渐变距离
               uniform float bottomGradientDistance;//效果向下渐变距离  
               uniform float geometryMaxHeight;      
               uniform sampler2D texture1;       
               varying float v_py;        
               uniform vec3 bottomColor;       
               uniform vec3 topColor;        
               uniform vec3 flowColor;  
               uniform float opacity;    
               float plot (float pct){          
                   //得到以lightCenterHeight中心高度，往下以及往下流动效果的颜色的占比，本plot计算得到就是从中心到两侧结果值逐渐从1减弱到0
                   return  smoothstep( lightCenterHeight-bottomGradientDistance, lightCenterHeight, v_py) - smoothstep( lightCenterHeight, lightCenterHeight + topGradientDistance, v_py); 
               }        
               void main(){        
                   float f1 = plot(lightCenterHeight);   
                   //设置流动效果颜色  
                   vec4 flowC= vec4(flowColor.r, flowColor.g, flowColor.b, 1.0) ;      
                   //对顶部和底部颜色进行插值，得到模型的基础色的渲染
                   vec3 gradient =  mix(bottomColor, topColor, smoothstep( 0.0, geometryMaxHeight, v_py)); //内置 smoothstep法渐变        // vec3 gradient = mix(bottomColor, topColor, v_py * 0.1); // 除法渐变 0.1 或者说 10.0 是指停止渐变高度     
                   //在模型基础色的基础上进行流动效果的渲染，gradient *（1-f1）+ flowC * f1
                   gl_FragColor = mix(vec4(gradient,1.),flowC,f1);  //渐变与光效混合       // gl_FragColor = vec4(gradient,1.); // 仅仅渐变色   
                   gl_FragColor =  vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,0.9*opacity);
 
 
                   //gl_FragColor =  mix(vec4(vcolor,1.0),vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,0.9),0.9);
                   //gl_FragColor = mix(texture2D(texture1, vUv),vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,0.9),0.9);
                   //再混合材质
               } `,
            // side: THREE.DoubleSide,
            // wireframe: true,
            transparent: true,
        });

    }
}

export { VerticalFlowShader };
