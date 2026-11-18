import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Media } from '../../types';
import { MediaCard } from './MediaCard';
import { spacing } from '../../lib/theme';

interface MediaGridProps {
  media: Media[];
  onDelete: (id: string) => void;
}

export function MediaGrid({ media, onDelete }: MediaGridProps) {
  return (
    <FlatList
      data={media}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      renderItem={({ item, index }) => (
        <View style={styles.item}>
          <MediaCard media={item} index={index} onDelete={onDelete} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  item: {
    width: '48%',
    marginBottom: spacing.md,
  },
});
