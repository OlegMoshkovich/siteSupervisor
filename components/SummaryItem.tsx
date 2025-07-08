import React from 'react';
import { View, Text } from 'react-native';
import colors from './colors';

interface SummaryItemProps {
  title: string;
  summary: string;
  createdAt?: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ title, summary, createdAt }) => (
  <View style={{ marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 12, padding: 16, width: 320, alignSelf: 'center', backgroundColor: '#fafafa' }}>
    <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#222', marginBottom: 8 }}>{title}</Text>
    <Text style={{ fontSize: 16, color: '#444' }}>{summary}</Text>
    <Text style={{ fontSize: 12, color: '#888', marginTop: 8 }}>{createdAt ? new Date(createdAt).toLocaleString() : ''}</Text>
  </View>
);

export default SummaryItem; 