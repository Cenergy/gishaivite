import BaseLayer from './baseLayer';

class TestLayer extends BaseLayer {
  constructor(options) {
    super(options);
  }
  show() {
    // 显示图层
  }
  hide() {
    // 隐藏图层
  }
}

const layer = new TestLayer();
export default layer;
