import 'react-native-get-random-values';
import Realm from 'realm';

// Returns the shared instance of the Realm app.
export function getRealmApp() {
    const appId = 'form-development-qlwda';
    // const appId = "form-app-fgkjq";
    // const appId = "application-0-skvyi";
    const appConfig = {
      id: appId,
      timeout: 10000,
    };
   return new Realm.App(appConfig);
 }