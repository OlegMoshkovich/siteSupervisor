import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Pressable, FlatList, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from './colors';

interface DropDownProps {
  items: string[];
  selectedItem: string;
  setSelectedItem: (item: string) => void;
  placeholder: string;
}

const DropDown: React.FC<DropDownProps> = ({ items, selectedItem, setSelectedItem, placeholder }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { width, height } = Dimensions.get('window');

  return (
    <View style={{ flex: 1, width: 200 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowDropdown(true)}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}
  
      >
        <View style={{
          // borderWidth: 1.0,
          borderColor: colors.primary,
          borderRadius: 100,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          backgroundColor: 'white',
          paddingLeft: 20,
          width: '70%',
        }}>
          <Text style={{ height: 40, lineHeight: 40, color: selectedItem ? '#222' : '#888', fontSize: 16 }}>
            {selectedItem || placeholder}
          </Text>
          <Ionicons
            name={showDropdown ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.primary}
            style={{ marginLeft: 8 }}
          />
        </View>
      </TouchableOpacity>
      {showDropdown && (
        <>
          <Pressable
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width,
              height,
              zIndex: 9,
            }}
            onPress={() => setShowDropdown(false)}
          />
          <View style={{
            position: 'absolute',
            top: 60,
            left: 0,
            width: '100%',
            backgroundColor: 'white',
            borderWidth: .5,
            borderColor: colors.primary,
            borderRadius: 10,
            zIndex: 10,
            // shadowColor: '#000',
            // shadowOpacity: 0.1,
            // shadowRadius: 8,
            // elevation: 4,
          }}>
            <FlatList
              data={items}
              keyExtractor={(item) => item}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedItem(item);
                    setShowDropdown(false);
                  }}
                  style={{
                    padding: 10,
                    borderBottomWidth: index < items.length - 1 ? 1 : 0,
                    borderBottomColor: '#eee',
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default DropDown;