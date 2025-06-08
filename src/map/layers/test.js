import BaseLayer from "./baseLayer";

class TestLayer extends BaseLayer {
  constructor(options) {
    super(options);
  }
  show() {
    console.log("🚀 ~ TestLayer ~ show ~ show:");
  }
  hide() {
    console.log("🚀 ~ TestLayer ~ hide ~ hide:");
  }
}

const layer = new TestLayer();
export default layer;
