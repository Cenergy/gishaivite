<template>
  <div class="panelContainer">
    <ul>
      <li @click="changeLayerSelect('firstGuideLine', 0)">第一</li>
      <li @click="changeLayerSelect('secondGuideLine', 60)">第二</li>
      <li @click="changeLayerSelect('thirdGuideLine', 120)">第三</li>
      <li @click="changeLayerSelect('floodRisk', 170)">第四</li>
      <li @click="changeLayerSelect('videoMonitor', 200)">第五</li>
      <li @click="changeLayerSelect('extraLayer', 240)">更多图层</li>
    </ul>
    <div class="layerSelect" ref="layerSelect">
      <template v-for="(items, groupName) in layerGroup">
        <el-checkbox
          v-show="whoShowsLayerSelect === groupName"
          v-for="item in items"
          :key="item.label"
          :label="item.label"
          :value="item.value"
          v-model="item.flag"
          @change="handleLayerSelect($event, item)"
          style="margin: 0 10px"
        >
          {{ item.label }}
        </el-checkbox></template
      >
    </div>
  </div>
</template>

<script>

import eventBus from '@/utils/EventBus'

export default {
  name: "layerControl",
  components: {},
  props: {},
  data() {
    return {
      whoShowsLayerSelect: "",
      layerGroup: {
        firstGuideLine: [
          {
            value: "radarImage",
            label: "雷达图像",
            flag: false,
          },
          {
            value: "rainfallForecast",
            label: "降雨预报",
            flag: false,
          },
          {
            value: "typhoonTrack",
            label: "台风路径",
            flag: false,
          },
          {
            value: "cloudImage",
            label: "卫星云图",
            flag: false,
          },
        ],
        secondGuideLine: [
          {
            value: "rainMonitor",
            label: "降雨监测",
            flag: false,
          },
          // {
          //     value: 'thunder',
          //     label: "闪电定位",
          //     flag: false,
          // },
        ],
        thirdGuideLine: [
          {
            value: "waterLogging",
            label: "积涝点水位",
            flag: true,
          },
        ],
        floodRisk: [
          {
            value: "floodRisk",
            label: "洪涝风险",
            flag: false,
          },
        ],
        videoMonitor: [
          {
            value: "videoMonitor",
            label: "视频监控",
            flag: false,
          },
        ],
        extraLayer: [
          {
            value: "tilesetModelAccuracy",
            label: "倾斜摄影",
            flag: true,
          },
          {
            value: "vehicle",
            label: "车辆定位",
            flag: true,
          },
          {
            value: "floodAnalysis",
            label: "淹没分析",
            flag: false,
          },
        ],
      },
    };
  },
  watch: {},
  computed: {},
  created() {},
  mounted() {},
  methods: {
    changeLayerSelect(val, top) {
      if (this.whoShowsLayerSelect == val) {
        this.whoShowsLayerSelect = "";
      } else {
        this.whoShowsLayerSelect = val;
        this.$refs.layerSelect.style.top = top ? top + "px" : "0px";
      }
    },
    handleLayerSelect(isSelected, data) {
      console.log(isSelected, data);
      if (isSelected) {
        eventBus.emit("addMapLayer", {
          val: data.value,
          label: data.label,
        });
        eventBus.emit("addMapDetail", {
          value: data.value,
          label: data.label,
        });
      } else {
        eventBus.emit("removeMapLayer", {
          val: data.value,
          label: data.label,
        });
        eventBus.emit("removeMapDetail", data.value);
      }
    },
  },
};
</script>
<style scoped>
.panelContainer {
  position: absolute;
  z-index: 100;
  top: 10px;
  left: 10px;
}
.panelContainer ul {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100px;
  text-align: center;
  border: 1px solid rgba(45, 137, 194, 0.8);
  background: rgba(20, 54, 104, 0.8);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.panelContainer ul li {
  margin: 2px 0;
  padding: 5px;
  font-weight: 600;
  user-select: none;

  &:hover {
    background: rgba(45, 137, 194, 0.8);
    cursor: pointer;
  }
}
.panelContainer .layerSelect {
  position: absolute;
  top: 0;
  left: 102px;
  color: #fff;
  display: flex;
  height: 40px;
  justify-content: space-around;
  align-items: center;
  background: rgba(20, 54, 104, 0.8);

  ::v-deep .el-checkbox__label {
    color: #fff !important;
  }
}
</style>
