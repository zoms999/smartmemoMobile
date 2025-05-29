const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// React Native Web 지원을 위한 설정 추가
if (defaultConfig.resolver.alias) {
  defaultConfig.resolver.alias['react-native'] = 'react-native-web';
} else {
  defaultConfig.resolver.alias = {
    'react-native': 'react-native-web',
  };
}

// 웹 전용 확장자 추가
const webExtensions = ['.web.tsx', '.web.ts', '.web.jsx', '.web.js'];
if (defaultConfig.resolver.extensions) {
  defaultConfig.resolver.extensions = [
    ...webExtensions,
    ...defaultConfig.resolver.extensions,
  ];
} else {
  defaultConfig.resolver.extensions = [
    ...webExtensions,
    '.tsx',
    '.ts',
    '.jsx',
    '.js',
  ];
}

module.exports = defaultConfig; 