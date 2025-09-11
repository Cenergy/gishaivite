import { THREE, GLTFLoader, DRACOLoader } from '@/utils/three.js';
import GlobeAnimation from "./animations/GlobeAnimation.js";
import * as shadermaterial from './shaders.js'
import * as TWEEN from 'tween'


class Visualization {
  constructor(object) {
    this.renderorder = 0;
  }
  setRenderOrder(order) {
    if (!this.mesh) return;
    this.renderorder = order;
    this.mesh.renderOrder = this.renderorder;
  }
  setBloom(bloom) {
    if (!this.mesh) return;
    if (typeof bloom === 'boolean' && bloom) {
      this.mesh.layers.enable(1);
    } else if (typeof bloom === 'boolean' && !bloom) {
      this.mesh.layers.disable(1);
    }
  }
  setShow(show) {
    if (!this.mesh) return;
    if (typeof show === 'boolean' && show) {
      this.show = show;
      this.mesh.material.visible = this.show;
    } else if (typeof show === 'boolean' && !show) {
      this.show = show;
      this.mesh.material.visible = this.show;
    }
  }
  rotateX(rx) {
    if (!this.mesh) return;
    this.rx = rx;
    this.mesh.rotation.x = (rx * Math.PI) / 180;
  }
  rotateY(ry) {
    if (!this.mesh) return;
    this.ry = ry;
    this.mesh.rotation.y = (ry * Math.PI) / 180;
  }
  rotateZ(rz) {
    if (!this.mesh) return;
    this.rz = rz;
    this.mesh.rotation.z = (rz * Math.PI) / 180;
  }
  setScale(scale) {
    if (!this.mesh) return;
    this.scale = scale;
    this.mesh.scale.set(scale, scale, scale);
  }
  remove() {
    if (!this.mesh) return;
    this.tb.remove(this.mesh);
  }
}



