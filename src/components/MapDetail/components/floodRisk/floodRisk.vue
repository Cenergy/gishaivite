<template>
  <div>
    <ZebraTitle style="margin-bottom: 15px;">
      <span style="color: yellow;">查询条件</span>
    </ZebraTitle>
    <el-table ref="table" :data="tableData" highlight-current-row size="mini" class="dark" max-height="350px" @row-click="handleRowClick">
      <el-table-column align="center" label="类型" prop="lx"></el-table-column>
      <el-table-column align="center" label="类别" prop="lb"></el-table-column>
      <el-table-column align="center" label="暴雨边界" prop="bybj"></el-table-column>
      <el-table-column align="center" label="潮位边界" prop="cwbj"></el-table-column>
    </el-table>
  </div>
</template>
<script>
import eventBus from '@/utils/EventBus'
export default {

  name: 'floodRisk',

  components: {},

  props: {},

  data() {

    return {
      tableData: [{
        lx: "长历时",
        lb: "暴雨为主",
        bybj: "50年一遇",
        cwbj: "5年一遇",
        jysc: "24",
        imageName: "4",
      },
      {
        lx: "长历时",
        lb: "暴雨为主",
        bybj: "100年一遇",
        cwbj: "5年一遇",
        jysc: "24",
        imageName: "5",
      },
      {
        lx: "长历时",
        lb: "暴雨为主",
        bybj: "500年一遇",
        cwbj: "5年一遇",
        jysc: "24",
        imageName: "7",
      },
      {
        lx: "长历时",
        lb: "极端条件",
        bybj: "500年一遇",
        cwbj: "200年一遇",
        jysc: "24",
        imageName: "12",
      },
      {
        lx: "短历时",
        lb: "暴雨为主",
        bybj: "20年一遇",
        cwbj: "5年一遇",
        jysc: "1",
        imageName: "16",
      },
      {
        lx: "短历时",
        lb: "暴雨为主",
        bybj: "50年一遇",
        cwbj: "5年一遇",
        jysc: "1",
        imageName: "17",
      },
      {
        lx: "短历时",
        lb: "暴雨为主",
        bybj: "100年一遇",
        cwbj: "5年一遇",
        jysc: "1",
        imageName: "18",
      },
      {
        lx: "短历时",
        lb: "暴雨为主",
        bybj: "200年一遇",
        cwbj: "5年一遇",
        jysc: "1",
        imageName: "19",
      },
      {
        lx: "短历时",
        lb: "极端条件",
        bybj: "200年一遇",
        cwbj: "200年一遇",
        jysc: "1",
        imageName: "25",
      }]
    }

  },

  methods: {
    handleRowClick(row, column, event) {
    eventBus.emit("changeFloodRiskImage",row.imageName)
    }
  },

  mounted() {
     this.$nextTick(() => {
      if (this.tableData.length > 0) {
        this.$refs.table.setCurrentRow(this.tableData[0]);
      }
    });
  },

  watch: {

  }

}

</script>
<style lang="scss" scoped></style>