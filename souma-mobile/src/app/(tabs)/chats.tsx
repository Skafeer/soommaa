import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/api/chat.api';
import { useAuthStore } from '@/stores/auth.store';
import { ChatListItem } from '@/types/chat.types';

export default function ChatsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatApi.listMine().then((res) => res.data.data),
  });

  const renderItem = ({ item }: { item: ChatListItem }) => {
    const otherParty = item.buyerId === user?.id ? item.seller : item.buyer;
    const lastMessage = item.messages[0];

    return (
      <TouchableOpacity style={styles.card}>
        {item.advertisement.images[0] && (
          <Image source={{ uri: item.advertisement.images[0].url }} style={styles.image} />
        )}
        <View style={styles.cardBody}>
          <Text style={styles.name}>{otherParty.fullName}</Text>
          <Text style={styles.adTitle} numberOfLines={1}>{item.advertisement.title}</Text>
          {lastMessage && <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage.content}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>المحادثات</Text>
      {isLoading && <Text style={styles.centerText}>جاري التحميل...</Text>}
      {data && data.length === 0 && <Text style={styles.centerText}>لا توجد محادثات بعد</Text>}
      {data && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f766e', textAlign: 'right', paddingHorizontal: 20, marginBottom: 16 },
  centerText: { textAlign: 'center', marginTop: 40, color: '#666' },
  list: { paddingHorizontal: 16 },
  card: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  image: { width: 56, height: 56, borderRadius: 8 },
  cardBody: { flex: 1, marginRight: 12, alignItems: 'flex-end' },
  name: { fontSize: 15, fontWeight: '600' },
  adTitle: { fontSize: 12, color: '#0f766e', marginTop: 2 },
  lastMessage: { fontSize: 13, color: '#888', marginTop: 4 },
});
