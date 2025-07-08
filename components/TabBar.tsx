import React from 'react';
import { View } from 'react-native';
import TabButton from './TabButton';

interface TabBarProps {
  activeTab: 'photos' | 'notes' | 'summaries';
  setActiveTab: (tab: 'photos' | 'notes' | 'summaries') => void;
  uploading: boolean;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab, uploading }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 6, marginTop: 6, width: '90%', alignSelf: 'center', borderRadius: 20, paddingBottom: 0 }}>
    {/* <TabButton icon="document-text" label="Notes" active={activeTab === 'notes'} onPress={() => setActiveTab('notes')} /> */}
    <TabButton icon="camera" label="Photos" active={activeTab === 'photos'} onPress={() => setActiveTab('photos')} disabled={uploading} />
    <TabButton icon="book" label="Summaries" active={activeTab === 'summaries'} onPress={() => setActiveTab('summaries')} />
  </View>
);

export default TabBar; 