import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Book } from '../../types';
import { colors, spacing, borderRadius, typography, shadows } from '../../lib/theme';

interface BookCardProps {
  book: Book;
  onPress: (id: string) => void;
}

export function BookCard({ book, onPress }: BookCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(book.id)}
      activeOpacity={0.8}
    >
      {/* 封面 */}
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: book.coverImageUrl }}
          style={styles.cover}
          resizeMode="cover"
        />
        {/* 书脊效果 */}
        <View style={styles.spine} />
      </View>

      {/* 信息 */}
      <View style={styles.info}>
        <Text style={styles.archiveNo}>{book.archiveNo}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {book.subtitle}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{book.pages.length} 页</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{book.ownerName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: spacing.lg,
  },
  coverContainer: {
    width: 160,
    height: 220,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.border,
    ...shadows.md,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 16,
    background: 'linear-gradient(to right, #3d1a00, #7a3b12)',
  },
  info: {
    marginTop: spacing.sm,
  },
  archiveNo: {
    ...typography.small,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...typography.small,
    color: colors.textTertiary,
  },
  metaDot: {
    ...typography.small,
    color: colors.textTertiary,
    marginHorizontal: 4,
  },
});