class DracoModel extends Visualization {
  constructor(object) {
    super();
    this.THREE = THREE;
    this.draco_wasm_wrapper_js_url = object.hasOwnProperty(
      "draco_wasm_wrapper_js_url"
    )
      ? object.draco_wasm_wrapper_js_url
      : "";
    this.draco_decoder_wasm_url = object.hasOwnProperty(
      "draco_decoder_wasm_url"
    )
      ? object.draco_decoder_wasm_url
      : "";
    this.dracoLoader = new DRACOLoader(
      this.draco_wasm_wrapper_js_url,
      this.draco_decoder_wasm_url
    );
    this.tb = object.threebox;
    this.loader = new GLTFLoader();
    this.center = object.center;
    this.height = object.hasOwnProperty("height") ? object.height : 0;
    this.opacity = 1;
    this.scale = object.hasOwnProperty("scale") ? object.scale : 0.1;
    this.geometryMaxHeight = 0;//用于记录模型最大高度，默认模型数据原点在底部中心
    //自定义shader特效
    this.customerShaderMaterial = object.hasOwnProperty("customerShaderMaterial");
    this.customerShaderConfig = object.hasOwnProperty("customerShaderConfig") ? object.customerShaderConfig : {
      bottomColor: "rgb(0,19,39)",
      topColor: 'rgb(0,255,255)',
      flowColor: 'rgb(255,103,19)',
      bottomGradientDistance: 50,
      topGradientDistance: 5,
      speed: 200,
    }
    if (this.customerShaderMaterial) {
      this.shadermaterial = new shadermaterial.VerticalFlowShader().material;
      this.shadermaterial.uniforms.bottomColor.value = new THREE.Color(this.customerShaderConfig.bottomColor !== undefined ? this.customerShaderConfig.bottomColor : 'rgb(0,19,39)');
      this.shadermaterial.uniforms.topColor.value = new THREE.Color(this.customerShaderConfig.topColor !== undefined ? this.customerShaderConfig.topColor : 'rgb(0,255,255)');
      this.shadermaterial.uniforms.flowColor.value = new THREE.Color(this.customerShaderConfig.flowColor !== undefined ? this.customerShaderConfig.flowColor : 'rgb(255,103,19)');
      this.shadermaterial.uniforms.bottomGradientDistance.value = this.customerShaderConfig.bottomGradientDistance;
      this.shadermaterial.uniforms.topGradientDistance.value = this.customerShaderConfig.topGradientDistance;
      this.shadermaterial.wireframe = this.customerShaderConfig.wireframe !== undefined ? this.customerShaderConfig.wireframe : false;
      this.shadermaterial.speed = this.customerShaderConfig.speed !== undefined ? this.customerShaderConfig.speed : 200;;
    }
    this.textureAnimationConfig = object.hasOwnProperty("textureAnimationConfig") ? object.textureAnimationConfig : null;
    if (this.textureAnimationConfig) {
      this.texture = new THREE.TextureLoader().load(
        this.textureAnimationConfig.textureUrl
      );
      this.texture.wrapS = this.textureAnimationConfig.textureWrapS
        ? THREE.RepeatWrapping
        : THREE.ClampToEdgeWrapping;
      this.texture.wrapT = this.textureAnimationConfig.textureWrapT
        ? THREE.RepeatWrapping
        : THREE.ClampToEdgeWrapping;
      this.texture.repeat.x = this.textureAnimationConfig.textureRepeatX
        ? this.textureAnimationConfig.textureRepeatX
        : 1;
      this.texture.repeat.y = this.textureAnimationConfig.textureRepeatY
        ? this.textureAnimationConfig.textureRepeatY
        : 3;
      this.textureAnimationDirection = this.textureAnimationConfig
        .textureAnimationDirection
        ? this.textureAnimationConfig.textureAnimationDirection
        : "y";
      this.repeatXSpeed = this.textureAnimationConfig.repeatXSpeed
        ? this.textureAnimationConfig.repeatXSpeed
        : 0.01;
      this.repeatYSpeed = this.textureAnimationConfig.repeatYSpeed
        ? this.textureAnimationConfig.repeatYSpeed
        : 0.01;
    }
    this.colorBreathConfig = object.hasOwnProperty("colorBreathConfig")
      ? object.colorBreathConfig
      : null;
    if (this.colorBreathConfig) {
      this.colorBreath = this.colorBreathConfig.colorBreath
        ? new THREE.Color(this.colorBreathConfig.colorBreath)
        : new THREE.Color(0, 0, 0);
      this.colorBreathEnd = this.colorBreathConfig.colorBreathEnd
        ? new THREE.Color(this.colorBreathConfig.colorBreathEnd)
        : new THREE.Color(0, 0, 0);
      this.colorBreathOpacity =
        this.colorBreathConfig.colorBreathOpacity != undefined
          ? this.colorBreathConfig.colorBreathOpacity
          : null;
      this.colorBreathEndOpacity =
        this.colorBreathConfig.colorBreathEndOpacity != undefined
          ? this.colorBreathConfig.colorBreathEndOpacity
          : null;
      this.colorBreathTemp = 0;
      this.colorBreathOpacityTemp = 0;
      this.colorBreathSpeed = this.colorBreathConfig.colorBreathSpeed
        ? this.colorBreathConfig.colorBreathSpeed
        : 200;
      this.ri =
        (this.colorBreathEnd.r * 255 - this.colorBreath.r * 255) /
        this.colorBreathSpeed;
      this.gi =
        (this.colorBreathEnd.g * 255 - this.colorBreath.g * 255) /
        this.colorBreathSpeed;
      this.bi =
        (this.colorBreathEnd.b * 255 - this.colorBreath.b * 255) /
        this.colorBreathSpeed;
      this.ai =
        (this.colorBreathEndOpacity - this.colorBreathOpacity) /
        this.colorBreathSpeed;
      if (this.ri < 0) {
        this.colorBreathForward = 0;
      } else {
        this.colorBreathForward = 1;
      }
      if (this.ai < 0) {
        this.colorBreathOpacityForward = 0;
      } else {
        this.colorBreathOpacityForward = 1;
      }
      this.colorBreathMeshes = [];
    }
    this._scale = this.scale;
    this.rxSpeed = 1;
    this.rySpeed = 1;
    this.rzSpeed = 1;
    this._rotateX = this._rotateXAnimation.bind(this);
    this._rotateY = this._rotateYAnimation.bind(this);
    this._rotateZ = this._rotateZAnimation.bind(this);
    this._texAnimation = this._textureAnimation.bind(this);
    this._colBreAnimation = this._colorBreathAnimation.bind(this);
    this._verticalFlowShaderUpdate = this._verticalFlowShaderAnimation.bind(this);
    this.rx = object.hasOwnProperty("rx") ? object.rx : 90;
    this.ry = object.hasOwnProperty("ry") ? object.ry : 0;
    this.rz = object.hasOwnProperty("rz") ? object.rz : 0;
    this.needLoad = object.hasOwnProperty("needLoad") ? object.needLoad : true;
    this.url = object.url;
    this.show = true;
    this.materialOpacitys = [];
    this.rotateallback = () => {
      try {
        const bearing = - this.tb.map.getBearing();
        this.rotateY(bearing);
      } catch (e) { }
    };

    if (this.needLoad) {
      this.ready = this._init();
    }
  }

