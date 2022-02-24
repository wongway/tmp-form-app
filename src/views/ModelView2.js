// import * as mobilenet from '@tensorflow-models/mobilenet';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Camera } from 'expo-camera';
import React from 'react';
import { StyleSheet, useWindowDimensions, View, Text, Button } from 'react-native';
import { PixelRatio, Dimensions } from 'react-native';

// import Canvas from 'react-native-canvas';
import Svg, { Circle } from 'react-native-svg';

import CBuffer from 'cbuffer';
import smoothed_z_score from '../utils/smoothed_z_score';

import { CustomTensorCamera } from '../CustomTensorCamera';
import { LoadingView } from './LoadingView';
import { useTensorFlowModel } from '../useTensorFlow';
import { encodeJpeg, getCameraRollPermissions } from '../utils.js';
import is_rep from '../utils/rep_count';

const KEYPOINTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16
};

export const ModelViewNoPrediction = () => {
  const [repCount, setRepCount] = React.useState(10);
  const size = useWindowDimensions();
  const dims = React.useRef({
      height: 0,
      width: 0,
      left: 0,
      top: 0,
  });

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

  };

  const addRep = () => {
    setRepCount(repCount+1);
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}
    >
      <View style={{ borderRadius: 20, overflow: "hidden" }} onLayout={(event) => onLayout(event)}>
        <ModelCameraNoPrediction /> 
          {/* <Svg style={styles.overlay}>
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
          </Svg> */}
          {/* <View style={{ zIndex: 1000, backgroundColor: "#BD3886" }}> */}
        <Text style={styles.reps}>{repCount}</Text></View>
        <Button style={styles.repButton} title="+" onPress={addRep} />
      {/* </View> */}
    </View>
  );
}

function ModelCameraNoPrediction() {
  const raf = React.useRef(null);
  const size = useWindowDimensions();
  const posePromiseResolved = React.useRef(true);

  React.useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
    };
  }, []);

  // const onReady = React.useCallback(
  //   (images) => {
  //     const loop = async () => {
  //       if (posePromiseResolved) {
  //         posePromiseResolved.current = false;
  //         const nextImageTensor = images.next().value;
  //         // const predictions = await model.estimatePoses(nextImageTensor);
  //         model.estimatePoses(nextImageTensor).then((result) => {
  //           setPredictions(result);
  //           // console.log(Date.now());
  //           posePromiseResolved.current = true;
  //           return result;
  //         });
  //         // setKeypoints(predictions[0].keypoints);
  //         // console.log(predictions[0].keypoints[0]);
  //         // setPredictions(predictions);
  
  //       }
        
  //       // Saves a jpeg to your photos every 5 seconds for debugging
  //       // if (Date.now() - lastPic.current > 5000) {
  //       //   const jpeg = await encodeJpeg(nextImageTensor);
  //       //   lastPic.current = Date.now();
  //       //   console.log('JPEG: ', jpeg);
  //       // }

  //       raf.current = requestAnimationFrame(loop);
  //     };
  //     loop();
  //   },
  //   [setPredictions]
  // );


  return React.useMemo(
    () => (
      <>
        <CustomTensorCamera
          width={size.width}
          style={styles.camera}
          type={Camera.Constants.Type.front}
          // onReady={onReady}
          autorender />
      </>
    ),
    [size.width]
    // [onReady, size.width]
  );
}

