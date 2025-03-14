import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';

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
  width: 375px;
  height: 812px;
  position: relative;
  background: white;
  overflow: hidden;
`;

// 검색창 컴포넌트
const SearchInput = styled.div`
  width: 294px;
  height: 45px;
  position: absolute;
  left: 20px;
  top: 92px;
  border-radius: 30px;
  border: 1px ${THEME.primaryLight} solid;
`;

// 돋보기 아이콘
const SearchIcon = styled.div`
  width: 30px;
  height: 30px;
  position: absolute;
  right: 20px;
  top: 126px;
  transform: rotate(180deg);
  transform-origin: top left;
  text-align: center;
  color: ${THEME.primaryLight};
  font-size: 43.75px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.04px;
  line-height: 0.7;
`;

// 필터 스크롤 컨테이너
const FilterContainer = styled.div`
  position: absolute;
  top: 158px;
  left: 0;
  width: 100%;
  height: 28px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
  padding-left: 20px;
  padding-right: 20px;
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

// 아이템 그리드 컨테이너
const ItemGridContainer = styled.div`
  position: absolute;
  top: 200px;
  left: 0;
  width: 100%;
  height: calc(100% - 200px - 76px); /* 헤더 + 필터 + 네비게이션 높이 제외 */
  overflow-y: auto;
  padding: 0 15px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding-bottom: 76px; /* 네비게이션 높이만큼 패딩 */
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
  margin-bottom: 10px;
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
  id: number;
  name: string;
  location: string;
  price: number;
}

const StorageList: React.FC = () => {
  // 활성화된 필터 상태
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');

  // 보관소 아이템 데이터 상태
  const [storageItems, setStorageItems] = useState<StorageItemType[]>([]);

  // 전체 아이템 개수
  const [totalItems, setTotalItems] = useState<number>(24);

  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(false);

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
    }));
  };

  // 초기 데이터 로드
  useEffect(() => {
    setStorageItems(generateDummyItems(1, 12));
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    // 실제 구현에서는 이 부분에서 필터에 맞는 데이터를 불러오는 API 호출을 할 수 있습니다.
  };

  // 인피니티 스크롤 구현
  const handleScroll = () => {
    if (!gridRef.current || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = gridRef.current;

    // 스크롤이 하단에 도달했는지 확인
    if (scrollTop + clientHeight >= scrollHeight - 50 && storageItems.length < totalItems) {
      loadMoreItems();
    }
  };

  // 추가 아이템 로드
  const loadMoreItems = () => {
    setLoading(true);

    // 로딩 딜레이 시뮬레이션 (실제 구현에서는 API 호출)
    setTimeout(() => {
      const newItems = generateDummyItems(storageItems.length + 1, 12);
      setStorageItems(prev => [...prev, ...newItems]);
      setLoading(false);
    }, 1000);
  };

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const currentRef = gridRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [storageItems, loading]);

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
            isActive={activeFilter === filter}
            onClick={() => handleFilterChange(filter)}
          >
            {filter}
          </FilterTag>
        ))}
      </FilterContainer>

      {/* 스크롤 표시기 */}
      <ScrollIndicator />

      {/* 아이템 그리드 */}
      <ItemGridContainer ref={gridRef}>
        {storageItems.map(item => (
          <StorageItem key={item.id}>
            <StorageName>{item.name}</StorageName>
            <StorageLocation>{item.location}</StorageLocation>
            <StoragePrice>{formatPrice(item.price)}</StoragePrice>
          </StorageItem>
        ))}
        {loading && (
          <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: '20px 0' }}>
            로딩 중...
          </div>
        )}
      </ItemGridContainer>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="보관소" />
    </Container>
  );
};

export default StorageList;
