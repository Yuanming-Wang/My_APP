import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Alert, Share } from 'react-native';
import { ScreenContainer, Header, Button, Card } from '../components';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography } from '../lib/theme';

interface ShareScreenProps {
  navigation: any;
  route: any;
}

export function ShareScreen({ navigation, route }: ShareScreenProps) {
  const { bookId } = route.params;
  const { getActiveBook, showToast } = useAppStore();
  const book = getActiveBook();
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    if (!book) return;
    
    setCopying(true);
    try {
      const url = `https://oldtime.app/share/${book.shareSlug}`;
      await Share.share({
        message: `看看我做的回忆纪念册：${url}`,
        url: url,
      });
      setCopied(true);
      showToast('分享链接已发送');
    } catch (err) {
      console.error('分享失败:', err);
      showToast('分享失败，请重试。');
    } finally {
      setCopying(false);
    }
  }, [book]);

  if (!book) {
    return (
      <ScreenContainer>
        <Header title="送出去" onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未找到纪念册</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title="送出去" onBack={() => navigation.goBack()} />
      
      <View style={styles.content}>
        {/* 预览卡片 */}
        <Card style={styles.previewCard}>
          <View style={styles.previewContent}>
            {/* 书籍封面 */}
            <View style={styles.coverContainer}>
              <View style={styles.spine} />
              <Image
                source={{ uri: book.coverImageUrl }}
                style={styles.cover}
                resizeMode="cover"
              />
            </View>

            {/* 信息 */}
            <View style={styles.info}>
              <Text style={styles.archiveNo}>{book.archiveNo}</Text>
              <Text style={styles.title}>{book.title}</Text>
              <Text style={styles.subtitle}>{book.subtitle}</Text>
              <View style={styles.meta}>
                <Text style={styles.metaText}>{book.pages.length} 页</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{book.ownerName}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* 标题 */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>送给谁珍藏？</Text>
          <Text style={styles.mainSubtitle}>
            复制链接后，可以发到微信、短信或家庭群。
          </Text>
        </View>

        {/* 分享选项 */}
        <View style={styles.actions}>
          <Button
            title={copied ? '已复制 ✓' : '复制分享链接'}
            onPress={copyLink}
            variant="primary"
            size="lg"
            loading={copying}
            style={styles.shareButton}
          />

          <Button
            title="回到收藏馆"
            onPress={() => navigation.navigate('Home')}
            variant="secondary"
            size="lg"
            style={styles.homeButton}
          />
        </View>

        {/* 提示 */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            收到链接的人，可以在手机上直接打开查看这本纪念册。
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
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
  previewCard: {
    marginBottom: spacing.xl,
  },
  previewContent: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  coverContainer: {
    width: 100,
    height: 140,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: '#3d1a00',
    zIndex: 1,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  archiveNo: {
    ...typography.small,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
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
    marginHorizontal: spacing.xs,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  mainTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  mainSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  shareButton: {
    width: '100%',
  },
  homeButton: {
    width: '100%',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: '#F6FFED',
    borderRadius: 12,
    padding: spacing.lg,
  },
  tipIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  tipText: {
    ...typography.caption,
    color: '#52C41A',
    flex: 1,
    lineHeight: 20,
  },
});
