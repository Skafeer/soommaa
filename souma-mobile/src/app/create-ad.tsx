import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { categoryApi } from '@/api/category.api';
import { locationApi } from '@/api/location.api';
import { advertisementApi } from '@/api/advertisement.api';
import { SelectModal } from '@/components/SelectModal';
import { CategoryAttributeDetail } from '@/types/category.types';

type AttributeInputValue = { valueText?: string; valueNumber?: string; valueBoolean?: boolean; optionId?: string };

export default function CreateAdScreen() {
  const [step, setStep] = useState<'category' | 'form'>('category');

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [attributes, setAttributes] = useState<CategoryAttributeDetail[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, AttributeInputValue>>({});

  const [governorateId, setGovernorateId] = useState<string | null>(null);
  const [governorateName, setGovernorateName] = useState('');
  const [cityId, setCityId] = useState<string | null>(null);
  const [cityName, setCityName] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'NEW' | 'USED' | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGovernorateModal, setShowGovernorateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: () => categoryApi.list().then((res) => res.data.data),
  });

  const { data: governorates } = useQuery({
    queryKey: ['governorates'],
    queryFn: () => locationApi.listGovernorates().then((res) => res.data.data),
  });

  const selectedGovernorate = governorates?.find((g) => g.id === governorateId);

  const handleSelectCategory = async (id: string, name: string) => {
    setCategoryId(id);
    setCategoryName(name);
    const detail = await categoryApi.getById(id).then((res) => res.data.data);
    setAttributes(detail.attributes);
    setAttributeValues({});
    setStep('form');
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('يجب السماح بالوصول للصور');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 10 - images.length,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((i) => i !== uri));
  };

  const updateAttrText = (attrId: string, value: string) => {
    setAttributeValues((prev) => ({ ...prev, [attrId]: { ...prev[attrId], valueText: value } }));
  };
  const updateAttrNumber = (attrId: string, value: string) => {
    setAttributeValues((prev) => ({ ...prev, [attrId]: { ...prev[attrId], valueNumber: value } }));
  };
  const updateAttrOption = (attrId: string, optionId: string) => {
    setAttributeValues((prev) => ({ ...prev, [attrId]: { ...prev[attrId], optionId } }));
  };
  const toggleAttrBoolean = (attrId: string) => {
    setAttributeValues((prev) => ({
      ...prev,
      [attrId]: { ...prev[attrId], valueBoolean: !prev[attrId]?.valueBoolean },
    }));
  };

  const validate = (): string | null => {
    if (!categoryId) return 'اختر التصنيف';
    if (!governorateId || !cityId) return 'اختر المحافظة والمدينة';
    if (title.trim().length < 5) return 'العنوان يجب أن يكون 5 أحرف على الأقل';
    if (description.trim().length < 10) return 'الوصف يجب أن يكون 10 أحرف على الأقل';
    if (!price || Number(price) <= 0) return 'أدخل سعراً صحيحاً';
    if (images.length === 0) return 'أضف صورة واحدة على الأقل';

    for (const attr of attributes) {
      if (attr.isRequired) {
        const val = attributeValues[attr.id];
        if (attr.type === 'TEXT' && !val?.valueText) return `الحقل "${attr.nameAr}" مطلوب`;
        if (attr.type === 'NUMBER' && !val?.valueNumber) return `الحقل "${attr.nameAr}" مطلوب`;
        if (attr.type === 'SELECT' && !val?.optionId) return `الحقل "${attr.nameAr}" مطلوب`;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert('تحقق من البيانات', error);
      return;
    }

    setSubmitting(true);
    try {
      const attributeValuesPayload = attributes
        .filter((attr) => attributeValues[attr.id])
        .map((attr) => {
          const val = attributeValues[attr.id];
          return {
            categoryAttributeId: attr.id,
            valueText: val.valueText,
            valueNumber: val.valueNumber ? Number(val.valueNumber) : undefined,
            valueBoolean: val.valueBoolean,
            optionId: val.optionId,
          };
        });

      const created = await advertisementApi
        .create({
          categoryId: categoryId!,
          governorateId: governorateId!,
          cityId: cityId!,
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          condition: condition ?? undefined,
          attributeValues: attributeValuesPayload,
        })
        .then((res) => res.data.data);

      await advertisementApi.uploadImages(created.id, images);
      await advertisementApi.submitForReview(created.id);

      Alert.alert('تم بنجاح', 'تم إرسال إعلانك للمراجعة، سيتم إشعارك عند قبوله', [
        { text: 'حسناً', onPress: () => router.replace('/home') },
      ]);
    } catch (err: any) {
      Alert.alert('خطأ', err.response?.data?.message ?? 'حدث خطأ أثناء نشر الإعلان');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'category') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>اختر التصنيف</Text>
          <View style={{ width: 26 }} />
        </View>
        <ScrollView style={{ padding: 16 }}>
          {categories?.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => handleSelectCategory(cat.id, cat.nameAr)}
            >
              <Text style={styles.categoryCardText}>{cat.nameAr}</Text>
              <Ionicons name="chevron-back" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep('category')}>
          <Ionicons name="arrow-forward" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إعلان جديد</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.sectionLabel}>التصنيف</Text>
        <TouchableOpacity style={styles.selectBox} onPress={() => setStep('category')}>
          <Text style={styles.selectBoxText}>{categoryName}</Text>
          <Ionicons name="chevron-down" size={18} color="#999" />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>الصور ({images.length}/10)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {images.map((uri) => (
            <View key={uri} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imageThumb} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(uri)}>
                <Ionicons name="close-circle" size={22} color="#b91c1c" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 10 && (
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
              <Ionicons name="camera-outline" size={28} color="#0f766e" />
            </TouchableOpacity>
          )}
        </ScrollView>

        <Text style={styles.sectionLabel}>العنوان</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} textAlign="right" placeholder="مثال: تويوتا كامري 2020" />

        <Text style={styles.sectionLabel}>الوصف</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          textAlign="right"
          multiline
          placeholder="اكتب وصفاً تفصيلياً..."
        />

        <Text style={styles.sectionLabel}>السعر (د.ع)</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" textAlign="right" placeholder="0" />

        <Text style={styles.sectionLabel}>الحالة</Text>
        <View style={styles.conditionRow}>
          <TouchableOpacity
            style={[styles.conditionBtn, condition === 'NEW' && styles.conditionBtnActive]}
            onPress={() => setCondition('NEW')}
          >
            <Text style={[styles.conditionText, condition === 'NEW' && styles.conditionTextActive]}>جديد</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.conditionBtn, condition === 'USED' && styles.conditionBtnActive]}
            onPress={() => setCondition('USED')}
          >
            <Text style={[styles.conditionText, condition === 'USED' && styles.conditionTextActive]}>مستعمل</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>المحافظة</Text>
        <TouchableOpacity style={styles.selectBox} onPress={() => setShowGovernorateModal(true)}>
          <Text style={styles.selectBoxText}>{governorateName || 'اختر المحافظة'}</Text>
          <Ionicons name="chevron-down" size={18} color="#999" />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>المدينة</Text>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => (governorateId ? setShowCityModal(true) : Alert.alert('اختر المحافظة أولاً'))}
        >
          <Text style={styles.selectBoxText}>{cityName || 'اختر المدينة'}</Text>
          <Ionicons name="chevron-down" size={18} color="#999" />
        </TouchableOpacity>

        {attributes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
            {attributes.map((attr) => (
              <View key={attr.id}>
                <Text style={styles.sectionLabel}>
                  {attr.nameAr} {attr.isRequired && <Text style={{ color: '#b91c1c' }}>*</Text>}
                </Text>

                {attr.type === 'TEXT' && (
                  <TextInput
                    style={styles.input}
                    textAlign="right"
                    value={attributeValues[attr.id]?.valueText ?? ''}
                    onChangeText={(v) => updateAttrText(attr.id, v)}
                  />
                )}

                {attr.type === 'NUMBER' && (
                  <TextInput
                    style={styles.input}
                    textAlign="right"
                    keyboardType="numeric"
                    value={attributeValues[attr.id]?.valueNumber ?? ''}
                    onChangeText={(v) => updateAttrNumber(attr.id, v)}
                  />
                )}

                {attr.type === 'BOOLEAN' && (
                  <TouchableOpacity style={styles.selectBox} onPress={() => toggleAttrBoolean(attr.id)}>
                    <Text style={styles.selectBoxText}>
                      {attributeValues[attr.id]?.valueBoolean ? 'نعم' : 'لا'}
                    </Text>
                  </TouchableOpacity>
                )}

                {attr.type === 'SELECT' && (
                  <View style={styles.optionsRow}>
                    {attr.options.map((opt) => {
                      const isSelected = attributeValues[attr.id]?.optionId === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[styles.optionChip, isSelected && styles.optionChipActive]}
                          onPress={() => updateAttrOption(attr.id, opt.id)}
                        >
                          <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                            {opt.valueAr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>نشر الإعلان</Text>}
        </TouchableOpacity>
      </ScrollView>

      <SelectModal
        visible={showGovernorateModal}
        title="اختر المحافظة"
        options={(governorates ?? []).map((g) => ({ id: g.id, label: g.nameAr }))}
        selectedId={governorateId ?? undefined}
        onSelect={(opt) => {
          setGovernorateId(opt.id);
          setGovernorateName(opt.label);
          setCityId(null);
          setCityName('');
        }}
        onClose={() => setShowGovernorateModal(false)}
      />

      <SelectModal
        visible={showCityModal}
        title="اختر المدينة"
        options={(selectedGovernorate?.cities ?? []).map((c) => ({ id: c.id, label: c.nameAr }))}
        selectedId={cityId ?? undefined}
        onSelect={(opt) => {
          setCityId(opt.id);
          setCityName(opt.label);
        }}
        onClose={() => setShowCityModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  categoryCard: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryCardText: { fontSize: 15, fontWeight: '500' },
  form: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  sectionLabel: { fontSize: 14, color: '#333', textAlign: 'right', marginBottom: 8, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', textAlign: 'right', marginTop: 24, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  selectBox: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  selectBoxText: { fontSize: 15, color: '#333' },
  conditionRow: { flexDirection: 'row-reverse', gap: 10, marginBottom: 16 },
  conditionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  conditionBtnActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  conditionText: { color: '#333' },
  conditionTextActive: { color: '#fff', fontWeight: '600' },
  optionsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionChip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  optionChipActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  optionChipText: { color: '#333', fontSize: 13 },
  optionChipTextActive: { color: '#fff', fontWeight: '600' },
  imageWrapper: { position: 'relative', marginLeft: 10 },
  imageThumb: { width: 80, height: 80, borderRadius: 10 },
  removeImageBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: '#fff', borderRadius: 12 },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f766e',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});