import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { ScreenContainer, Header, Button, MediaGrid, Card } from '../components';
import { useAppStore } from '../store/useAppStore';
import { useMediaPicker } from '../hooks';
import { colors, spacing, typography } from '../lib/theme';
import { MAX_PHOTOS, MAX_VIDEOS } from '../lib/constants';

interface CreateScreenProps {
  navigation: any;
}

export function CreateScreen({ navigation }: CreateScreenProps) {
  const { draftMedia, ownerName, setOwnerName, addMedia, removeMedia } = useAppStore();
  const { pickImages, loading } = useMediaPicker();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const imageCount = draftMedia.filter((m) => m.type === 'image').length;
  const videoCount = draftMedia.filter((m) => m.type === 'video').length;

  const handlePickImages = async () => {
    try {
      const newMedia = await pickImages(draftMedia);
      if (newMedia.length > 0) {
        addMedia(newMedia);
      }
    } catch (err) {
      Alert.alert('错误', '选择照片失败，请重试。');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    Alert.alert(
      '删除文件',
      '确定要删除这张照片吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            removeMedia(id);
            setDeleteId(null);
          },
        },
      ]
    );
  };

  const handleNext = () => {
    if (draftMedia.length === 0) {
      Alert.alert('提示', '请先选择照片或视频。');
      return;
    }
    navigation.navigate('Stories');
  };

  return (
    <ScreenContainer>
      <Header title="挑选藏品" onBack={() => navigation.goBack()} />
      
      <View style={styles.content}>
        {/* 珍藏人 */}
        <View style={styles.ownerSection}>
          <Text style={styles.label}>珍藏人</Text>
          <TextInput
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="例如：张爷爷"
            style={styles.input}
            maxLength={20}
          />
        </View>

        {/* 上传区 */}
        <Card
          style={styles.uploadCard}
          onPress={handlePickImages}
        >
          <View style={styles.uploadContent}>
            <View style={styles.uploadIcon}>
              {loading ? (
                <Text style={styles.loadingText}>...</Text>
              ) : (
                <Text style={styles.plusIcon}>+</Text>
              )}
            </View>
            <Text style={styles.uploadTitle}>从手机里挑选照片或视频</Text>
            <Text style={styles.uploadSubtitle}>
              照片最多 {MAX_PHOTOS} 张 · 视频最多 {MAX_VIDEOS} 个
            </Text>
          </View>
        </Card>

        {/* 统计 */}
        {draftMedia.length > 0 && (
          <View style={styles.stats}>
            <Text style={styles.statText}>📷 照片: {imageCount}/{MAX_PHOTOS}</Text>
            <Text style={styles.statText}>🎬 视频: {videoCount}/{MAX_VIDEOS}</Text>
          </View>
        )}

        {/* 已选媒体 */}
        {draftMedia.length > 0 && (
          <View style={styles.mediaSection}>
            <MediaGrid media={draftMedia} onDelete={handleDelete} />
          </View>
        )}
      </View>

      {/* 底部按钮 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          已选 <Text style={styles.footerCount}>{draftMedia.length}</Text> 个文件
        </Text>
        <Button
          title="下一步，讲故事"
          onPress={handleNext}
          variant="primary"
          disabled={draftMedia.length === 0}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  ownerSection: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  uploadCard: {
    marginBottom: spacing.lg,
  },
  uploadContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  plusIcon: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 24,
    color: colors.primary,
  },
  uploadTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  uploadSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  mediaSection: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  footerText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  footerCount: {
    color: colors.primary,
    fontWeight: '600',
  },
});
