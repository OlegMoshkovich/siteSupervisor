import React from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from './colors';

interface TabButtonProps {
  icon: string;
  active: boolean;
  onPress: () => void;
  label: string;
  disabled?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, active, onPress, label, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={{
      marginHorizontal: 6,
      marginBottom: 10,
      width: 120,
      height: 30,
      borderRadius: 1000,
      borderWidth: 1,
      borderColor: colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 10, height: 10 },
      shadowRadius: 8,
      elevation: 8,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    }}
  >
    <Ionicons
      name={icon as any}
      size={20}
      color={active ? colors.secondary : colors.primary}
    />
    {/* Optionally render label here if needed */}
  </TouchableOpacity>
);

export default TabButton; 