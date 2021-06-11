import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { Camera } from 'expo-camera';
import React from 'react';

// back
// 2:1
// Array [
//   "1920x960",
//   "2560x1280",
//   "4000x2000",
// ]
// 3:2
// Array [
//   "720x480",
// ]
// 4:3
// Array [
//   "320x240",
//   "640x480",
//   "800x600",
//   "1024x768",
//   "1280x960",
//   "1440x1080",
//   "1600x1200",
//   "1920x1440",
//   "2048x1536",
//   "2592x1944",
//   "3200x2400",
//   "3264x2448",
//   "4000x3000",
//   "4032x3024",
// ]
// 11:9
// Array [
//   "352x288",
// ]
// 16:9
// Array [
//   "640x360",
//   "1280x720",
//   "1920x1080",
//   "2688x1512",
//   "3264x1836",
//   "3840x2160",
//   "4032x2268",
// ]

// front
// 2:1
// Array [
//   "1920x960",
//   "2560x1280",
// ]
// 3:2
// Array [
//   "720x480",
// ]
// 4:3
// Array [
//   "320x240",
//   "640x480",
//   "800x600",
//   "1024x768",
//   "1280x960",
//   "1440x1080",
//   "1600x1200",
//   "1920x1440",
//   "2048x1536",
//   "2592x1944",
//   "3200x2400",
//   "3264x2448",
// ]
// 11:9
// Array [
//   "176x144",
//   "352x288",
// ]
// 16:9
// Array [
//   "640x360",
//   "1280x720",
//   "1920x1080",
//   "2688x1512",
//   "3264x1836",
// ]

// const TEXTURE_SIZE = { width: 1080, height: 1920 };
// const TEXTURE_SIZE = { width: 1600, height: 1200 }; // magic numbers from tfjs 
// const TEXTURE_SIZE = { width: 1200, height: 1600 }; // magic numbers from tfjs 
// const TEXTURE_SIZE = { width: 1280, height: 960 }; // empirically derived for pixel 4
const TEXTURE_SIZE = { width: 1280, height: 960 }; // empirically derived for pixel 4

const TENSOR_WIDTH = 152;

const CAMERA_RATIO = TEXTURE_SIZE.height / TEXTURE_SIZE.width;

const TENSOR_SIZE = {
  width: TENSOR_WIDTH,
  height: TENSOR_WIDTH * CAMERA_RATIO,
};

const TensorCamera = cameraWithTensors(Camera);

export function CustomTensorCamera({ style, width, ...props }) {
  const sizeStyle = React.useMemo(() => {
    const ratio = width / TEXTURE_SIZE.width;
    const cameraWidth = TEXTURE_SIZE.width * ratio;
    const cameraHeight = TEXTURE_SIZE.height * ratio;
    return {
      maxWidth: cameraWidth,
      minWidth: cameraWidth,
      maxHeight: cameraHeight,
      minHeight: cameraHeight,
    };
  }, [width]);

  return (
    <TensorCamera
      {...props}
      style={[style, sizeStyle]}
      cameraTextureWidth={TEXTURE_SIZE.width}
      cameraTextureHeight={TEXTURE_SIZE.height}
      resizeWidth={TENSOR_SIZE.width}
      resizeHeight={TENSOR_SIZE.height}
      resizeDepth={3}
    />
  );
}
