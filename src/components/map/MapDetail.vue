<template>
  <div class="map-detail-wrapper">
    <div :class="['toggle', expand && 'expand']" @click="handleSwitch">详情</div>
    <div v-show="expand" class="panel">
      <el-tabs v-show="tabList.length" v-model="activeTab" class="dark-tabs" type="card">
        <el-tab-pane
          v-for="item of tabList"
          :key="item.value"
          :name="item.value"
          :label="item.label"
          style="padding: 0px 10px"
        >
          <component :is="item.value"></component>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import * as components from "./panels";
// import Waterlogging from './components/Waterlogging.vue'
import eventBus from "@/utils/EventBus";

export default {
  components,

  data() {
    return {
      /**
       * {Object} tab
       * {String} tab.label tab标题
       * {String} tab.value tab类型
       */
      tabList: [],
      activeTab: "",
      expand: false,
    };
  },
  methods: {
    handleSwitch() {
      this.expand = !this.expand;
    },
    handleAddPanel(data) {
      console.log("🚀 ~ handleAddPanel ~ data:", data);
      let idx = this.tabList.findIndex((item) => item.label == data.label);
      if (idx == -1) {
        this.tabList.push(data);
      }
      this.expand = true;
      this.activeTab = data.value;
    },
    handleRemovePanel(value) {
      this.expand = true;
      this.tabList = this.tabList.filter((item) => item.value != value);
      if (this.tabList.length) {
        this.activeTab = this.tabList.at(-1).value;
      } else {
        this.activeTab = "";
      }
    },
    handleUpdatePanels(tabList) {
      this.tabList = tabList;
    },
  },
  created() {
    eventBus.on("addMapDetail", this.handleAddPanel);
    eventBus.on("removeMapDetail", this.handleRemovePanel);
  },
  destroyed() {
    eventBus.off("addMapDetail", this.handleAddPanel);
    eventBus.off("removeMapDetail", this.handleRemovePanel);
  },
};
</script>
<style scoped>
.map-detail-wrapper {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
}

.toggle {
  user-select: none;
  padding: 8px 15px;
  border-radius: 4px;
  color: white;
  border: 1px solid #1f73ff;
  background-color: #051b4c;
  cursor: pointer;

  &.expand {
    color: yellow;
    /* outline: 3px solid #2DA6FC; */
  }
}

.panel {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  padding-bottom: 10px;
  width: 400px;
  background-color: rgba(13, 43, 61, 0.8);
}

::v-deep .el-tabs__item {
  height: auto;
  line-height: 1;
  padding: 10px 10px;
}
</style>