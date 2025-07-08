import React from 'react';
import { View, Text, ScrollView, ViewProps, ScrollViewProps } from 'react-native';
import Loader from './Loader';

interface TabContentListProps {
  loading: boolean;
  emptyMessage: string;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  scrollViewProps?: ScrollViewProps;
  loaderContainerStyle?: ViewProps['style'];
  emptyTextStyle?: ViewProps['style'];
}

const TabContentList: React.FC<TabContentListProps> = ({
  loading,
  emptyMessage,
  items,
  renderItem,
  scrollViewProps,
  loaderContainerStyle,
  emptyTextStyle,
}) => {
  if (loading) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }, loaderContainerStyle]}>
        <Loader />
      </View>
    );
  }
  if (!items || items.length === 0) {
    return <Text style={[{ alignSelf: 'center', marginTop: 200, fontSize: 16 }, emptyTextStyle]}>{emptyMessage}</Text>;
  }
  return (
    <ScrollView {...scrollViewProps}>
      {items.map(renderItem)}
    </ScrollView>
  );
};

export default TabContentList; 