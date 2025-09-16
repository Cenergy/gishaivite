export { default as FastDogJSDecoder } from "./fallbackDecoder.js";
export { default as modelDecoder } from "./modelDecoder.js";
export { default as FastDogDecoder } from "./wasmDecoder.js";
export { default as workerDecoder } from "./workerDecoder.js";
import smartDecoder from "./smartDecoder.js";
export { smartDecoder }
export default smartDecoder;