import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface CheckBoxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: number;
}

const CheckBox: React.FC<CheckBoxProps> = ({ checked, onChange, size = 20 }) => {
  const HIT_SLOP = 20;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onChange(!checked)}
      hitSlop={{ top: HIT_SLOP, bottom: HIT_SLOP, left: HIT_SLOP, right: HIT_SLOP }}
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: checked ? '#d42a02' : 'transparent',
          borderWidth: 2,
          borderColor: '#d42a02',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {checked && (
          <Ionicons name="checkmark" size={size * 0.6} color="#fff" style={{ alignSelf: 'center' }} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    color: 'white',
    shadowColor: '#0e0e0e',
    shadowOffset: { width: 1.0, height: 1.0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  checkmark: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#0e0e0e',
    shadowOffset: { width: 1.0, height: 1.0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default CheckBox;
