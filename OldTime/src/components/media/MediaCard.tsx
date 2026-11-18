import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Media } from '../../types';
import { colors, spacing, borderRadius, typography } from '../../lib/theme';
import { formatDuration } from '../../lib/utils';

interface MediaCardProps {
  media: Media;
  index: number;
  onDelete: (id: string) => void;
}

export function MediaCard({ media, index, onDelete }: MediaCardProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: media.thumbnailUri || media.uri }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* 编号 */}
      <View style={styles.indexBadge}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>

      {/* 类型标记 */}
      <View style={[styles.typeBadge, media.type === 'video' ? styles.videoBadge : styles.imageBadge]}>
        <Text style={styles.typeText}>{media.type === 'video' ? '视频' : '照片'}</Text>
      </View>

      {/* 视频时长 */}
      {media.type === 'video' && media.duration && (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(media.duration)}</Text>
        </View>
      )}

      {/* 删除按钮 */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(media.id)}
      >
        <Text style={styles.deleteIcon}>×</Text>
      </TouchableOpacity>

      {/* 播放图标（视频） */}
      {media.type === 'video' && (
        <View style={styles.playIcon}>
          <Text style={styles.playIconText}>▶</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indexBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: 36,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoBadge: {
    backgroundColor: '#1890FF',
  },
  imageBadge: {
    backgroundColor: '#52C41A',
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: -2,
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 2,
  },
});