  async _init() {
    return new Promise((resolve) => {
      this.loader.setDRACOLoader(this.dracoLoader);
      this.loader.load(
        this.url,
        (gltf) => {
          this.gltf = gltf;
          gltf.scene.traverse((item) => {
            if (item.type === 'Mesh') {
              if (item.geometry.boundingBox.max.y > this.geometryMaxHeight) {
                this.geometryMaxHeight = item.geometry.boundingBox.max.y
              }
            }
            if (item.material) {
              // material = item.material;
              item.material.transparent = true;
              item.material.depthWrite = true;
              this.materialOpacitys.push(item.material.opacity);
              //使用自定义shader
              if (this.customerShaderMaterial) {
                item.material = this.shadermaterial;
                this.shadermaterial.uniforms.geometryMaxHeight.value = this.geometryMaxHeight;
                this.shadermaterialAnimationSpeed = this.geometryMaxHeight / this.shadermaterial.speed;//自定义材质动画使用
              } else {
                // 纹理动画
                if (
                  this.textureAnimationConfig &&
                  item.material.name.indexOf("texanim") > 0
                ) {
                  item.material.map = this.texture;
                  item.material.color = new THREE.Color(
                    this.textureAnimationConfig.textureColor
                  );
                }
                if (
                  this.colorBreathConfig &&
                  item.material.name.indexOf("colorbreath") > 0
                ) {
                  item.material.color = new THREE.Color(
                    this.colorBreathConfig.colorBreath
                  );
                  if (
                    this.colorBreathOpacity != null &&
                    this.colorBreathEndOpacity != null
                  ) {
                    item.material.transparent = true;
                    item.material.opacity = this.colorBreathOpacity;
                  }
                  this.colorBreathMeshes.push(item);
                }
              }
            }
          });


          this.mesh = this.tb.Object3D({ obj: gltf.scene, projection: this.tb.projection }).setCoords([this.center[0], this.center[1], this.height]);
          this.setScale(this.scale);
          this.rotateX(this.rx);
          this.rotateY(this.ry);
          this.rotateZ(this.rz);
          this.tb.add(this.mesh);
          resolve(true);
        },
        (xhr) => {
          //进度
        }
      );
    });
  }


  setBloom(bloom) {
    if (typeof bloom === "boolean" && bloom) {
      this.mesh.traverse((item) => {
        item.layers.enable(1);
      });
    } else if (typeof bloom === "boolean" && !bloom) {
      this.mesh.traverse((item) => {
        item.layers.disable(1);
      });
    }
  }

  setBloomPart(bloom) {
    if (typeof bloom === "boolean" && bloom) {
      this.mesh.traverse((item) => {
        if (item.material) {
          if (item.material.name.indexOf("bloom") > 0) {
            item.layers.enable(1);
          }
        }
      });
    } else if (typeof bloom === "boolean" && !bloom) {
      this.mesh.traverse((item) => {
        if (item.material) {
          if (item.material.name.indexOf("bloom") > 0) {
            item.layers.disable(1);
          }
        }
      });
    }
  }

  _rotateXAnimation() {
    this.rx += this.rxSpeed;
    this.rotateX(this.rx);
  }

