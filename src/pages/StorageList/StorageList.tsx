import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import StorageFilterModal, {
  FilterOptions,
} from '../../components/feature/storage/StorageFilterModal';
import { getStorageList, StorageItem as StorageItemType } from '../../services/api/modules/place';

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

const StorageList: React.FC = () => {
  const navigate = useNavigate();

  // 활성화된 필터 카테고리들 (여러 개가 동시에 활성화될 수 있음)
  const [activeFilterCategories, setActiveFilterCategories] = useState<FilterType[]>(['전체']);

  // 현재 모달에서 선택된 필터 카테고리
  const [currentModalFilter, setCurrentModalFilter] = useState<FilterType>('전체');

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

  // 원본 데이터와 필터링된 데이터를 모두 저장
  const [allStorageItems, setAllStorageItems] = useState<StorageItemType[]>([]);
  const [storageItems, setStorageItems] = useState<StorageItemType[]>([]);

  // 백엔드 필터링 지원 여부 (API가 태그 필터링을 지원하면 true)
  const [hasBackendFilteringSupport] = useState<boolean>(false);

  // 페이지네이션 상태
  const [pageState, setPageState] = useState<PageState>({
    page: 0,
    size: 12,
    totalPages: 1,
    totalElements: 0,
  });

  // 모든 데이터를 이미 불러왔는지 확인하는 플래그
  const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false);

  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 스크롤 컨테이너 ref
  const gridRef = useRef<HTMLDivElement>(null);

  // 필터 목록
  const filters: FilterType[] = ['전체', '보관위치', '보관방식', '물건유형', '보관기간', '귀중품'];

  // 필터가 전체적으로 비어있는지 확인하는 함수
  const isFilterEmpty = (options: FilterOptions): boolean => {
    return (
      !options.storageLocation &&
      options.itemTypes.length === 0 &&
      options.storageTypes.length === 0 &&
      options.durationOptions.length === 0 &&
      !options.isValuableSelected
    );
  };

  // 필터 옵션을 기반으로 활성화된 필터 카테고리들을 업데이트하는 함수
  const updateActiveFilterCategories = (options: FilterOptions) => {
    const categories: FilterType[] = [];

    // 필터가 비어있으면 '전체'만 활성화
    if (isFilterEmpty(options)) {
      categories.push('전체');
    } else {
      // 각 필터 카테고리별로 적용된 필터가 있는지 확인
      if (options.storageLocation) {
        categories.push('보관위치');
      }

      if (options.itemTypes.length > 0) {
        categories.push('물건유형');
      }

      if (options.storageTypes.length > 0) {
        categories.push('보관방식');
      }

      if (options.durationOptions.length > 0) {
        categories.push('보관기간');
      }

      if (options.isValuableSelected) {
        categories.push('귀중품');
      }
    }

    setActiveFilterCategories(categories);
  };

  // 필터 옵션이 변경될 때마다 활성화된 필터 카테고리들 업데이트
  useEffect(() => {
    updateActiveFilterCategories(appliedFilters);
  }, [appliedFilters]);

  // 아이템을 클라이언트 측에서 필터링하는 함수
  const filterItemsLocally = (
    items: StorageItemType[],
    options: FilterOptions,
  ): StorageItemType[] => {
    // 필터가 모두 비어있으면 모든 아이템 반환
    if (isFilterEmpty(options)) {
      return items;
    }

    return items.filter(item => {
      // post_tags 필드에서 태그 추출
      const tags = item.post_tags || item.itemTypes || [];

      // 보관 위치 필터 (실내/실외)
      if (options.storageLocation && !tags.includes(options.storageLocation)) {
        return false;
      }

      // 물건 유형 필터 (전자기기, 식물 등)
      if (options.itemTypes.length > 0 && !options.itemTypes.some(type => tags.includes(type))) {
        return false;
      }

      // 보관 방식 필터 (상온보관, 냉장보관 등)
      if (
        options.storageTypes.length > 0 &&
        !options.storageTypes.some(type => tags.includes(type))
      ) {
        return false;
      }

      // 보관 기간 필터 (일주일 이내, 한달 이내 등)
      if (
        options.durationOptions.length > 0 &&
        !options.durationOptions.some(duration => tags.includes(duration))
      ) {
        return false;
      }

      // 귀중품 필터
      if (options.isValuableSelected && !tags.includes('귀중품')) {
        return false;
      }

      // 모든 조건을 통과하면 true 반환
      return true;
    });
  };

  // 보관소 데이터 로드 함수
  const fetchStorageList = async (reset: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      // 필터 파라미터 생성
      const filterParams = getFilterParams(appliedFilters);

      console.log('필터 파라미터:', filterParams);
      console.log('활성화된 필터 카테고리들:', activeFilterCategories);

      // API 호출
      const response = await getStorageList(
        0,
        pageState.size,
        filterParams.district,
        filterParams.neighborhood,
      );

      // 응답 데이터 처리
      if (response && response.data) {
        // 원본 아이템 저장
        if (reset) {
          setAllStorageItems(response.data.items);

          // 백엔드 필터링을 지원하지 않는 경우, 저장된 필터를 적용
          if (!hasBackendFilteringSupport && !isFilterEmpty(appliedFilters)) {
            // 클라이언트 측에서 필터링 적용
            const filteredItems = filterItemsLocally(response.data.items, appliedFilters);
            setStorageItems(filteredItems);
          } else {
            // 필터가 없거나 백엔드 필터링을 지원하면 그대로 사용
            setStorageItems(response.data.items);
          }

          // 데이터가 더 있을 수 있으므로 allDataLoaded 초기화
          setAllDataLoaded(false);
        } else {
          // 페이지 추가면 데이터 합치기
          setAllStorageItems(prev => [...prev, ...response.data.items]);

          // 백엔드 필터링을 지원하지 않는 경우, 저장된 필터를 새 데이터에도 적용
          if (!hasBackendFilteringSupport && !isFilterEmpty(appliedFilters)) {
            // 기존 필터링된 아이템에 새로 필터링된 아이템 추가
            const newFilteredItems = filterItemsLocally(response.data.items, appliedFilters);
            setStorageItems(prev => [...prev, ...newFilteredItems]);
          } else {
            // 필터가 없거나 백엔드 필터링을 지원하면 그대로 추가
            setStorageItems(prev => [...prev, ...response.data.items]);
          }
        }

        // 페이지 상태 업데이트
        setPageState({
          page: 0,
          size: pageState.size,
          totalPages: 1,
          totalElements: response.data.items.length,
        });

        // 결과가 없거나 적으면 모든 데이터를 불러왔다고 표시
        if (response.data.items.length === 0) {
          setAllDataLoaded(true);
        }
      }
    } catch (err) {
      console.error('보관소 목록 로드 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 필터에서 백엔드로 보낼 파라미터 변환 함수
  const getFilterParams = (filters: FilterOptions): Record<string, any> => {
    const params: Record<string, any> = {};

    // 태그 필터링을 위한 단일 tags 파라미터로 변환
    const tags: string[] = [];

    // 보관 위치 태그 추가
    if (filters.storageLocation) {
      tags.push(filters.storageLocation);
    }

    // 물건 유형 태그 추가
    if (filters.itemTypes.length > 0) {
      tags.push(...filters.itemTypes);
    }

    // 보관 방식 태그 추가
    if (filters.storageTypes.length > 0) {
      tags.push(...filters.storageTypes);
    }

    // 보관 기간 태그 추가
    if (filters.durationOptions.length > 0) {
      tags.push(...filters.durationOptions);
    }

    // 귀중품 태그 추가
    if (filters.isValuableSelected) {
      tags.push('귀중품');
    }

    // 태그가 있으면 파라미터에 추가
    if (tags.length > 0) {
      params.tags = tags.join(',');
    }

    return params;
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchStorageList();
  }, []);

  // 필터가 활성화되었는지 확인하는 함수
  const isFilterActive = (filter: FilterType): boolean => {
    if (filter === '전체') {
      // '전체'는 다른 모든 필터가 비활성화되었을 때만 활성화
      return activeFilterCategories.includes('전체');
    }

    // 나머지 필터는 해당 카테고리가 활성화된 경우에만 활성화
    return activeFilterCategories.includes(filter);
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    // 필터 초기화
    setAppliedFilters({
      storageLocation: '',
      itemTypes: [],
      storageTypes: [],
      durationOptions: [],
      isValuableSelected: false,
    });

    // 활성화된 필터 카테고리를 '전체'로 설정
    setActiveFilterCategories(['전체']);

    // 필터 초기화 후 원본 데이터 표시
    setStorageItems(allStorageItems);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (filter: FilterType) => {
    if (filter === '전체') {
      // '전체' 필터면 모든 필터 초기화
      resetFilters();

      // 백엔드 필터링 지원하면 API 호출, 아니면 그냥 원본 데이터 표시
      if (hasBackendFilteringSupport) {
        fetchStorageList(true);
      }
    } else {
      // 필터 모달을 열기 전에 현재 모달에서 선택한 필터 카테고리를 저장
      setCurrentModalFilter(filter);

      // 필터 모달 열기
      setIsFilterModalOpen(true);
    }
  };

  // 필터 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsFilterModalOpen(false);
  };

  // 인피니티 스크롤 구현
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!gridRef.current || loading || allDataLoaded) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // 스크롤이 하단에 도달했는지 확인 (90% 지점)
    if (scrollTop + clientHeight >= scrollHeight * 0.9) {
      loadMoreItems();
    }
  };

  // 추가 아이템 로드
  const loadMoreItems = () => {
    // 모든 데이터를 이미 불러왔으면 더 이상 요청하지 않음
    if (allDataLoaded) {
      return;
    }

    // 다음 페이지 로드
    // 현재 API는 페이지네이션을 지원하지 않을 수 있으므로 일단 모든 데이터를 불러왔다고 표시
    setAllDataLoaded(true);

    // 실제 페이지네이션 API가 구현되면 아래 코드 활성화
    /*
    setPageState(prev => ({
      ...prev,
      page: prev.page + 1,
    }));

    // API 호출하여 다음 페이지 데이터 로드
    fetchStorageList(false);
    */
  };

  // 필터 적용 핸들러
  const handleApplyFilter = (options: FilterOptions) => {
    // 필터 상태 업데이트
    setAppliedFilters(options);

    // 모달 닫기
    setIsFilterModalOpen(false);

    // 백엔드 API가 태그 필터링을 지원하는 경우
    if (hasBackendFilteringSupport) {
      // 필터 적용 후 데이터 다시 로드 (첫 페이지부터)
      fetchStorageList(true);
    } else {
      // 클라이언트 측에서 필터링
      setLoading(true);
      if (isFilterEmpty(options)) {
        // 필터가 비어있으면 모든 아이템 표시
        setStorageItems(allStorageItems);
      } else {
        // 필터 적용
        const filteredItems = filterItemsLocally(allStorageItems, options);
        setStorageItems(filteredItems);
      }
      setLoading(false);
    }
  };

  // 상세 페이지로 이동하는 함수
  const handleItemClick = (id: string | number) => {
    navigate(`/storage/${id}`);
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
          storageItems.map(item => (
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
        initialFilters={appliedFilters}
        currentFilter={currentModalFilter}
      />

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="보관소" />
    </Container>
  );
};

export default StorageList;
