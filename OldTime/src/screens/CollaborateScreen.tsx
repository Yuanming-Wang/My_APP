import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { ScreenContainer, Header, Button, Card, LoadingSpinner, ErrorState } from '../components';
import { colors, spacing, typography } from '../lib/theme';
import { MAX_STORY_LENGTH } from '../lib/constants';

interface DraftPhoto {
  id: string;
  image_url: string;
  story: string;
}

interface Draft {
  id: string;
  owner_name: string;
  status: string;
  photos: DraftPhoto[];
}

interface CollaborateScreenProps {
  navigation: any;
  route: any;
}

export function CollaborateScreen({ navigation, route }: CollaborateScreenProps) {
  const { draftId } = route.params;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadDraft();
  }, [draftId]);

  const loadDraft = async () => {
    try {
      setLoading(true);
      // 这里应该调用API获取草稿
      // 暂时使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDraft({
        id: draftId,
        owner_name: '张爷爷',
        status: 'pending',
        photos: [
          { id: '1', image_url: 'https://example.com/photo1.jpg', story: '' },
          { id: '2', image_url: 'https://example.com/photo2.jpg', story: '' },
        ],
      });
    } catch (err: any) {
      setError(err.message || '加载失败，请让父母重新发送链接。');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStory = (photoId: string, story: string) => {
    if (!draft) return;
    setDraft({
      ...draft,
      photos: draft.photos.map((p) => (p.id === photoId ? { ...p, story } : p)),
    });
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);
      // 这里应该调用API完成草稿
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCompleted(true);
    } catch (err: any) {
      Alert.alert('错误', '完成失败：' + (err.message || '请重试'));
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <Header title="帮忙编辑" />
        <LoadingSpinner message="加载中..." />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <Header title="帮忙编辑" />
        <ErrorState title="无法加载" message={error} onRetry={loadDraft} />
      </ScreenContainer>
    );
  }

  if (completed) {
    return (
      <ScreenContainer>
        <Header title="帮忙编辑" />
        <View style={styles.completedContainer}>
          <View style={styles.completedIcon}>
            <Text style={styles.completedIconText}>✓</Text>
          </View>
          <Text style={styles.completedTitle}>编辑完成！</Text>
          <Text style={styles.completedSubtitle}>
            纪念册已生成，父母可以在"我的收藏馆"中查看。
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!draft) return null;

  return (
    <ScreenContainer>
      <Header title={`帮忙编辑 · ${draft.owner_name}的纪念册`} />
      
      <ScrollView style={styles.content}>
        {/* 说明 */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            请帮{draft.owner_name}为每张照片写一句话，完成后点击底部按钮。
          </Text>
        </View>

        {/* 照片列表 */}
        {draft.photos.map((photo, index) => (
          <Card key={photo.id} style={styles.photoCard}>
            <Image
              source={{ uri: photo.image_url }}
              style={styles.photo}
              resizeMode="cover"
            />
            <View style={styles.storyContainer}>
              <Text style={styles.storyLabel}>
                第 {index + 1} 张照片，请帮写一句话：
              </Text>
              <TextInput
                value={photo.story}
                onChangeText={(text) => handleUpdateStory(photo.id, text)}
                placeholder="例如：这是我和老战友在公园重逢，那天聊了很多年轻时候的事。"
                style={styles.storyInput}
                multiline
                maxLength={MAX_STORY_LENGTH}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {photo.story.length}/{MAX_STORY_LENGTH}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* 完成按钮 */}
      <View style={styles.footer}>
        <Button
          title="完成编辑，生成纪念册"
          onPress={handleComplete}
          variant="primary"
          size="lg"
          loading={completing}
          style={styles.completeButton}
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: '#E6F7FF',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  infoText: {
    ...typography.caption,
    color: '#1890FF',
    flex: 1,
    lineHeight: 20,
  },
  photoCard: {
    marginBottom: spacing.lg,
    padding: 0,
  },
  photo: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  storyContainer: {
    padding: spacing.lg,
  },
  storyLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  storyInput: {
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
  },
  charCount: {
    ...typography.small,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  completeButton: {
    width: '100%',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  completedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F6FFED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  completedIconText: {
    fontSize: 40,
    color: '#52C41A',
    fontWeight: '600',
  },
  completedTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  completedSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