  _rotateYAnimation() {
    this.ry += this.rySpeed;
    this.rotateY(this.ry);
  }

  _rotateZAnimation() {
    this.rz += this.rzSpeed;
    this.rotateZ(this.rz);
  }

  _colorBreathAnimation() {
    for (let item of this.colorBreathMeshes) {

      // 颜色呼吸动画
      if (this.colorBreathForward === 0) {
        if (
          this.colorBreathTemp === 0 &&
          item.material.color.r > this.colorBreathEnd.r
        ) {
          item.material.color.r += this.ri / 255;
          item.material.color.g += this.gi / 255;
          item.material.color.b += this.bi / 255;
        } else {
          this.colorBreathTemp = 1;
        }
        if (
          this.colorBreathTemp === 1 &&
          item.material.color.r < this.colorBreath.r
        ) {
          item.material.color.r -= this.ri / 255;
          item.material.color.g -= this.gi / 255;
          item.material.color.b -= this.bi / 255;
        } else {
          this.colorBreathTemp = 0;
        }
      } else {
        if (
          this.colorBreathTemp === 0 &&
          item.material.color.r < this.colorBreathEnd.r
        ) {
          item.material.color.r += this.ri / 255;
          item.material.color.g += this.gi / 255;
          item.material.color.b += this.bi / 255;
        } else {
          this.colorBreathTemp = 1;
        }
        if (
          this.colorBreathTemp === 1 &&
          item.material.color.r > this.colorBreath.r
        ) {
          item.material.color.r -= this.ri / 255;
          item.material.color.g -= this.gi / 255;
          item.material.color.b -= this.bi / 255;
        } else {
          this.colorBreathTemp = 0;
        }
      }

      //透明度渐变
      if (
        this.colorBreathOpacity != null &&
        this.colorBreathEndOpacity != null
      ) {
        if (this.colorBreathOpacityForward === 0) {
          if (
            this.colorBreathOpacityTemp === 0 &&
            item.material.opacity > this.colorBreathEndOpacity
          ) {
            item.material.opacity += this.ai;
          } else {
            this.colorBreathOpacityTemp = 1;
          }
          if (
            this.colorBreathOpacityTemp === 1 &&
            item.material.opacity < this.colorBreathOpacity
          ) {
            item.material.opacity -= this.ai;
          } else {
            this.colorBreathOpacityTemp = 0;
          }
        } else {
          if (
            this.colorBreathOpacityTemp === 0 &&
            item.material.opacity < this.colorBreathEndOpacity
          ) {
            item.material.opacity += this.ai;
          } else {
            this.colorBreathOpacityTemp = 1;
          }
          if (
            this.colorBreathOpacityTemp === 1 &&
            item.material.opacity > this.colorBreathOpacity
          ) {
            item.material.opacity -= this.ai;
          } else {
            this.colorBreathOpacityTemp = 0;
          }
        }
      }
    }
  }

  _textureAnimation() {
    if (this.textureAnimationDirection === "y") {
      this.texture.offset.y += this.repeatYSpeed;
    }
    if (this.textureAnimationDirection === "x") {
      this.texture.offset.x += this.repeatXSpeed;
    }
  }

  _verticalFlowShaderAnimation() {
    this.shadermaterial.uniforms.lightCenterHeight.value += this.shadermaterialAnimationSpeed;
    if (this.shadermaterial.uniforms.lightCenterHeight.value > this.geometryMaxHeight) {
      this.shadermaterial.uniforms.lightCenterHeight.value = 0;
    }
  }

  shaderAnimation(type) {
    if (type === 'verticalFlow') {
      GlobeAnimation.addAnimation(this._verticalFlowShaderUpdate);
    }
    else if (type === 'verticalTripFlow') {

    }
    else {
      return
    }
  }

  colorBreathAnimation() {
    GlobeAnimation.addAnimation(this._colBreAnimation);
  }

  textureAnimation() {
    GlobeAnimation.addAnimation(this._texAnimation);
  }

  rotateXAnimation(speed = 0.0001) {
    this.rxSpeed = speed;
    GlobeAnimation.addAnimation(this._rotateX);
  }

