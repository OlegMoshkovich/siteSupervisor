import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import colors from './colors';

interface GenerateReportButtonProps {
  onPress: () => void;
  disabled: boolean;
}

const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({ onPress, disabled }) => (
  <View
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      paddingBottom: 2,
      paddingTop: 16,
      backgroundColor: 'white',
    }}
  >
    <TouchableOpacity
      style={{
        backgroundColor: colors.secondary,
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 28,
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={{ color: 'white', fontSize: 16 }}>Generate Report</Text>
    </TouchableOpacity>
  </View>
);

export default GenerateReportButton; 