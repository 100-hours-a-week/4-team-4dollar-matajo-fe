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
import { API_PATHS } from '../../constants/api';

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
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 40px;
`;

// 검색창 컨테이너
const SearchContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-top: 10px;
  margin-bottom: 15px;
`;

// 검색창 컴포넌트
const SearchInput = styled.div`
  width: 294px;
  height: 45px;
  border-radius: 30px;
  border: 1px ${THEME.primaryLight} solid;
  position: relative;
`;

// 돋보기 아이콘
const SearchIcon = styled.div`
  width: 20px;
  height: 40px;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
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
  padding: 0 12px;
  margin: 0 3px;
  border-radius: 30px;
  background: ${props => (props.isActive ? THEME.primaryAlpha : 'transparent')};
  border: ${props =>
    props.isActive ? `1px ${THEME.primaryLight} solid` : `1px ${THEME.primaryLight} solid`};
  color: ${props => (props.isActive ? THEME.white : THEME.lightGrayText)};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
`;

// 필터 스크롤 컨테이너
const FilterContainer = styled.div`
  width: 100%;
  max-width: 480px;
  min-height: 40px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
  padding: 5px 10px;
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
`;

// 아이템 그리드 컨테이너
const ItemGridContainer = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 10px 15px 76px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasBackendFilteringSupport] = useState<boolean>(false);

  // 무한 스크롤을 위한 상태 관리
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const lastRequestTimeRef = useRef<number>(0);
  const REQUEST_INTERVAL = 500; // 1초 간격으로 요청 제한

  // API 호출 함수 - offset 기반 페이지네이션 사용
  const fetchStorageList = async (reset: boolean = true) => {
    try {
      // 요청 간격 제한 확인
      const now = Date.now();
      if (now - lastRequestTimeRef.current < REQUEST_INTERVAL) {
        console.log('요청 간격이 너무 짧습니다. 대기 중...');
        return;
      }
      lastRequestTimeRef.current = now;

      if (reset) {
        setLoading(true);
        setAllDataLoaded(false);
        setOffset(0);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const currentOffset = reset ? 0 : offset;

      console.log('API 요청 파라미터:', {
        offset: currentOffset,
        limit: limit,
      });

      const response = await client.get(API_PATHS.POSTS.LIST, {
        params: {
          offset: currentOffset,
          limit: limit,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.data.success) {
        const items = response.data.data || [];

        console.log('API 응답:', response.data);
        console.log('추출된 아이템:', items.length, '개');
        console.log('현재 offset:', currentOffset);

        if (reset) {
          setAllStorageItems(items);
          setStorageItems(items);
        } else {
          setAllStorageItems(prev => [...prev, ...items]);
          setStorageItems(prev => [...prev, ...items]);
        }

        // 다음 offset 설정 - 1씩 증가
        setOffset(currentOffset + 1);

        // 결과가 limit보다 작으면 모든 데이터가 로드된 것으로 간주
        if (items.length < limit) {
          console.log('모든 데이터 로드 완료 (더 이상 데이터 없음)');
          setAllDataLoaded(true);
        } else {
          console.log('추가 데이터 로드 필요');
          setAllDataLoaded(false);
        }
      } else {
        console.error('API 응답 실패:', response.data.message);
        setError(`데이터를 불러오는 데 실패했습니다: ${response.data.message}`);

        // 404 에러인 경우 모든 데이터가 로드된 것으로 간주
        if (response.data.message === 'not_found_posts_page') {
          console.log('페이지를 찾을 수 없음: 모든 데이터 로드 완료');
          setAllDataLoaded(true);
        }
      }
    } catch (err) {
      console.error('보관소 목록 로드 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchStorageList(true);
  }, []);

  // 관찰자 설정 (Intersection Observer API 사용) - 간소화 및 개선
  useEffect(() => {
    if (!loadMoreTriggerRef.current) return;

    // 이전 관찰자 제거
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && !isLoadingMore && !allDataLoaded) {
        console.log('로드 트리거 감지: 추가 데이터 로드');
        fetchStorageList(false);
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    observerRef.current.observe(loadMoreTriggerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, isLoadingMore, allDataLoaded, offset]);

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

  // 필터 적용 핸들러
  const handleApplyFilter = (options: FilterOptions) => {
    console.log('필터 적용:', options);
    setAppliedFilters(options);
    setIsFilterModalOpen(false);

    // 로컬 필터링 적용 (백엔드 필터링 지원 없음)
    setLoading(true);

    // 필터링 로직
    const filteredItems = filterItemsLocally(allStorageItems, options);
    console.log(`필터링 결과: ${filteredItems.length}개 항목`);
    setStorageItems(filteredItems);

    // 필터링 결과가 없으면 모든 데이터가 로드된 것으로 간주
    if (filteredItems.length === 0) {
      setAllDataLoaded(true);
    } else {
      setAllDataLoaded(false);
    }

    // 로딩 완료
    setLoading(false);

    // 필터가 적용되면 '전체' 필터를 제외하고 선택된 필터 카테고리들을 표시
    const activeCategories = [];
    if (options.storageLocation.length > 0) activeCategories.push('보관위치');
    if (options.storageTypes.length > 0) activeCategories.push('보관방식');
    if (options.itemTypes.length > 0) activeCategories.push('물건유형');
    if (options.durationOptions.length > 0) activeCategories.push('보관기간');
    if (options.isValuableSelected) activeCategories.push('귀중품');

    setActiveFilterCategories(activeCategories.length > 0 ? activeCategories : ['전체']);
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    console.log('필터 초기화');

    // 필터 옵션 초기화
    setAppliedFilters({
      storageLocation: [],
      itemTypes: [],
      storageTypes: [],
      durationOptions: [],
      isValuableSelected: false,
    });

    // 필터 카테고리 초기화
    setActiveFilterCategories(['전체']);

    // 전체 데이터 재로드
    fetchStorageList(true);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (filter: FilterType) => {
    if (filter === '전체') {
      resetFilters();
      if (hasBackendFilteringSupport) {
        // 백엔드 필터링 지원이 있는 경우 새로 불러오기
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

  // 상세 페이지로 이동
  const handleItemClick = (id: number) => {
    console.log(`보관소 상세 페이지로 이동: ${id}`);
    navigate(`/storages/${id}`);
  };

  // 가격 포맷 함수
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  // 아이템 렌더링 함수
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
    <Container ref={containerRef}>
      {/* 페이지 헤더 */}
      <Header title="보관소 리스트" />

      <SearchContainer>
        <SearchInput>
          <SearchIcon>⌕</SearchIcon>
        </SearchInput>
      </SearchContainer>

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
          <>
            {/* 스토리지 아이템 매핑 */}
            {storageItems.map(renderStorageItem)}

            {/* "더 불러오는 중..." 표시 */}
            {isLoadingMore && (
              <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: '10px 0' }}>
                더 불러오는 중...
              </div>
            )}

            {/* 모든 데이터가 로드되었을 때 표시 */}
            {allDataLoaded && storageItems.length > 0 && (
              <div
                style={{
                  gridColumn: '1 / span 2',
                  textAlign: 'center',
                  padding: '10px 0',
                  color: THEME.lightGrayText,
                }}
              >
                더 이상 표시할 보관소가 없습니다.
              </div>
            )}
          </>
        )}

        {/* 무한 스크롤을 위한 감지 엘리먼트 - 항상 그리드의 맨 아래에 위치 */}
        <div
          ref={loadMoreTriggerRef}
          style={{
            gridColumn: '1 / span 2',
            height: '50px',
            width: '100%',
            visibility: allDataLoaded ? 'hidden' : 'visible',
          }}
        />
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
