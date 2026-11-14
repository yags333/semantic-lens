import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MetadataBadgeProps {
  icon: string;
  label: string;
  value: string | number;
}

export const MetadataBadge: React.FC<MetadataBadgeProps> = ({ icon, label, value }) => {
  return (
    <View style={styles.badge}>
      <Text style={styles.icon}>{icon}</Text>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
    marginBottom: 8
  },
  icon: {
    fontSize: 16,
    marginRight: 8
  },
  label: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  value: {
    fontSize: 12,
    color: '#f8fafc',
    fontWeight: '700'
  }
});