  rotateXAnimation(speed = 0.0001) {
    this.rxSpeed = speed;
    GlobeAnimation.addAnimation(this._rotateX);
  }

  rotateYAnimation(speed = 0.0001) {
    this.rySpeed = speed;
    GlobeAnimation.addAnimation(this._rotateY);
  }

  rotateZAnimation(speed = 0.0001) {
    this.rzSpeed = speed;
    GlobeAnimation.addAnimation(this._rotateZ);
  }

  setRenderOrder(order) {
    this.renderorder = order;
    this.mesh.traverse((item) => {
      item.renderOrder = this.renderorder;
    });
  }

  setPosition(position) {
    if (Array.isArray(position)) {
      this.center = position;
      this.mesh.setCoords([this.center[0], this.center[1], this.height]);
    } else {
      this.center = position;
      this.mesh.position.set(this.center.x, this.center.y, this.center.z);
    }
  }

  setOpacity(opacity) {
    if (this.customerShaderMaterial) {
      this.mesh.traverse((item) => {
        if (item.material) {
          item.material.transparent = true;
          item.material.uniforms.opacity.value = opacity
        }
      });
    }
    else {
      this.mesh.traverse((item) => {
        if (item.material) {
          item.material.transparent = true;
          item.material.opacity = opacity;
        }
      });
    }
  }

  // 解决部分mesh opacity不统一造成的显影不同步问题
  _setOpacity(opacity = 1) {
    let copyopacitys = Object.assign([], this.materialOpacitys);
    if (this.customerShaderMaterial) {
      this.mesh.traverse((item) => {
        if (item.material) {
          item.material.transparent = true;
          item.material.uniforms.opacity.value = copyopacitys.shift() * opacity;
        }
      });
    }
    else {
      this.mesh.traverse((item) => {
        if (item.material) {
          item.material.alphaTest = 0.2;
          item.material.transparent = true;
          item.material.opacity = copyopacitys.shift() * opacity;
        }
      });
    }
  }

  setTextureAnimationMaterial() {
    this.gltf.scene.traverse((item) => {
      if (item.type === 'Mesh') {
        if (item.geometry.boundingBox.max.y > this.geometryMaxHeight) {
          this.geometryMaxHeight = item.geometry.boundingBox.max.y
        }
      }
      if (item.material) {
        material = item.material;
        item.material.transparent = true;
        item.material.depthWrite = true;
        this.materialOpacitys.push(item.material.opacity);
        //使用自定义shader
        if (this.customerShaderMaterial) {
          item.material = this.shadermaterial;
          this.shadermaterial.uniforms.geometryMaxHeight.value = this.geometryMaxHeight;
          this.shadermaterialAnimationSpeed = this.geometryMaxHeight / this.shadermaterial.speed;//自定义材质动画使用
        } else {
          // 纹理动画
          if (
            this.textureAnimationConfig &&
            item.material.name.indexOf("texanim") > 0
          ) {
            item.material.map = this.texture;
            item.material.color = new THREE.Color(
              this.textureAnimationConfig.textureColor
            );
          }
          if (
            this.colorBreathConfig &&
            item.material.name.indexOf("colorbreath") > 0
          ) {
            item.material.color = new THREE.Color(
              this.colorBreathConfig.colorBreath
            );
            if (
              this.colorBreathOpacity != null &&
              this.colorBreathEndOpacity != null
            ) {
              item.material.transparent = true;
              item.material.opacity = this.colorBreathOpacity;
            }
            this.colorBreathMeshes.push(item);
          }
        }
      }
    });
  }

  setHeight(height) {
    this.height = height;
    this.center[2] = this.height;
    this.mesh.setCoords([this.center[0], this.center[1], this.height]);
  }

