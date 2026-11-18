import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../lib/theme';

export function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    if (phone.length !== 11) {
      Alert.alert('提示', '请输入11位手机号');
      return;
    }
    setCodeSent(true);
    setCountdown(60);
    Alert.alert('提示', '验证码已发送（演示：123456）');
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    if (loading) return;
    if (code.length !== 6) {
      Alert.alert('提示', '请输入6位验证码');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inner}
      >
        {/* Logo */}
        <View style={s.logoBox}>
          <View style={s.logo}>
            <Text style={s.logoChar}>回</Text>
          </View>
          <Text style={s.appName}>回忆</Text>
          <Text style={s.slogan}>旧时光，新珍藏</Text>
        </View>

        {/* 表单 */}
        <View style={s.form}>
          <Text style={s.label}>手机号</Text>
          <View style={s.phoneRow}>
            <Text style={s.code}>+86</Text>
            <TextInput
              style={s.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="请输入手机号"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          {codeSent && (
            <View style={{ marginTop: spacing.xl }}>
              <Text style={s.label}>验证码</Text>
              <TextInput
                style={s.codeInput}
                value={code}
                onChangeText={setCode}
                placeholder="请输入6位验证码"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                onPress={handleSendCode}
                disabled={countdown > 0}
              >
                <Text style={s.resend}>
                  {countdown > 0 ? `${countdown}秒后重发` : '重新发送'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!codeSent ? (
            <TouchableOpacity
              style={[s.btn, phone.length !== 11 && s.btnDisabled]}
              onPress={handleSendCode}
              disabled={phone.length !== 11}
              activeOpacity={0.8}
            >
              <Text style={s.btnText}>发送验证码</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.btn, (code.length < 6 || loading) && s.btnDisabled]}
              onPress={handleLogin}
              disabled={code.length < 6 || loading}
              activeOpacity={0.8}
            >
              <Text style={s.btnText}>{loading ? '登录中...' : '登录'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={s.skip}
            onPress={() => navigation.replace('Main')}
            activeOpacity={0.7}
          >
            <Text style={s.skipText}>跳过登录 ›</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>登录即表示同意《用户协议》和《隐私政策》</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  inner: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  logoBox: { alignItems: 'center', marginBottom: 48 },
  logo: {
    width: 72, height: 72, borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoChar: { fontSize: 28, fontWeight: 'bold', color: colors.textInverse },
  appName: { fontSize: 22, fontWeight: '600', color: colors.textPrimary },
  slogan: { fontSize: 13, color: colors.textTertiary, marginTop: spacing.xs },
  form: {},
  label: { ...typography.caption, fontWeight: '500', marginBottom: spacing.sm },
  phoneRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg, height: 52,
  },
  code: {
    ...typography.body, marginRight: spacing.md,
    paddingRight: spacing.md, borderRightWidth: 1, borderRightColor: colors.border,
  },
  phoneInput: { flex: 1, ...typography.body, height: 52 },
  codeInput: {
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg, height: 52,
    ...typography.body, fontSize: 18, letterSpacing: 8,
    marginBottom: spacing.sm,
  },
  resend: { ...typography.caption, color: colors.primary, textAlign: 'right' },
  btn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    height: 52, justifyContent: 'center', alignItems: 'center',
    marginTop: spacing.xl,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { ...typography.button },
  skip: { alignItems: 'center', marginTop: spacing.xl },
  skipText: { ...typography.caption, color: colors.textTertiary },
  footer: {
    ...typography.small, textAlign: 'center',
    position: 'absolute', bottom: spacing.xl, left: 0, right: 0,
  },
});
