import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginScreen() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);

  const handleRequestOtp = async () => {
    if (phoneNumber.trim().length < 8) {
      Alert.alert('خطأ', 'يرجى إدخال رقم هاتف صحيح');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.requestOtp(phoneNumber.trim());
      setStep('otp');
      if (data.data.devCode) {
        Alert.alert('كود التطوير', `الكود: ${data.data.devCode}`);
      }
    } catch (err: any) {
      Alert.alert('خطأ', err.response?.data?.message ?? 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (code.trim().length !== 6) {
      Alert.alert('خطأ', 'كود التحقق يجب أن يتكون من 6 أرقام');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(phoneNumber.trim(), code.trim(), fullName.trim() || undefined);
      await setSession(data.data.user, data.data.accessToken, data.data.refreshToken);
      router.replace('/home');
    } catch (err: any) {
      Alert.alert('خطأ', err.response?.data?.message ?? 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.logo}>سومة</Text>
      <Text style={styles.subtitle}>بيع واشترِ بكل سهولة وأمان</Text>

      {step === 'phone' ? (
        <>
          <Text style={styles.label}>رقم الهاتف</Text>
          <TextInput
            style={styles.input}
            placeholder="07XXXXXXXXX"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            textAlign="right"
          />
          <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>إرسال كود التحقق</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>الاسم الكامل</Text>
          <TextInput
            style={styles.input}
            placeholder="اسمك الكامل"
            value={fullName}
            onChangeText={setFullName}
            textAlign="right"
          />
          <Text style={styles.label}>كود التحقق</Text>
          <TextInput
            style={styles.input}
            placeholder="XXXXXX"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
            textAlign="right"
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>تسجيل الدخول</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('phone')}>
            <Text style={styles.backLink}>تغيير رقم الهاتف</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logo: { fontSize: 40, fontWeight: 'bold', textAlign: 'center', color: '#0f766e', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 40 },
  label: { fontSize: 14, marginBottom: 8, color: '#333', textAlign: 'right' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#0f766e',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backLink: { textAlign: 'center', color: '#0f766e', marginTop: 16 },
});