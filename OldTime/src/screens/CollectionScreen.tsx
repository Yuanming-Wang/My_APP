import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer, Header, BottomNav, BookCard, EmptyState } from '../components';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography } from '../lib/theme';

interface CollectionScreenProps {
  navigation: any;
}

export function CollectionScreen({ navigation }: CollectionScreenProps) {
  const { books, openBook } = useAppStore();

  const handleBookPress = (id: string) => {
    openBook(id);
    navigation.navigate('Reader', { bookId: id });
  };

  return (
    <ScreenContainer padded={false}>
      <Header title="我的收藏馆" />
      
      <View style={styles.content}>
        {books.length > 0 ? (
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <BookCard book={item} onPress={handleBookPress} />
              </View>
            )}
          />
        ) : (
          <EmptyState
            icon="📚"
            title="还没有藏品"
            description="点击下方按钮，挑选照片，讲述故事，生成你的第一本数字纪念册。"
            action={{
              label: '开始制作',
              onPress: () => navigation.navigate('Create'),
            }}
          />
        )}
      </View>

      <BottomNav
        activeTab="collection"
        onTabChange={(tab) => {
          if (tab === 'home') {
            navigation.navigate('Home');
          } else if (tab === 'help') {
            navigation.navigate('Help');
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  list: {
    padding: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  item: {
    width: '48%',
    marginBottom: spacing.lg,
  },
});
