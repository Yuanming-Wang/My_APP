import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { ScreenContainer, Header, Button } from '../components';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReaderScreenProps {
  navigation: any;
  route: any;
}

export function ReaderScreen({ navigation, route }: ReaderScreenProps) {
  const { bookId } = route.params;
  const { getActiveBook, activePage, setActivePage } = useAppStore();
  const book = getActiveBook();
  const translateX = useSharedValue(0);

  if (!book) {
    return (
      <ScreenContainer>
        <Header title="翻阅藏品" onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未找到纪念册</Text>
        </View>
      </ScreenContainer>
    );
  }

  const currentPage = book.pages[activePage];

  const handlePrevious = () => {
    if (activePage > 0) {
      setActivePage(activePage - 1);
      translateX.value = withSpring(SCREEN_WIDTH, {
        damping: 20,
        stiffness: 90,
      });
      setTimeout(() => {
        translateX.value = 0;
      }, 300);
    }
  };

  const handleNext = () => {
    if (activePage < book.pages.length - 1) {
      setActivePage(activePage + 1);
      translateX.value = withSpring(-SCREEN_WIDTH, {
        damping: 20,
        stiffness: 90,
      });
      setTimeout(() => {
        translateX.value = 0;
      }, 300);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        {
          rotateY: `${interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [30, 0, -30]
          )}deg`,
        },
      ],
    };
  });

  const handleShare = () => {
    navigation.navigate('Share', { bookId: book.id });
  };

  return (
    <ScreenContainer padded={false}>
      <Header
        title="翻阅藏品"
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: '📤',
          onPress: handleShare,
        }}
      />
      
      <View style={styles.content}>
        {/* 页面内容 */}
        <Animated.View style={[styles.pageContainer, animatedStyle]}>
          {/* 照片 */}
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: currentPage.mediaUrl }}
              style={styles.media}
              resizeMode="cover"
            />
          </View>

          {/* 故事 */}
          <View style={styles.storyContainer}>
            <View style={styles.storyBackground}>
              <Text style={styles.storyText}>
                {currentPage.story || '这里还没有故事...'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 页码指示器 */}
        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            {activePage + 1} / {book.pages.length}
          </Text>
        </View>
      </View>

      {/* 底部控制栏 */}
      <View style={styles.footer}>
        <Button
          title="上一页"
          onPress={handlePrevious}
          variant="secondary"
          disabled={activePage === 0}
        />
        
        <View style={styles.footerCenter}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookOwner}>{book.ownerName}</Text>
        </View>

        <Button
          title="下一页"
          onPress={handleNext}
          variant="primary"
          disabled={activePage === book.pages.length - 1}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaContainer: {
    flex: 1,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  storyContainer: {
    padding: spacing.lg,
  },
  storyBackground: {
    backgroundColor: '#F8F5EE',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5DCD1',
  },
  storyText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  pageIndicator: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  pageText: {
    ...typography.caption,
    color: colors.textTertiary,
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
  footerCenter: {
    alignItems: 'center',
  },
  bookTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bookOwner: {
    ...typography.small,
    color: colors.textTertiary,
  },
});
