const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .onnx, .tflite, and .bin to assetExts so neural network models can be loaded directly
config.resolver.assetExts.push('onnx', 'tflite', 'bin');

module.exports = config;
