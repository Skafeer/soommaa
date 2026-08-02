import { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { advertisementApi } from '@/api/advertisement.api';
import { favoriteApi } from '@/api/favorite.api';
import { chatApi } from '@/api/chat.api';
import { useAuthStore } from '@/stores/auth.store';

const { width } = Dimensions.get('window');

export default function AdvertisementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const [showChatBox, setShowChatBox] = useState(false);

  const { data: ad, isLoading } = useQuery({
    queryKey: ['advertisement', id],
    queryFn: () => advertisementApi.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });

  const favoriteMutation = useMutation({
    mutationFn: () => favoriteApi.add(id),
    onSuccess: () => {
      Alert.alert('تم', 'تمت إضافة الإعلان للمفضلة');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (err: any) => Alert.alert('خطأ', err.response?.data?.message ?? 'حدث خطأ'),
  });

  const startChatMutation = useMutation({
    mutationFn: () => chatApi.startChat(id, messageText.trim()),
    onSuccess: () => {
      setMessageText('');
      setShowChatBox(false);
      Alert.alert('تم', 'تم إرسال رسالتك، تحقق من تبويب المحادثات');
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (err: any) => Alert.alert('خطأ', err.response?.data?.message ?? 'حدث خطأ'),
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!ad) {
    return (
      <View style={styles.centerContainer}>
        <Text>الإعلان غير موجود</Text>
      </View>
    );
  }

  const isOwner = user?.id === ad.user.id;

  return (
    <View style={styles.container}>
      <ScrollView>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={24} color="#333" />
        </TouchableOpacity>

        {ad.images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {ad.images.map((img) => (
              <Image key={img.id} source={{ uri: img.url }} style={styles.mainImage} />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.mainImage, styles.noImage]}>
            <Ionicons name="image-outline" size={60} color="#ccc" />
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{ad.title}</Text>
          <Text style={styles.price}>{Number(ad.price).toLocaleString()} {ad.currency}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{ad.city.nameAr}، {ad.governorate.nameAr}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{ad.category.nameAr}</Text>
          </View>
          {ad.condition && (
            <View style={styles.metaRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{ad.condition === 'NEW' ? 'جديد' : 'مستعمل'}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>الوصف</Text>
          <Text style={styles.description}>{ad.description}</Text>

          {ad.attributeValues.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
              {ad.attributeValues.map((attr) => (
                <View key={attr.id} style={styles.attrRow}>
                  <Text style={styles.attrValue}>
                    {attr.valueText ?? attr.valueNumber ?? attr.option?.valueAr ?? (attr.valueBoolean ? 'نعم' : 'لا')}
                  </Text>
                  <Text style={styles.attrLabel}>{attr.categoryAttribute.nameAr}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.sectionTitle}>البائع</Text>
          <Text style={styles.sellerName}>{ad.user.fullName}</Text>
          {ad.user.phoneVerifiedAt && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#0f766e" />
              <Text style={styles.verifiedText}>رقم موثّق</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {!isOwner && (
        <View style={styles.footer}>
          {showChatBox ? (
            <View style={styles.chatBoxRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="اكتب رسالتك..."
                value={messageText}
                onChangeText={setMessageText}
                textAlign="right"
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => startChatMutation.mutate()}
                disabled={!messageText.trim() || startChatMutation.isPending}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.favoriteButton} onPress={() => favoriteMutation.mutate()}>
                <Ionicons name="heart-outline" size={22} color="#0f766e" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatButton} onPress={() => setShowChatBox(true)}>
                <Text style={styles.chatButtonText}>راسل البائع</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    position: 'absolute',
    top: 44,
    right: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 3,
  },
  mainImage: { width, height: 300 },
  noImage: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2' },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
  price: { fontSize: 22, color: '#0f766e', fontWeight: 'bold', textAlign: 'right', marginTop: 8 },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 10, gap: 6 },
  metaText: { fontSize: 14, color: '#666' },
  sectionTitle: { fontSize: 16, fontWeight: '600', textAlign: 'right', marginTop: 20, marginBottom: 8 },
  description: { fontSize: 14, color: '#444', textAlign: 'right', lineHeight: 22 },
  attrRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attrLabel: { color: '#888', fontSize: 13 },
  attrValue: { color: '#333', fontSize: 13, fontWeight: '600' },
  sellerName: { fontSize: 15, textAlign: 'right', fontWeight: '600' },
  verifiedBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 6 },
  verifiedText: { color: '#0f766e', fontSize: 12 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  footerRow: { flexDirection: 'row-reverse', gap: 12 },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#0f766e',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  chatBoxRow: { flexDirection: 'row-reverse', gap: 8, alignItems: 'center' },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#0f766e',
    borderRadius: 10,
    padding: 12,
  },
});