  //支持多种动画类型 1是减淡和渐出,2是旋转淡出渐出
  setShow(show, type = 1, time = 3, rotationspeed = 1, callback = () => { }) {
    if (type === 1) {
      if (typeof show === "boolean" && show) {
        if (time === 0) {
          this.show = show;
          this._setOpacity();
          callback();
          return;
        }
        this.show = show;
        this.opacity = 0;
        this._setOpacity();
        let tween = new TWEEN.Tween(this).to({
          opacity: 1
        }, time * 1000);
        tween.onStart(() => {
        }).onUpdate(() => {
          this._setOpacity(this.opacity);
        }).onComplete(() => {
          this._setOpacity();
          callback()
        }).start();
      } else if (typeof show === "boolean" && !show) {
        if (time === 0) {
          this.show = show;
          this.setOpacity(0);
          callback();
          return;
        }
        this.show = show;
        this.opacity = 1;
        this._setOpacity();
        let tween = new TWEEN.Tween(this).to({
          opacity: 0
        }, time * 1000);
        tween.onStart(() => {
        }).onUpdate(() => {
          this._setOpacity(this.opacity);
        }).onComplete(() => {
          this._setOpacity(0);
          callback()
        }).start();
      }
    } else if (type === 2) {
      if (typeof show === "boolean" && show) {
        if (time === 0) {
          this.show = show;
          this.setOpacity(1);
          callback();
          return;
        }
        this.show = show;
        this.mesh.scale.set(0, 0, 0);
        GlobeAnimation.removeAnimation(this._rotateY);
        this.rotateYAnimation(-rotationspeed);
        let tween = new TWEEN.Tween(this).to({
          _scale: this.scale
        }, time * 1000);
        tween.onStart(() => {
        }).onUpdate(() => {
          this.mesh.scale.set(this._scale, this._scale, this._scale);
        }).onComplete(() => {
          this.setScale(this.scale);
          GlobeAnimation.removeAnimation(this._rotateY);
          callback()
        }).start();
      } else if (typeof show === "boolean" && !show) {
        if (time === 0) {
          this.show = show;
          this.setOpacity(0);
          callback();
          return;
        }
        this.show = show;
        this.setScale(this.scale);
        GlobeAnimation.removeAnimation(this._rotateY);
        this.rotateYAnimation(rotationspeed);
        let tween = new TWEEN.Tween(this).to({
          _scale: 0
        }, time * 1000);
        tween.onStart(() => {
        }).onUpdate(() => {
          this.mesh.scale.set(this._scale, this._scale, this._scale);
        }).onComplete(() => {
          this.mesh.scale.set(0, 0, 0);
          GlobeAnimation.removeAnimation(this._rotateY);
          callback();
        }).start();
      }
    }
  }
  remove() {
    this.tb.remove(this.mesh);
    GlobeAnimation.removeAnimation(this._rotateX);
    GlobeAnimation.removeAnimation(this._rotateY);
    GlobeAnimation.removeAnimation(this._rotateZ);
    GlobeAnimation.removeAnimation(this._texAnimation);
    GlobeAnimation.removeAnimation(this._colBreAnimation);
  }
}


var model = new DracoModel({
  threebox: tb,
  center: [113.94828462847761, 22.53170781574576],
  draco_wasm_wrapper_js_url: window.location.origin + '/GNGisDisplay/script/draco_wasm_wrapper.js',
  draco_decoder_wasm_url: window.location.origin + '/GNGisDisplay/script/draco_decoder.wasm',
  url: './texturebuild/chunsun.glb',
  scale: 0.026,
  height: 0,
  rx: 90,
  customerShaderMaterial: true, //true表示采用自定义shader动画渲染，目前已经集成：verticalFlow
  customerShaderConfig: {
    // bottomColor: "rgb(0,19,39)",//模型底部颜色
    // topColor: 'rgb(0,50,200)',//模型顶部颜色
    // color: 'rgb(255,103,19)',//
    //颜色测试
    bottomColor: 'rgb(0,19,39)', //模型底部颜色
    topColor: 'rgb(0,50,100)', //模型顶部颜色
    flowColor: 'rgb(255,103,19)', //流动效果颜色
    topGradientDistance: 5, //流动shader渲染中心至顶部渐变距离，具体看模型的本地坐标调整
    bottomGradientDistance: 50, ////流动shader渲染中心至底部渐变距离，具体看模型的本地坐标调整
    speed: 100, //speed越小，动画速度越快
    wireframe: true, //是否开启网格模式
  },
});
model.ready.then(() => {
  model.setBloom(true);
  model.shaderAnimation('verticalFlow');
});
