import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { advertisementApi } from '@/api/advertisement.api';
import { AdvertisementListItem } from '@/types/advertisement.types';

export default function HomeScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['advertisements'],
    queryFn: () => advertisementApi.list().then((res) => res.data.data),
  });

  const renderItem = ({ item }: { item: AdvertisementListItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/advertisement/[id]', params: { id: item.id } })}>
      {item.images[0] && <Image source={{ uri: item.images[0].url }} style={styles.image} />}
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>{Number(item.price).toLocaleString()} {item.currency}</Text>
        <Text style={styles.location}>{item.city.nameAr}، {item.governorate.nameAr}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>سومة</Text>
      </View>

      {isLoading && <Text style={styles.centerText}>جاري التحميل...</Text>}
      {error && <Text style={styles.centerText}>حدث خطأ أثناء جلب الإعلانات</Text>}
      {data && data.items.length === 0 && <Text style={styles.centerText}>لا توجد إعلانات حالياً</Text>}

      {data && (
        <FlatList
          data={data.items}
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
  header: { paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f766e', textAlign: 'right' },
  centerText: { textAlign: 'center', marginTop: 40, color: '#666' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    flexDirection: 'row-reverse',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: { width: 100, height: 100 },
  cardBody: { flex: 1, padding: 12, alignItems: 'flex-end' },
  title: { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  price: { fontSize: 16, color: '#0f766e', fontWeight: 'bold', marginTop: 4 },
  location: { fontSize: 12, color: '#888', marginTop: 4 },
});
