import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Alert } from 'react-native';
import { ScreenContainer, Header, Button, Card } from '../components';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography } from '../lib/theme';
import { MAX_STORY_LENGTH } from '../lib/constants';

interface StoriesScreenProps {
  navigation: any;
}

export function StoriesScreen({ navigation }: StoriesScreenProps) {
  const { draftMedia, updateStory, toggleNeedStory, generate } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generating, setGenerating] = useState(false);

  const currentMedia = draftMedia[currentIndex];

  const handleStoryChange = (text: string) => {
    if (currentMedia) {
      updateStory(currentMedia.id, text);
    }
  };

  const handleToggleNeedStory = () => {
    if (currentMedia) {
      toggleNeedStory(currentMedia.id);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < draftMedia.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      generate();
      navigation.navigate('Generating');
    } catch (err) {
      Alert.alert('错误', '生成失败，请重试。');
    } finally {
      setGenerating(false);
    }
  };

  if (!currentMedia) {
    return (
      <ScreenContainer>
        <Header title="讲述故事" onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>没有照片</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title="讲述故事" onBack={() => navigation.goBack()} />
      
      <View style={styles.content}>
        {/* 照片预览 */}
        <Card style={styles.mediaCard}>
          <Image
            source={{ uri: currentMedia.uri }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
          <View style={styles.mediaInfo}>
            <Text style={styles.mediaIndex}>
              第 {currentIndex + 1} / {draftMedia.length} 张
            </Text>
            <Text style={styles.mediaType}>
              {currentMedia.type === 'video' ? '🎬 视频' : '📷 照片'}
            </Text>
          </View>
        </Card>

        {/* 故事输入 */}
        <View style={styles.storySection}>
          <View style={styles.storyHeader}>
            <Text style={styles.storyLabel}>为这张照片写一句话：</Text>
            <Button
              title={currentMedia.needStory ? '跳过' : '写故事'}
              onPress={handleToggleNeedStory}
              variant="ghost"
              size="sm"
            />
          </View>
          
          {currentMedia.needStory && (
            <View style={styles.storyInputContainer}>
              <TextInput
                value={currentMedia.story}
                onChangeText={handleStoryChange}
                placeholder="例如：这是我和老战友在公园重逢，那天聊了很多年轻时候的事。"
                style={styles.storyInput}
                multiline
                maxLength={MAX_STORY_LENGTH}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {currentMedia.story.length}/{MAX_STORY_LENGTH}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 底部按钮 */}
      <View style={styles.footer}>
        <Button
          title="上一张"
          onPress={handlePrevious}
          variant="secondary"
          disabled={currentIndex === 0}
        />
        
        {currentIndex < draftMedia.length - 1 ? (
          <Button
            title="下一张"
            onPress={handleNext}
            variant="primary"
          />
        ) : (
          <Button
            title="入藏"
            onPress={handleGenerate}
            variant="primary"
            loading={generating}
          />
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  mediaCard: {
    marginBottom: spacing.lg,
    padding: 0,
  },
  mediaImage: {
    width: '100%',
    height: 250,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  mediaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  mediaIndex: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  mediaType: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  storySection: {
    flex: 1,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  storyLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  storyInputContainer: {
    flex: 1,
  },
  storyInput: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 120,
  },
  charCount: {
    ...typography.small,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgCard,
  },
});
