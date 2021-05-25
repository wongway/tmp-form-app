import * as mobilenet from '@tensorflow-models/mobilenet';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Camera } from 'expo-camera';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { CustomTensorCamera } from './CustomTensorCamera';
import { LoadingView } from './LoadingView';
import { PredictionList } from './PredictionList';
import { useTensorFlowModel } from './useTensorFlow';

export function ModelView() {
  // const model = useTensorFlowModel(mobilenet);
  // const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

  const [predictions, setPredictions] = React.useState([]);
  const [detector, setDetector] = React.useState(null);

  React.useEffect(() => {
    if (!detector) {
      // console.log('Setting up detector');
      getDetector();
    } 

  }, []);

  const getDetector = async () => {
    try {
      setDetector(await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet));
    } catch (error) {
      console.error(error);
    }

  };

  if (!detector) {
    return <LoadingView>Loading TensorFlow model</LoadingView>;
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}
    >
      <PredictionList predictions={predictions} />
      <View style={{ borderRadius: 20, overflow: "hidden" }}>
        <ModelCamera model={detector} setPredictions={setPredictions} />
      </View>
    </View>
  );
}

function ModelCamera({ model, setPredictions }) {
  const raf = React.useRef(null);
  const size = useWindowDimensions();

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
        // console.log(predictions);
        setPredictions(predictions);
        raf.current = requestAnimationFrame(loop);
      };
      loop();
    },
    [setPredictions]
  );

  return React.useMemo(
    () => (
      <CustomTensorCamera
        width={size.width}
        style={styles.camera}
        type={Camera.Constants.Type.front}
        onReady={onReady}
        autorender
      />
    ),
    [onReady, size.width]
  );
}

const styles = StyleSheet.create({
  camera: {
    zIndex: 0,
  },
});
