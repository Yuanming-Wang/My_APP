import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../lib/theme';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: '做新藏品', icon: '📷' },
  { id: 'collection', label: '我的收藏馆', icon: '📚' },
  { id: 'help', label: '叫孩子帮忙', icon: '👨‍👩‍👧' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text style={[styles.icon, activeTab === tab.id && styles.activeIcon]}>
            {tab.icon}
          </Text>
          <Text style={[styles.label, activeTab === tab.id && styles.activeLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20, // 适配iPhone底部安全区域
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  activeTab: {
    backgroundColor: 'rgba(139, 69, 19, 0.05)',
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    ...typography.small,
    color: colors.textTertiary,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});
