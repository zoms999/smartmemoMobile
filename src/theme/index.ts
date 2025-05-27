import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1',
    primaryContainer: '#E0E7FF',
    secondary: '#EC4899',
    secondaryContainer: '#FCE7F3',
    tertiary: '#10B981',
    tertiaryContainer: '#D1FAE5',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    background: '#FAFAFA',
    error: '#EF4444',
    errorContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: '#1F2937',
    onBackground: '#1F2937',
    outline: '#D1D5DB',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8',
    primaryContainer: '#3730A3',
    secondary: '#F472B6',
    secondaryContainer: '#BE185D',
    tertiary: '#34D399',
    tertiaryContainer: '#047857',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    background: '#111827',
    error: '#F87171',
    errorContainer: '#7F1D1D',
    onPrimary: '#1E1B4B',
    onSecondary: '#831843',
    onTertiary: '#064E3B',
    onSurface: '#F9FAFB',
    onBackground: '#F9FAFB',
    outline: '#6B7280',
  },
}; 