import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// 웹에서 앱 등록
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, { rootTag: document.getElementById('root') }); 