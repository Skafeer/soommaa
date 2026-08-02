export interface CategoryAttributeOption {
  id: string;
  valueAr: string;
}

export interface CategoryAttributeDetail {
  id: string;
  key: string;
  nameAr: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTI_SELECT';
  isRequired: boolean;
  options: CategoryAttributeOption[];
}

export interface CategoryListItem {
  id: string;
  nameAr: string;
  slug: string;
  parentId: string | null;
}

export interface CategoryDetail extends CategoryListItem {
  attributes: CategoryAttributeDetail[];
}