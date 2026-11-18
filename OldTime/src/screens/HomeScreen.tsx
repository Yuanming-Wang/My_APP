import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { useGreeting } from '../hooks';
import { colors, spacing, borderRadius, typography } from '../lib/theme';

export function HomeScreen({ navigation }: any) {
  const { books, loading } = useAppStore();
  const greeting = useGreeting();

  const handleBookPress = (id: string) => {
    useAppStore.getState().openBook(id);
    navigation.navigate('Reader', { bookId: id });
  };

  const renderBook = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => handleBookPress(item.id)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.coverImageUrl }}
        style={styles.bookCover}
        resizeMode="cover"
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.bookMeta}>{item.pages?.length || 0} 页</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyTitle}>还没有藏品</Text>
      <Text style={styles.emptyDesc}>点击下方按钮开始制作</Text>
    </View>
  );

  const SkeletonCard = () => (
    <View style={[styles.bookCard, { backgroundColor: colors.border }]}>
      <View style={[styles.bookCover, { backgroundColor: colors.borderLight }]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>回忆</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>我</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.grid}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* 问候 */}
            <Text style={styles.greeting}>{greeting}，今天有藏品要入馆吗？</Text>

            {/* 制作入口 */}
            <TouchableOpacity
              style={styles.createCard}
              onPress={() => navigation.navigate('Create')}
              activeOpacity={0.85}
            >
              <View style={styles.createIcon}>
                <Text style={styles.createIconText}>📷</Text>
              </View>
              <View style={styles.createInfo}>
                <Text style={styles.createTitle}>开始制作回忆</Text>
                <Text style={styles.createDesc}>挑选照片，讲述故事</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>我的收藏馆</Text>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletonRow}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <EmptyState />
          )
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h1 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: colors.textInverse, fontSize: 14, fontWeight: '600' },
  list: { padding: spacing.lg },
  greeting: { ...typography.h1, marginBottom: spacing.lg },
  createCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard,
    padding: spacing.lg, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.xxl,
  },
  createIcon: {
    width: 48, height: 48, borderRadius: borderRadius.md,
    backgroundColor: colors.bgPage, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  createIconText: { fontSize: 24 },
  createInfo: { flex: 1 },
  createTitle: { ...typography.h2, marginBottom: 2 },
  createDesc: { ...typography.caption },
  arrow: { fontSize: 24, color: colors.textTertiary },
  sectionTitle: { ...typography.h1, marginBottom: spacing.md },
  grid: { gap: spacing.md },
  bookCard: {
    flex: 1, backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.md,
  },
  bookCover: { width: '100%', height: 180 },
  bookInfo: { padding: spacing.sm },
  bookTitle: { ...typography.h2, marginBottom: 2 },
  bookMeta: { ...typography.small },
  emptyBox: {
    alignItems: 'center', paddingVertical: 48,
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyTitle: { ...typography.h2, marginBottom: spacing.xs },
  emptyDesc: { ...typography.caption },
  skeletonRow: { flexDirection: 'row', gap: spacing.md },
});
