import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { reportApi } from '@/api/report.api';
import { ReportTargetType, REPORT_REASONS } from '@/types/report.types';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  advertisementId?: string;
  reportedUserId?: string;
}

export function ReportModal({ visible, onClose, targetType, advertisementId, reportedUserId }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      reportApi.create({
        targetType,
        advertisementId,
        reportedUserId,
        reason: selectedReason!,
        description: description.trim() || undefined,
      }),
    onSuccess: () => {
      Alert.alert('تم الإرسال', 'شكراً لك، تم استلام بلاغك وسيتم مراجعته');
      handleClose();
    },
    onError: (err: any) => {
      Alert.alert('خطأ', err.response?.data?.message ?? 'حدث خطأ أثناء إرسال البلاغ');
    },
  });

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('يرجى اختيار سبب البلاغ');
      return;
    }
    mutation.mutate();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>الإبلاغ عن {targetType === 'ADVERTISEMENT' ? 'الإعلان' : 'المستخدم'}</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.label}>سبب البلاغ</Text>
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.reasonRow}
              onPress={() => setSelectedReason(reason)}
            >
              <Ionicons
                name={selectedReason === reason ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedReason === reason ? '#0f766e' : '#999'}
              />
              <Text style={styles.reasonText}>{reason}</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>تفاصيل إضافية (اختياري)</Text>
          <TextInput
            style={styles.input}
            placeholder="اكتب تفاصيل إضافية إن وجدت..."
            value={description}
            onChangeText={setDescription}
            multiline
            textAlign="right"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>إرسال البلاغ</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', padding: 20 },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 14, color: '#333', textAlign: 'right', marginTop: 12, marginBottom: 8 },
  reasonRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  reasonText: { fontSize: 14, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    minHeight: 70,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: '#b91c1c',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});