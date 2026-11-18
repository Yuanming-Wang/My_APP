import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography } from '../lib/theme';

export function ProfileScreen({ navigation }: any) {
  const [avatar, setAvatar] = useState<string | null>(null);

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要相册权限才能选择头像');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('错误', '选择头像失败，请重试。');
    }
  };

  const menuItems = [
    { icon: '📖', label: '我的藏品', onPress: () => navigation.navigate('Collection') },
    { icon: '👨‍👩‍👧', label: '向孩子求助', onPress: () => navigation.navigate('Help') },
    { icon: '⚙️', label: '设置', onPress: () => Alert.alert('提示', '功能开发中') },
    { icon: '❓', label: '帮助与反馈', onPress: () => Alert.alert('提示', '功能开发中') },
    { icon: 'ℹ️', label: '关于', onPress: () => Alert.alert('关于', '回忆 v1.0.0\n旧时光，新珍藏') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 用户卡片 */}
        <TouchableOpacity
          style={styles.userCard}
          onPress={handlePickAvatar}
          activeOpacity={0.85}
        >
          <View style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>我</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraText}>📷</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>点击设置头像</Text>
            <Text style={styles.userDesc}>让回忆更有温度</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* 菜单 */}
        <View style={styles.menuBox}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 退出 */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.replace('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  headerTitle: { ...typography.h1 },
  content: { flex: 1 },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard,
    margin: spacing.lg, padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  avatarWrap: { position: 'relative', marginRight: spacing.lg },
  avatarImg: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: colors.textInverse },
  cameraBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.bgCard, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  cameraText: { fontSize: 12 },
  userInfo: { flex: 1 },
  userName: { ...typography.h2, marginBottom: 2 },
  userDesc: { ...typography.caption },
  arrow: { fontSize: 24, color: colors.textTertiary },
  menuBox: {
    backgroundColor: colors.bgCard,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  menuIcon: { fontSize: 20, marginRight: spacing.md },
  menuLabel: { flex: 1, ...typography.body },
  menuArrow: { fontSize: 20, color: colors.textTertiary },
  logoutBtn: {
    marginTop: spacing.xl, marginHorizontal: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md, paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  logoutText: { ...typography.body, color: colors.error },
});
