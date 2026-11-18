import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Clipboard, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../lib/theme';

export function HelpScreen({ navigation }: any) {
  const [sending, setSending] = useState(false);

  const handleSendHelp = async () => {
    if (sending) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    Alert.alert('已发送', '孩子会收到通知，请稍等。');
  };

  const handleCopyLink = async () => {
    try {
      await Share.share({
        message: '我需要帮助制作回忆纪念册，请帮帮我！',
      });
    } catch {
      Alert.alert('提示', '分享失败，请重试。');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>向孩子求助</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* 说明 */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>👨‍👩‍👧</Text>
          <Text style={styles.infoTitle}>让孩子帮你讲故事</Text>
          <Text style={styles.infoDesc}>
            你可以把照片选好，让孩子帮你写故事。{'\n'}或者直接让孩子帮你挑选照片。
          </Text>
        </View>

        {/* 选项1 */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => Alert.alert('提示', '请先在"回忆"中挑选照片，再让孩子帮写故事。')}
          activeOpacity={0.85}
        >
          <Text style={styles.optionIcon}>📝</Text>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>让孩子帮写故事</Text>
            <Text style={styles.optionDesc}>你挑选照片，孩子帮你写故事</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* 选项2 */}
        <TouchableOpacity
          style={[styles.optionCard, sending && { opacity: 0.4 }]}
          onPress={handleSendHelp}
          disabled={sending}
          activeOpacity={0.85}
        >
          <Text style={styles.optionIcon}>📱</Text>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>{sending ? '发送中...' : '发送求助信号'}</Text>
            <Text style={styles.optionDesc}>通知孩子来帮你操作</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* 选项3 */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleCopyLink}
          activeOpacity={0.85}
        >
          <Text style={styles.optionIcon}>🔗</Text>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>分享求助链接</Text>
            <Text style={styles.optionDesc}>通过微信发送给孩子</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* 提示 */}
        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            孩子收到链接后，可以在手机上直接帮你编辑故事。
          </Text>
        </View>
      </View>
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
  content: { flex: 1, padding: spacing.lg },
  infoBox: {
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.border,
  },
  infoIcon: { fontSize: 48, marginBottom: spacing.md },
  infoTitle: { ...typography.h1, marginBottom: spacing.sm },
  infoDesc: { ...typography.caption, textAlign: 'center', lineHeight: 20 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  optionIcon: { fontSize: 28, marginRight: spacing.md },
  optionInfo: { flex: 1 },
  optionTitle: { ...typography.h2, marginBottom: 2 },
  optionDesc: { ...typography.caption },
  arrow: { fontSize: 24, color: colors.textTertiary },
  tipBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.successBg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  tipIcon: { fontSize: 16, marginRight: spacing.sm, marginTop: 2 },
  tipText: { ...typography.caption, color: colors.success, flex: 1, lineHeight: 20 },
});