export function ModelView2() {
  const [predictions, setPredictions] = React.useState([]);
  const [detector, setDetector] = React.useState(null);
  const [poses, setPoses] = React.useState([]);
  const [repCount, setRepCount] = React.useState(0);
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
  const zscoreLag = 50;

  const poseHistory = React.useRef(CBuffer(zscoreLag*2));

  React.useEffect(() => {
    if (!detector) {
      // console.log('Setting up detector');
      getDetector();
    } 

    getCameraRollPermissions();

  }, []);

  React.useEffect(() => {
    if (poses.length === 0) {
      // console.log("No keypoints");
      return;
    }

    // console.log(Date.now(), poses);
    // var lenHistory = poseHistory.current.push(poses[0].keypoints[KEYPOINTS.LEFT_HIP].y);
    if (poseHistory.current.push(poses[0].keypoints[KEYPOINTS.LEFT_HIP].y) >= zscoreLag + 2) {
      let signal = smoothed_z_score(poseHistory.current.toArray());
      let i = signal[0].length - 1;
      let rep = false;

      rep = is_rep(signal[0]);

      if (rep) {
        setRepCount(repCount+1);
      }

      console.log(Date.now(), 
                  rep,
                  poses[0].keypoints[KEYPOINTS.LEFT_HIP].x,
                  poses[0].keypoints[KEYPOINTS.LEFT_HIP].y, 
                  poses[0].keypoints[KEYPOINTS.LEFT_HIP].score,
                  signal[0][i], // zscore value
                  signal[1][i], // moving average
                  signal[2][i], // moving stddev
                  signal[2][i]/signal[1][i], // moving normalized stddev
                  );

    }

  }, [poses]);

  const getDetector = async () => {
    try {
      setDetector(await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet));
      // console.log(await Camera.getAvailableCameraTypesAsync());
      
    } catch (error) {
      console.error(error);
    }

  };

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
    // console.log(poses[0].keypoints.slice(KEYPOINTS.LEFT_HIP,KEYPOINTS.RIGHT_HIP+1));

    // let color = Math.floor(Math.random() * 255);

    const keypoints = poses[0].keypoints.slice(KEYPOINTS.LEFT_HIP,KEYPOINTS.RIGHT_HIP+1).map((keypoint) => (
        <Circle 
          key={keypoint.name}
          cx={dims.current.width - (keypoint.x * scaleFactor)}
          // cx={keypoint.x * scaleFactor}
          cy={keypoint.y * scaleFactor}
          r="5"
          stroke="white"
          fill="red"
          // stroke={`rgb(${color},${color},${color})`}
          // strokeWidth="2.5"
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
          {/* <Svg style={styles.overlay}>
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
          </Svg> */}
        {markKeypoints()}
        <Text style={styles.reps}>{repCount}</Text>
      </View>
    </View>
  );
}


function ModelCamera({ model, setPredictions }) {
  const raf = React.useRef(null);
  const size = useWindowDimensions();
  // const [keypoints, setKeypoints] = React.useState([]);
  // const lastPic = React.useRef(0);
  const posePromiseResolved = React.useRef(true);

  React.useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const onReady = React.useCallback(
    (images) => {
      const loop = async () => {
        if (posePromiseResolved) {
          posePromiseResolved.current = false;
          const nextImageTensor = images.next().value;
          // const predictions = await model.estimatePoses(nextImageTensor);
          model.estimatePoses(nextImageTensor).then((result) => {
            setPredictions(result);
            // console.log(Date.now());
            posePromiseResolved.current = true;
            return result;
          });
          // setKeypoints(predictions[0].keypoints);
          // console.log(predictions[0].keypoints[0]);
          // setPredictions(predictions);
  
        }
        
        // Saves a jpeg to your photos every 5 seconds for debugging
        // if (Date.now() - lastPic.current > 5000) {
        //   const jpeg = await encodeJpeg(nextImageTensor);
        //   lastPic.current = Date.now();
        //   console.log('JPEG: ', jpeg);
        // }

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
  reps: {
    position: "absolute",
    top: 10,
    left: 10,
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    // backgroundColor: "black",
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontSize: 50,
    zIndex: 100,
  },
  repButton: {
    position: "absolute",
    top: 10,
    right: 10,
    color: "#BD3886",
    fontSize: 50,
    zIndex: 100,
  },
  // keypointRightEye: {
  //   r: "5",
  //   stroke: "red",
  //   strokeWidth: "2.5",
  // },
});
