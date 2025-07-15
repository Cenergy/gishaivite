<template>
    <div>
        <div class="model-test-info">
            <div id="model-gui-container"></div>
        </div>
    </div>
</template>

<script lang="js">
import { GUI } from 'lil-gui';
import eventBus from '@/utils/EventBus'
export default {
    name: 'ModelTest',
    data() {
        return {
            gui: null,
            modelParams: {
                modelType: 'drone',
                visible: true
            },
            modelTypes: {
                'drone': '无人机模型',
                'vehicle': '车辆模型',
                'building': '建筑模型',
                'terrain': '地形模型'
            }
        };
    },
    methods: {
        initModelGUI() {
            // 创建lil-gui实例
            this.gui = new GUI({ autoPlace: false });
            
            // 将GUI添加到指定容器
            const container = document.getElementById('model-gui-container');
            if (container) {
                container.appendChild(this.gui.domElement);
            }
            
            // 模型选择
            const modelFolder = this.gui.addFolder('模型控制');
            modelFolder.add(this.modelParams, 'modelType', this.modelTypes).name('模型类型').onChange((value) => {
                this.changeModelType(value);
            });
            modelFolder.add(this.modelParams, 'visible').name('显示模型').onChange((value) => {
                this.toggleModelVisibility(value);
            });
            modelFolder.open();
            
            // 添加操作按钮
            const actions = {
                loadModel: () => this.loadModel(),
                locateModel: () => this.locateModel(),
                showModel: () => this.showModel(),
                hideModel: () => this.hideModel(),
                destroyModel: () => this.destroyModel()
            };
            
            this.gui.add(actions, 'loadModel').name('加载模型');
            this.gui.add(actions, 'locateModel').name('定位到模型');
            this.gui.add(actions, 'showModel').name('显示模型');
            this.gui.add(actions, 'hideModel').name('隐藏模型');
            this.gui.add(actions, 'destroyModel').name('销毁模型');
        },
        
        changeModelType(type) {
            eventBus.emit('changeModelType', type);
        },
        
        toggleModelVisibility(visible) {
            eventBus.emit('toggleModelVisibility', visible);
            this.modelParams.visible = visible;
        },
        
        loadModel() {
            // 加载模型
            eventBus.emit('loadTestModel', {
                type: this.modelParams.modelType
            });
            console.log('加载模型:', this.modelParams.modelType);
        },
        
        locateModel() {
            // 定位到模型
            eventBus.emit('locateToModel', {
                type: this.modelParams.modelType
            });
        },
        
        showModel() {
            // 显示模型
            this.modelParams.visible = true;
            eventBus.emit('showTestModel', {
                type: this.modelParams.modelType
            });
            
            // 更新GUI显示
            if (this.gui) {
                // lil-gui使用updateDisplay方法，但需要遍历所有控制器
                this.gui.controllersRecursive().forEach(controller => {
                    controller.updateDisplay();
                });
            }
        },
        
        hideModel() {
            // 隐藏模型
            this.modelParams.visible = false;
            eventBus.emit('hideTestModel');
            
            // 更新GUI显示
            if (this.gui) {
                // lil-gui使用updateDisplay方法，但需要遍历所有控制器
                this.gui.controllersRecursive().forEach(controller => {
                    controller.updateDisplay();
                });
            }
        },
        
        destroyModel() {
            // 销毁模型
            this.modelParams.visible = false;
            eventBus.emit('destroyTestModel');
            
            // 更新GUI显示
            if (this.gui) {
                // lil-gui使用updateDisplay方法，但需要遍历所有控制器
                this.gui.controllersRecursive().forEach(controller => {
                    controller.updateDisplay();
                });
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.initModelGUI();
        });
    },
    beforeUnmount() {
        // 清理gui实例
        if (this.gui) {
            this.gui.destroy();
            this.gui = null;
        }
    }
};
</script>

<style scoped>
.model-test-info {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.model-test-info h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #2196F3;
}

.model-test-info p {
    margin: 0 0 15px 0;
    font-size: 14px;
    color: #ccc;
}

#model-gui-container {
    width: 100%;
}

/* lil-gui 样式覆盖 */
#model-gui-container .lil-gui {
    --background-color: rgba(0, 0, 0, 0.9);
    --text-color: #ffffff;
    --title-background-color: rgba(33, 150, 243, 0.8);
    --title-text-color: #ffffff;
    --widget-color: rgba(255, 255, 255, 0.1);
    --hover-color: rgba(255, 255, 255, 0.2);
    --focus-color: rgba(33, 150, 243, 0.6);
    --number-color: #2196F3;
    --string-color: #64B5F6;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    width: 100%;
    margin: 0;
}
</style>