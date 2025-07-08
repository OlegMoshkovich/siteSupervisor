import React from 'react';
import { View } from 'react-native';
import Loader from './Loader';

const LoaderOverlay: React.FC = () => (
  <View style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  }}>
    <Loader />
  </View>
);

export default LoaderOverlay; 