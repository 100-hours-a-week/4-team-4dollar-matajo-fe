import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import StorageFilterModal, {
  FilterOptions,
} from '../../components/feature/storage/StorageFilterModal';
import { getStorageList, StorageItem as StorageItemType } from '../../services/api/modules/place';
import client from '../../services/api/client';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#3A00E5',
  primaryLight: '#5E5CFD',
  primaryAlpha: 'rgba(94, 92, 253, 0.60)',
  background: '#F5F5FF',
  darkText: '#464646',
  lightGrayText: '#999999',
  priceText: '#3A5BFF',
  borderColor: '#EFEFF0',
  white: '#FFFFFF',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 100%;
  height: calc(100vh - 116px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: auto;
  padding-bottom: 40px;
  padding-top: 10px;
  margin-top: -50px;
`;

// 검색창 컴포넌트
const SearchInput = styled.div`
  width: 294px;
  height: 45px;
  position: fixed;
  left: 20px;
  top: 55px;
  border-radius: 30px;
  border: 1px ${THEME.primaryLight} solid;
`;

// 돋보기 아이콘
const SearchIcon = styled.div`
  width: 30px;
  height: 30px;
  position: fixed;
  left: 325px;
  top: 63px;
  transform-origin: top left;
  text-align: center;
  color: ${THEME.primaryLight};
  font-size: 43.75px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.04px;
  line-height: 0.7;
`;

// 필터 태그 기본 스타일
const FilterTag = styled.div<{ isActive: boolean }>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 28px;
  padding: 0 15px;
  margin-right: 5px;
  border-radius: 30px;
  background: ${props => (props.isActive ? THEME.primaryAlpha : 'transparent')};
  border: ${props => (props.isActive ? 'none' : `1px ${THEME.primaryLight} solid`)};
  color: ${props => (props.isActive ? THEME.white : THEME.lightGrayText)};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
`;

// 필터 스크롤 컨테이너
const FilterContainer = styled.div`
  position: fixed;
  top: 108px;
  left: 0;
  width: 100%;
  max-width: 345px;
  height: 40px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
  padding: 5px 20px;
  z-index: 999;
  background-color: ${THEME.white};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin: 0 auto;
  display: flex;
  align-items: center;
`;

// 아이템 그리드 컨테이너
const ItemGridContainer = styled.div`
  position: absolute;
  top: 180px;
  left: 0;
  width: 100%;
  max-width: 345px;
  height: calc(100% - 180px - 76px); /* 헤더 + 필터 + 네비게이션 높이 제외 */
  overflow-y: auto;
  padding: 10px 15px 76px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

// 스크롤바 스타일링
const ScrollIndicator = styled.div`
  position: absolute;
  right: 0;
  top: 215px;
  width: 7px;
  height: 81.52px;
  background: #d9d9d9;
  border-radius: 3.5px;
`;

// 보관소 아이템 카드
const StorageItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

// 보관소 이미지 컨테이너
const StorageImageContainer = styled.div`
  width: 100%;
  height: 120px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #aaa;
  font-size: 14px;
  overflow: hidden;
`;

// 보관소 이미지
const StorageImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

// 보관소 이름
const StorageName = styled.div`
  color: black;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
  margin-bottom: 3px;
`;

// 보관소 위치
const StorageLocation = styled.div`
  color: black;
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 350;
  letter-spacing: 0.01px;
  margin-bottom: 5px;
`;

// 보관소 가격
const StoragePrice = styled.div`
  color: ${THEME.priceText};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
`;

// 필터 유형 정의
type FilterType = '전체' | '보관위치' | '보관방식' | '물건유형' | '보관기간' | '귀중품';

// 페이지 상태 인터페이스 정의
interface PageState {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

// 현재 API 응답 형식에 맞게 인터페이스 수정 필요
interface StorageItem {
  post_id: number;
  post_title: string;
  post_main_image: string;
  post_address: string;
  prefer_price: number;
  post_tags: string[];
}

interface StorageDetailData {
  post_id: number;
  post_images: string[];
  post_title: string;
  post_tags: string[];
  prefer_price: number;
  post_content: string;
  post_address: string;
  nickname: string;
  hidden_status: boolean;
}

const StorageList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [activeFilterCategories, setActiveFilterCategories] = useState<string[]>(['전체']);
  const [currentModalFilter, setCurrentModalFilter] = useState<string>('전체');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({
    storageLocation: [],
    itemTypes: [],
    storageTypes: [],
    durationOptions: [],
    isValuableSelected: false,
  });
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [allStorageItems, setAllStorageItems] = useState<StorageItem[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hasBackendFilteringSupport] = useState<boolean>(false);

  // API 호출 함수
  const fetchStorageList = async (reset: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      const response = await client.get('/api/posts', {
        params: {
          offset: 0,
          limit: 10,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.data.success) {
        const items = response.data.data;
        if (reset) {
          setAllStorageItems(items);
          setStorageItems(items);
        } else {
          setAllStorageItems(prev => [...prev, ...items]);
          setStorageItems(prev => [...prev, ...items]);
        }
      }
    } catch (err) {
      console.error('보관소 목록 로드 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터링 함수
  const filterItemsLocally = (items: StorageItem[], filters: FilterOptions) => {
    if (isFilterEmpty(filters)) {
      return items;
    }

    return items.filter(item => {
      // 태그가 없는 경우 필터링에서 제외
      if (!item.post_tags) {
        return false;
      }

      // 보관 위치 필터
      if (filters.storageLocation.length > 0) {
        const hasMatchingLocation = filters.storageLocation.some(location =>
          item.post_tags.includes(location),
        );
        if (!hasMatchingLocation) return false;
      }

      // 물건 유형 필터
      if (filters.itemTypes.length > 0) {
        const hasMatchingItemType = filters.itemTypes.some(type => item.post_tags.includes(type));
        if (!hasMatchingItemType) return false;
      }

      // 보관 방식 필터
      if (filters.storageTypes.length > 0) {
        const hasMatchingStorageType = filters.storageTypes.some(type =>
          item.post_tags.includes(type),
        );
        if (!hasMatchingStorageType) return false;
      }

      // 보관 기간 필터
      if (filters.durationOptions.length > 0) {
        const hasMatchingDuration = filters.durationOptions.some(duration =>
          item.post_tags.includes(duration),
        );
        if (!hasMatchingDuration) return false;
      }

      // 귀중품 필터
      if (filters.isValuableSelected && !item.post_tags.includes('귀중품')) {
        return false;
      }

      return true;
    });
  };

  // 필터가 비어있는지 확인하는 함수
  const isFilterEmpty = (filters: FilterOptions) => {
    return (
      filters.storageLocation.length === 0 &&
      filters.itemTypes.length === 0 &&
      filters.storageTypes.length === 0 &&
      filters.durationOptions.length === 0 &&
      !filters.isValuableSelected
    );
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchStorageList();
  }, []);

  // 필터 적용 핸들러
  const handleApplyFilter = (options: FilterOptions) => {
    console.log('Applied filters:', options); // 디버깅용
    setAppliedFilters(options);
    setIsFilterModalOpen(false);

    const filteredItems = filterItemsLocally(allStorageItems, options);
    console.log('Filtered items:', filteredItems); // 디버깅용
    setStorageItems(filteredItems);

    // 필터가 적용되면 '전체' 필터를 제외하고 선택된 필터 카테고리들을 표시
    const activeCategories = [];
    if (options.storageLocation) activeCategories.push('보관위치');
    if (options.storageTypes.length > 0) activeCategories.push('보관방식');
    if (options.itemTypes.length > 0) activeCategories.push('물건유형');
    if (options.durationOptions.length > 0) activeCategories.push('보관기간');
    if (options.isValuableSelected) activeCategories.push('귀중품');

    setActiveFilterCategories(activeCategories.length > 0 ? activeCategories : ['전체']);
  };

  // 상세 페이지로 이동
  const handleItemClick = (id: number) => {
    navigate(`/storage/${id}`);
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    setAppliedFilters({
      storageLocation: [],
      itemTypes: [],
      storageTypes: [],
      durationOptions: [],
      isValuableSelected: false,
    });

    setActiveFilterCategories(['전체']);
    setStorageItems(allStorageItems);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (filter: FilterType) => {
    if (filter === '전체') {
      resetFilters();
      if (hasBackendFilteringSupport) {
        fetchStorageList(true);
      }
    } else {
      setCurrentModalFilter(filter);
      setIsFilterModalOpen(true);
    }
  };

  // 필터 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsFilterModalOpen(false);
  };

  // 가격 포맷 함수
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  // 아이템 렌더링 수정
  const renderStorageItem = (item: StorageItem) => (
    <StorageItem key={item.post_id} onClick={() => handleItemClick(item.post_id)}>
      <StorageImageContainer>
        {item.post_main_image ? (
          <StorageImage src={item.post_main_image} alt={item.post_title} />
        ) : (
          <span>이미지 준비중</span>
        )}
      </StorageImageContainer>
      <StorageName>{item.post_title}</StorageName>
      <StorageLocation>{item.post_address}</StorageLocation>
      <StoragePrice>{formatPrice(item.prefer_price)}</StoragePrice>
    </StorageItem>
  );

  return (
    <Container>
      {/* 페이지 헤더 */}
      <Header title="보관소 리스트" />

      {/* 검색창 */}
      <SearchInput />
      <SearchIcon>⌕</SearchIcon>

      {/* 필터 */}
      <FilterContainer>
        {['전체', '보관위치', '보관방식', '물건유형', '보관기간', '귀중품'].map(filter => (
          <FilterTag
            key={filter}
            isActive={activeFilterCategories.includes(filter)}
            onClick={() => handleFilterChange(filter as FilterType)}
          >
            {filter}
          </FilterTag>
        ))}
      </FilterContainer>

      {/* 스크롤 표시기 */}
      <ScrollIndicator />

      {/* 아이템 그리드 */}
      <ItemGridContainer ref={gridRef}>
        {loading && storageItems.length === 0 ? (
          <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: '20px 0' }}>
            보관소 목록을 불러오는 중...
          </div>
        ) : error ? (
          <div
            style={{
              gridColumn: '1 / span 2',
              textAlign: 'center',
              padding: '20px 0',
              color: 'red',
            }}
          >
            {error}
          </div>
        ) : storageItems.length === 0 ? (
          <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: '20px 0' }}>
            해당 조건에 맞는 보관소가 없습니다.
          </div>
        ) : (
          storageItems.map(renderStorageItem)
        )}
        {loading && storageItems.length > 0 && (
          <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: '20px 0' }}>
            더 불러오는 중...
          </div>
        )}
      </ItemGridContainer>

      {/* 필터 모달 */}
      <StorageFilterModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseModal}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters as FilterOptions}
        currentFilter={currentModalFilter as FilterType}
      />

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="보관소" />
    </Container>
  );
};

export default StorageList;
