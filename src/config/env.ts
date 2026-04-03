import { Platform } from 'react-native';

const defaultApiUrlByPlatform =
	Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';

// You can override this with EXPO_PUBLIC_API_URL for LAN, staging, or production.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrlByPlatform; 
