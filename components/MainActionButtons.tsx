import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from './colors';

interface ActionButtonConfig {
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}

interface MainActionButtonsProps {
  buttons: ActionButtonConfig[];
}

const MainActionButtons: React.FC<MainActionButtonsProps> = ({ buttons }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 200, width: '86%' }}>
    {buttons.map((item, idx) => (
      <TouchableOpacity
        key={idx}
        onPress={item.onPress}
        disabled={item.disabled}
        style={{
          margin: 6,
          width: 94,
          height: 94,
          borderRadius: 1000,
          backgroundColor: colors.secondary,
          borderWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 10, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            borderColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={item.icon as any} size={40} color="white" />
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

export default MainActionButtons; 