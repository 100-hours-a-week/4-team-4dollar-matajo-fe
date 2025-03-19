import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import StorageFilterModal, { FilterOptions } from './StorageFilterModal';
import { getStorageList } from '../../api/place';

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
  max-width: 375px;
  height: calc(100vh - 76px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0 auto;
  margin-top: -36px;
  margin-bottom: 76px; /* 하단 네비게이션 높이만큼 마진 */
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
// 필터 스크롤 컨테이너 (개선된 버전)
const FilterContainer = styled.div`
  position: fixed;
  top: 108px;
  left: 0;
  width: 100%;
  max-width: 375px;
  height: 40px; // 약간 높이 증가
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
  padding: 5px 20px;
  z-index: 999; // z-index 증가
  background-color: ${THEME.white};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); // 약간의 그림자 추가
  margin: 0 auto;
  display: flex;
  align-items: center;
`;

// 아이템 그리드 컨테이너 (패딩 상단 조정)
const ItemGridContainer = styled.div`
  position: absolute;
  top: 180px; // 필터 컨테이너 높이에 맞게 조정
  left: 0;
  width: 100%;
  height: calc(100% - 180px - 76px); /* 헤더 + 필터 + 네비게이션 높이 제외 */
  overflow-y: auto;
  padding: 10px 15px 76px; // 상단 패딩과 하단 패딩 조정
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

// 보관소 아이템 타입 정의
interface StorageItemType {
  id: number | string;
  name: string;
  location: string;
  price: number;
  imageUrl?: string;
  storageLocation?: '실내' | '실외';
  itemTypes?: string[];
  storageTypes?: string[];
  durationOptions?: string[];
  isValuableItem?: boolean;
}

const StorageList: React.FC = () => {
  const navigate = useNavigate();

  // 활성화된 필터 상태
  const [currentFilter, setCurrentFilter] = useState<FilterType>('전체');

  // 필터 모달 상태
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // 적용된 필터 옵션 상태
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({
    storageLocation: '',
    itemTypes: [],
    storageTypes: [],
    durationOptions: [],
    isValuableSelected: false,
  });

  // 보관소 아이템 데이터 상태
  const [storageItems, setStorageItems] = useState<StorageItemType[]>([]);

  // 필터링된 아이템 상태
  const [filteredItems, setFilteredItems] = useState<StorageItemType[]>([]);

  // 전체 아이템 개수
  const [totalItems, setTotalItems] = useState<number>(24);

  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(true);

  // 스크롤 컨테이너 ref
  const gridRef = useRef<HTMLDivElement>(null);

  // 필터 목록
  const filters: FilterType[] = ['전체', '보관위치', '보관방식', '물건유형', '보관기간', '귀중품'];

  // 더미 데이터 생성 함수
  const generateDummyItems = (start: number, count: number): StorageItemType[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: start + i,
      name: `공간 ${start + i}`,
      location: `서울시 ${(start + i) % 3 === 0 ? '송파구' : (start + i) % 3 === 1 ? '강서구' : '분당구'}`,
      price:
        (start + i) % 4 === 0
          ? 100000
          : (start + i) % 4 === 1
            ? 10000
            : (start + i) % 4 === 2
              ? 1000
              : 80000,
      imageUrl: start + i <= 5 ? `https://placehold.co/150x120?text=공간${start + i}` : undefined,
      storageLocation: (start + i) % 2 === 0 ? '실내' : '실외',
      itemTypes: [
        (start + i) % 5 === 0
          ? '식물'
          : (start + i) % 5 === 1
            ? '전자기기'
            : (start + i) % 5 === 2
              ? '가전'
              : (start + i) % 5 === 3
                ? '의류'
                : '서적',
      ],
      storageTypes: [
        (start + i) % 3 === 0 ? '상온 보관' : (start + i) % 3 === 1 ? '냉장 보관' : '냉동 보관',
      ],
      durationOptions: [
        (start + i) % 3 === 0 ? '일주일 이내' : (start + i) % 3 === 1 ? '한달 이내' : '3개월 이상',
      ],
      isValuableItem: (start + i) % 7 === 0,
    }));
  };

  // 초기 데이터 로드
  useEffect(() => {
    const fetchStorageList = async () => {
      try {
        setLoading(true);

        // API 호출을 통해 보관소 목록 가져오기
        // 실제 구현에서는 API 호출을 사용하지만, 현재는 주석 처리하고 더미 데이터 사용
        // const response = await getStorageList();
        // const items = response.data.items.map(item => ({
        //   id: item.id,
        //   name: item.name,
        //   location: item.location,
        //   price: item.price,
        //   imageUrl: item.imageUrl,
        // }));

        // 더미 데이터 사용
        const initialItems = generateDummyItems(1, 12);
        setStorageItems(initialItems);
        setFilteredItems(initialItems);
      } catch (error) {
        console.error('보관소 목록 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStorageList();
  }, []);

  // 필터 활성화 상태 확인 함수
  const isFilterActive = (filter: FilterType): boolean => {
    if (filter === '전체') {
      // '전체'는 다른 필터가 모두 비활성화되었을 때 활성화
      return (
        !appliedFilters.storageLocation &&
        appliedFilters.itemTypes.length === 0 &&
        appliedFilters.storageTypes.length === 0 &&
        appliedFilters.durationOptions.length === 0 &&
        !appliedFilters.isValuableSelected
      );
    }

    // 각 필터 타입별로 해당하는 필터가 적용되었는지 확인
    switch (filter) {
      case '보관위치':
        return !!appliedFilters.storageLocation;
      case '물건유형':
        return appliedFilters.itemTypes.length > 0;
      case '보관방식':
        return appliedFilters.storageTypes.length > 0;
      case '보관기간':
        return appliedFilters.durationOptions.length > 0;
      case '귀중품':
        return appliedFilters.isValuableSelected;
      default:
        return false;
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (filter: FilterType) => {
    setCurrentFilter(filter);
    // 실제 구현에서는 이 부분에서 필터에 맞는 데이터를 불러오는 API 호출을 할 수 있습니다.
    // '전체'가 아닌 필터를 클릭하면 필터 모달 열기
    if (filter === '전체') {
      // '전체' 필터면 모든 필터 초기화
      setAppliedFilters({
        storageLocation: '',
        itemTypes: [],
        storageTypes: [],
        durationOptions: [],
        isValuableSelected: false,
      });
      setFilteredItems(storageItems);
    } else {
      // '전체'가 아닌 필터를 클릭하면 필터 모달 열기
      setIsFilterModalOpen(true);
    }
  };

  // 인피니티 스크롤 구현
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!gridRef.current || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // 스크롤이 하단에 도달했는지 확인
    if (scrollTop + clientHeight >= scrollHeight - 50 && filteredItems.length < totalItems) {
      loadMoreItems();
    }
  };

  // 추가 아이템 로드
  const loadMoreItems = () => {
    setLoading(true);

    // 로딩 딜레이 시뮬레이션 (실제 구현에서는 API 호출)
    setTimeout(() => {
      const newItems = generateDummyItems(storageItems.length + 1, 12);
      const updatedItems = [...storageItems, ...newItems];
      setStorageItems(updatedItems);

      // 필터 적용
      const newFilteredItems = filterItems(updatedItems, appliedFilters);
      setFilteredItems(newFilteredItems);

      setLoading(false);
    }, 1000);
  };

  // 필터 적용 핸들러
  const handleApplyFilter = (options: FilterOptions) => {
    setAppliedFilters(options);
    const newFilteredItems = filterItems(storageItems, options);
    setFilteredItems(newFilteredItems);
  };

  // 아이템 필터링 함수
  const filterItems = (items: StorageItemType[], options: FilterOptions): StorageItemType[] => {
    return items.filter(item => {
      // 보관 위치 필터
      if (options.storageLocation && item.storageLocation !== options.storageLocation) {
        return false;
      }

      // 물건 유형 필터
      if (
        options.itemTypes.length > 0 &&
        !item.itemTypes?.some(type => options.itemTypes.includes(type))
      ) {
        return false;
      }

      // 보관 방식 필터
      if (
        options.storageTypes.length > 0 &&
        !item.storageTypes?.some(type => options.storageTypes.includes(type))
      ) {
        return false;
      }

      // 보관 기간 필터
      if (
        options.durationOptions.length > 0 &&
        !item.durationOptions?.some(duration => options.durationOptions.includes(duration))
      ) {
        return false;
      }

      // 귀중품 필터
      if (options.isValuableSelected && !item.isValuableItem) {
        return false;
      }

      return true;
    });
  };

  // 상세 페이지로 이동하는 함수
  const handleItemClick = (id: number | string) => {
    navigate(`/storagedetail/${id}`);
    console.log(`아이템 ${id} 클릭됨, 상세 페이지로 이동`);
  };

  // 가격 포맷 함수
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  return (
    <Container>
      {/* 페이지 헤더 */}
      <Header title="보관소 리스트" />

      {/* 검색창 */}
      <SearchInput />
      <SearchIcon>⌕</SearchIcon>

      {/* 필터 */}
      <FilterContainer>
        {filters.map(filter => (
          <FilterTag
            key={filter}
            isActive={isFilterActive(filter)}
            onClick={() => handleFilterChange(filter)}
          >
            {filter}
          </FilterTag>
        ))}
      </FilterContainer>

      {/* 스크롤 표시기 */}
      <ScrollIndicator />

      {/* 아이템 그리드 */}
      <ItemGridContainer ref={gridRef} onScroll={handleScroll}>
        {loading && filteredItems.length === 0 ? (
          <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: '20px 0' }}>
            보관소 목록을 불러오는 중...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: '20px 0' }}>
            해당 조건에 맞는 보관소가 없습니다.
          </div>
        ) : (
          filteredItems.map(item => (
            <StorageItem key={item.id} onClick={() => handleItemClick(item.id)}>
              <StorageImageContainer>
                {item.imageUrl ? (
                  <StorageImage src={item.imageUrl} alt={item.name} />
                ) : (
                  <span>이미지 준비중</span>
                )}
              </StorageImageContainer>
              <StorageName>{item.name}</StorageName>
              <StorageLocation>{item.location}</StorageLocation>
              <StoragePrice>{formatPrice(item.price)}</StoragePrice>
            </StorageItem>
          ))
        )}
        {loading && filteredItems.length > 0 && (
          <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: '20px 0' }}>
            더 불러오는 중...
          </div>
        )}
      </ItemGridContainer>

      {/* 필터 모달 */}
      <StorageFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters}
      />

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="보관소" />
    </Container>
  );
};

export default StorageList;
