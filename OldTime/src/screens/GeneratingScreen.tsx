import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { ScreenContainer } from '../components';
import { colors, spacing, typography } from '../lib/theme';
import { GENERATING_PHASE_DURATION } from '../lib/constants';

interface GeneratingScreenProps {
  navigation: any;
}

export function GeneratingScreen({ navigation }: GeneratingScreenProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 入藏动画
    Animated.sequence([
      // 第一阶段：书出现
      Animated.parallel([
        Animated.timing(progress, {
          toValue: 0.33,
          duration: GENERATING_PHASE_DURATION,
          useNativeDriver: false,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 第二阶段：页面飞入
      Animated.timing(progress, {
        toValue: 0.66,
        duration: GENERATING_PHASE_DURATION,
        useNativeDriver: false,
      }),
      // 第三阶段：完成
      Animated.timing(progress, {
        toValue: 1,
        duration: GENERATING_PHASE_DURATION,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // 动画完成后跳转到阅读器
      setTimeout(() => {
        navigation.replace('Reader', { bookId: 'new' });
      }, 500);
    });
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScreenContainer padded={false}>
      <View style={styles.container}>
        {/* 背景 */}
        <View style={styles.background} />
        
        {/* 书本动画 */}
        <Animated.View
          style={[
            styles.bookContainer,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <View style={styles.book}>
            <View style={styles.cover}>
              <Text style={styles.coverTitle}>旧时光</Text>
              <Text style={styles.coverSubtitle}>数字纪念册</Text>
            </View>
            <View style={styles.pages}>
              <View style={[styles.page, styles.page1]} />
              <View style={[styles.page, styles.page2]} />
              <View style={[styles.page, styles.page3]} />
            </View>
          </View>
        </Animated.View>

        {/* 进度条 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressText}>正在为你入藏...</Text>
        </View>

        {/* 射灯效果 */}
        <View style={styles.spotlight} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D2318',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2D2318',
  },
  bookContainer: {
    marginBottom: spacing.xxl * 2,
  },
  book: {
    width: 200,
    height: 280,
  },
  cover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8B4513',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: spacing.sm,
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#D4AF37',
    opacity: 0.8,
  },
  pages: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
  },
  page: {
    position: 'absolute',
    backgroundColor: '#F8F5EE',
    borderRadius: 2,
  },
  page1: {
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
  },
  page2: {
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
  },
  page3: {
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '500',
  },
  spotlight: {
    position: 'absolute',
    top: -100,
    left: '50%',
    marginLeft: -150,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 150,
    transform: [{ scaleY: 0.3 }],
  },
});
