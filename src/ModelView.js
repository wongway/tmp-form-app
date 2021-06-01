// import * as mobilenet from '@tensorflow-models/mobilenet';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Camera } from 'expo-camera';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { PixelRatio, Dimensions } from 'react-native';

// import Canvas from 'react-native-canvas';
import Svg, { Circle } from 'react-native-svg';

import { CustomTensorCamera } from './CustomTensorCamera';
import { LoadingView } from './LoadingView';
import { PredictionList } from './PredictionList';
import { useTensorFlowModel } from './useTensorFlow';
import { encodeJpeg, getCameraRollPermissions } from './utils.js';

export function ModelView() {
  const [predictions, setPredictions] = React.useState([]);
  const [detector, setDetector] = React.useState(null);
  const [poses, setPoses] = React.useState([]);
  const dims = React.useRef({
      height: 0,
      width: 0,
      left: 0,
      top: 0,
  });
  const logs = React.useRef([]);
  const scaleFactor = 2.58;
  // const scaleFactor = 2.75;
  // const scaleFactor = 7.1;
  const size = useWindowDimensions();

  React.useEffect(() => {
    if (!detector) {
      // console.log('Setting up detector');
      getDetector();
    } 

    getCameraRollPermissions();

  }, []);

  const getDetector = async () => {
    try {
      setDetector(await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet));
      // console.log(await Camera.getAvailableCameraTypesAsync());
      
    } catch (error) {
      console.error(error);
    }

  };

  // const handleCanvas = (canvas) => {
  //   const ctx = canvas.getContext('2d');
  //   ctx.fillStyle = 'purple';
  //   ctx.fillRect(0,0,100,100);
  // };

  const onLayout = (event) => {
    const {x, y, height, width} = event.nativeEvent.layout;

    const newLayout = {
      height: height,
      width: width,
      left: x,
      top: y,
    };

    console.log("View Dims: ", width, height);
    console.log("Dimensions: ", Dimensions.get('window'));
    console.log("useWindowDimensions: ", size);
    console.log("PixelRatio: ", PixelRatio.get(), PixelRatio.getPixelSizeForLayoutSize(width), PixelRatio.getPixelSizeForLayoutSize(height));

    dims.current = newLayout;

    logs.current = [
      "height: ", 
      "width: "
    ];

  };

  const markKeypoints = () => {
    if (poses.length === 0) {
      console.log("No keypoints");
      return;
    }

    // console.log(poses[0].keypoints[0].x, poses[0].keypoints[0].y);
    // console.log(poses[0].keypoints.slice(0,5));

    // let color = Math.floor(Math.random() * 255);

    const keypoints = poses[0].keypoints.slice(0,5).map((keypoint) => (
        <Circle 
          key={keypoint.name}
          cx={dims.current.width - (keypoint.x * scaleFactor)}
          // cx={keypoint.x * scaleFactor}
          cy={keypoint.y * scaleFactor}
          r="1"
          stroke="red"
          // stroke={`rgb(${color},${color},${color})`}
          strokeWidth="2.5"
        />
    ));

    return (
      <Svg style={styles.overlay}>
        {keypoints}
        {/* <Circle 
          key="flipped nose"
          cx={dims.current.width - (poses[0].keypoints[0].x * scaleFactor)}
          cy={poses[0].keypoints[0].y * scaleFactor}
          r="3"
          stroke="green"
          // stroke={`rgb(${color},${color},${color})`}
          strokeWidth="2.5"
        /> */}
      </Svg>
    );
  };

  if (!detector) {
    return <LoadingView>Loading TensorFlow model</LoadingView>;
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}
    >
      <View style={{ borderRadius: 20, overflow: "hidden" }} onLayout={(event) => onLayout(event)}>
        <ModelCamera model={detector} setPredictions={setPoses} >
        {/* <Canvas ref={handleCanvas}/> */}
        </ModelCamera>
          <Svg style={styles.overlay}>
            <Circle
              cx="0"
              cy="0"
              r="20"
              stroke="white"
              strokeWidth="5"
              opacity="0.5"
            />
            <Circle
              cx={`${dims.current.width}`}
              cy="0"
              r="20"
              stroke="white"
              strokeWidth="5"
              opacity="0.5"
            />
            <Circle
              cx="0"
              cy={`${dims.current.height}`}
              r="20"
              stroke="white"
              strokeWidth="5"
              opacity="0.5"
            />
            <Circle
              cx={`${dims.current.width}`}
              cy={`${dims.current.height}`}
              r="20"
              stroke="white"
              strokeWidth="5"
              opacity="0.5"
            />
          </Svg>
        {markKeypoints()}
      </View>
    </View>
  );
}


function ModelCamera({ model, setPredictions }) {
  const raf = React.useRef(null);
  const size = useWindowDimensions();
  // const [keypoints, setKeypoints] = React.useState([]);
  const lastPic = React.useRef(0);

  React.useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const onReady = React.useCallback(
    (images) => {
      const loop = async () => {
        const nextImageTensor = images.next().value;
        const predictions = await model.estimatePoses(nextImageTensor);
        // setKeypoints(predictions[0].keypoints);
        // console.log(predictions[0].keypoints[0]);
        setPredictions(predictions);

        if (Date.now() - lastPic.current > 5000) {
          const jpeg = await encodeJpeg(nextImageTensor);
          lastPic.current = Date.now();
          console.log('JPEG: ', jpeg);
        }

        raf.current = requestAnimationFrame(loop);
      };
      loop();
    },
    [setPredictions]
  );


  return React.useMemo(
    () => (
      <>
        <CustomTensorCamera
          width={size.width}
          style={styles.camera}
          type={Camera.Constants.Type.front}
          onReady={onReady}
          autorender />
      </>
    ),
    [onReady, size.width]
  );
}

const styles = StyleSheet.create({
  camera: {
    zIndex: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    // opacity: 0.9,
  },
  // keypointRightEye: {
  //   r: "5",
  //   stroke: "red",
  //   strokeWidth: "2.5",
  // },
});
