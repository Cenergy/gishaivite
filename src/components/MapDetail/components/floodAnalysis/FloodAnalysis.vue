<template>
    <div>
        <div class="flood-analysis-info">
            <div id="dat-gui-container"></div>
        </div>
    </div>
</template>

<script>
import { GUI } from 'lil-gui';
import eventBus from '@/utils/EventBus'
export default {
    data() {
        return {
            query: {
                hdnm: '',
                keyword: ''
            },
            data: [],
            rawData: [],
            gui: null,
            floodParams: {
                waterHeight: 0.015,
                speed: 0.01,
                minHeight: 0.015,
                maxHeight: 2,
                animationEnabled: true,
                transparency: 0.7
            },
            rangeParams: {
                minHeight:[0.015,0.5],
                maxHeight:[0.05,2],
                waterHeight:[0.015,2],
                speed:[0.01,0.5],
                transparency:[0,1]
            }
        };
    },
    methods: {
        initDatGUI() {
            // 创建lil-gui实例
            this.gui = new GUI({ autoPlace: false });
            
            // 将GUI添加到指定容器
            const container = document.getElementById('dat-gui-container');
            if (container) {
                container.appendChild(this.gui.domElement);
            }
            
            // 添加控制项
            const waterFolder = this.gui.addFolder('水位控制');
            waterFolder.add(this.floodParams, 'waterHeight', ...this.rangeParams.waterHeight).name('当前水位(m)').onChange((value) => {
                if (this.isInitialized) {
                    this.updateFloodHeight(value);
                }
            });
            waterFolder.add(this.floodParams, 'minHeight', ...this.rangeParams.minHeight).name('最小高度(m)');
            waterFolder.add(this.floodParams, 'maxHeight', ...this.rangeParams.maxHeight).name('最大高度(m)');
            waterFolder.open();
            
            const animationFolder = this.gui.addFolder('动画控制');
            animationFolder.add(this.floodParams, 'speed', ...this.rangeParams.speed).name('动画速度').onChange((value) => {
                this.updateAnimationSpeed(value);
            });
            animationFolder.add(this.floodParams, 'animationEnabled').name('启用动画').onChange((value) => {
                this.toggleAnimation(value);
            });
            animationFolder.add(this.floodParams, 'transparency', ...this.rangeParams.transparency).name('透明度').onChange((value) => {
                this.updateTransparency(value);
            });
            animationFolder.open();
            
            // 延迟设置初始化标志，避免初始化时触发事件
            setTimeout(() => {
                this.isInitialized = true;
            }, 100);
            
            // 添加操作按钮
            const actions = {
                startFlood: () => this.startFloodAnalysis(),
                stopFlood: () => this.stopFloodAnalysis(),
                randomHeight: () => this.setRandomHeight(),
                reset: () => this.resetParams()
            };
            
            this.gui.add(actions, 'startFlood').name('开始淹没分析');
            this.gui.add(actions, 'stopFlood').name('停止淹没分析');
            this.gui.add(actions, 'randomHeight').name('随机水位');
            this.gui.add(actions, 'reset').name('重置参数');
        },
        
        updateFloodHeight(height) {
            // 通过事件总线更新淹没高度
            eventBus.emit('updateFloodHeight', height);
        },
        
        updateAnimationSpeed(speed) {
            // 通过事件总线更新动画速度
            eventBus.emit('updateFloodSpeed', speed);
        },
        
        toggleAnimation(enabled) {
            // 通过事件总线切换动画状态
            eventBus.emit('toggleFloodAnimation', enabled);
        },
        
        updateTransparency(transparency) {
            // 通过事件总线更新透明度
            eventBus.emit('updateFloodTransparency', transparency);
        },
        
        startFloodAnalysis() {
            // 开始淹没分析，使用最大高度作为目标高度
            eventBus.emit('startFloodAnalysis', {
                height: this.floodParams.maxHeight,
                speed: this.floodParams.speed,
                transparency: this.floodParams.transparency
            });
            // 同时更新当前水位显示为最大高度
            this.floodParams.waterHeight = this.floodParams.maxHeight;
        },
        
        stopFloodAnalysis() {
            // 停止淹没分析
            eventBus.emit('stopFloodAnalysis');
        },
        
        setRandomHeight() {
            // 设置随机水位
            const randomHeight = Math.random() * (this.floodParams.maxHeight - this.floodParams.minHeight) + this.floodParams.minHeight;
            this.floodParams.waterHeight = Math.round(randomHeight * 10) / 10;
            this.updateFloodHeight(this.floodParams.waterHeight);
        },
        
        resetParams() {
            // 重置所有参数
            this.floodParams = {
                waterHeight: 10,
                speed: 5,
                minHeight: 5,
                maxHeight: 20,
                animationEnabled: true,
                transparency: 0.7
            };
            
            // 更新GUI显示
            if (this.gui) {
                this.gui.updateDisplay();
            }
        },
        
        getData() {
            // getRiverList()
            //     .then(res => {
            //         // console.log(res.data)
            //         this.rawData = res.data
            //         this.data = res.data
            //     })
        },
        isOver(row) {
            if(row.xxsw === null
            && row.xxsw === undefined) {
                return false
            }
            return row.rz >= row.xxsw
        },
        handleSearch() {
            const { keyword } = this.query
            this.data = this.rawData.filter(item=>{
                return item.rvName.includes(keyword)
            })
        },
        handleRowClick(row) {
            // const row = this.data[idx]
            eventBus.emit("mapLocate", {
                type: 'River',
                data: row
            });
        },
        handleRowDblClick(row) {
            eventBus.emit("openMapDialog", {
                handleField: 'rvCode',
                titleField: 'rvName',
                type: 'River',
                data: row
            });
        }
    },
    mounted() {
        this.getData();
        this.$nextTick(() => {
            this.initDatGUI();
        });
    },
    beforeDestroy() {
        // 清理dat.gui实例
        if (this.gui) {
            this.gui.destroy();
            this.gui = null;
        }
    }
};
</script>

<style scoped>
.flood-analysis-info {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.flood-analysis-info h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #4CAF50;
}

.flood-analysis-info p {
    margin: 0 0 15px 0;
    font-size: 14px;
    color: #ccc;
}

#dat-gui-container {
    width: 100%;
}

/* lil-gui 样式覆盖 */
#dat-gui-container .lil-gui {
    --background-color: rgba(0, 0, 0, 0.9);
    --text-color: #ffffff;
    --title-background-color: rgba(68, 175, 80, 0.8);
    --title-text-color: #ffffff;
    --widget-color: rgba(255, 255, 255, 0.1);
    --hover-color: rgba(255, 255, 255, 0.2);
    --focus-color: rgba(68, 175, 80, 0.6);
    --number-color: #4CAF50;
    --string-color: #81C784;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    width: 100%;
    margin: 0;
}
</style>