# Form: Fitness App

<p>
  <!-- iOS -->
  <img alt="Supports Expo iOS" longdesc="Supports Expo iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
  <!-- Android -->
  <img alt="Supports Expo Android" longdesc="Supports Expo Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
</p>

Uses `@tensorflow/tfjs`, `expo-camera`, and `expo-gl` (for native acceleration).

## Running the App

> `npm run android`

- Runs `expo start`, open on a native device (simulator, emulator, and browser are not supported).

Running as a "production" build

> `expo start --no-dev --minify`

## Building the App with EAS Build

Follow the directions [here](https://docs.expo.dev/build/setup/) for setting up an EAS account with expo.dev and installing the EAS cli tool.

Building for internal distribution: 

> `eas build -p android --profile preview`

## 📝 Notes

- [TFJS Expo API reference](https://js.tensorflow.org/api_react_native/latest/#Media-Camera)
- [`@tensorflow/tfjs-react-native` package](https://www.npmjs.com/package/@tensorflow/tfjs-react-native)
- [Expo Camera docs](https://docs.expo.io/versions/latest/sdk/camera/)
- [MoveNet blog post](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html)