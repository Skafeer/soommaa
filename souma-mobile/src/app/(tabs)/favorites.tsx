import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { favoriteApi } from '@/api/favorite.api';
import { FavoriteItem } from '@/types/favorite.types';

export default function FavoritesScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.list().then((res) => res.data.data),
  });

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/advertisement/${item.advertisement.id}`)}>
      {item.advertisement.images[0] && (
        <Image source={{ uri: item.advertisement.images[0].url }} style={styles.image} />
      )}
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>{item.advertisement.title}</Text>
        <Text style={styles.price}>{Number(item.advertisement.price).toLocaleString()} {item.advertisement.currency}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>المفضلة</Text>
      {isLoading && <Text style={styles.centerText}>جاري التحميل...</Text>}
      {data && data.length === 0 && <Text style={styles.centerText}>لا توجد إعلانات محفوظة بعد</Text>}
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
  card: { flexDirection: 'row-reverse', backgroundColor: '#f9f9f9', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  image: { width: 90, height: 90 },
  cardBody: { flex: 1, padding: 12, alignItems: 'flex-end' },
  title: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  price: { fontSize: 15, color: '#0f766e', fontWeight: 'bold', marginTop: 4 },
});
