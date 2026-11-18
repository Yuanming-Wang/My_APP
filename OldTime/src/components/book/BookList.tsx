import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Book } from '../../types';
import { BookCard } from './BookCard';
import { colors, spacing, typography } from '../../lib/theme';

interface BookListProps {
  books: Book[];
  onBookPress: (id: string) => void;
}

export function BookList({ books, onBookPress }: BookListProps) {
  if (books.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyText}>还没有藏品</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <BookCard book={item} onPress={onBookPress} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
