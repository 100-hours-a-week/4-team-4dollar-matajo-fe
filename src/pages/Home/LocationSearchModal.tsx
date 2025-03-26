// src/pages/Home/LocationSearchModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// 모달 오버레이 - 화면 전체를 덮는 반투명 배경
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

// 모달 컨테이너
const ModalContainer = styled.div`
  width: 280px;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

// 모달 헤더
const ModalHeader = styled.div`
  padding: 14px 16px;
  text-align: center;
  border-bottom: 1px solid #efeff0;
  position: relative;
`;

// 모달 타이틀
const ModalTitle = styled.div`
  color: #000;
  font-size: 16px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
`;

// 모달 닫기 버튼
const CloseButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
`;

// 검색 컨테이너
const SearchContainer = styled.div`
  padding: 12px 16px 16px;
  width: 100%;
  box-sizing: border-box;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 85%;
  margin: 0 auto 20px auto;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 28px;
  border-radius: 5px;
  border: 0.3px solid #000;
  padding: 0 28px 0 10px;
  font-size: 13px;
  font-family: 'Noto Sans KR', sans-serif;

  &:focus {
    outline: none;
    border-color: #3a00e5;
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchResultList = styled.div`
  width: 100%;
  max-height: 240px;
  overflow-y: auto;
`;

const SearchResultItem = styled.div`
  padding: 10px 16px;
  border-bottom: 0.5px solid #b6b6b6;
  font-size: 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  line-height: 14.09px;
  color: #6f6f6f;
  cursor: pointer;
  text-align: left;

  &:hover {
    background-color: #f5f5f5;
  }
`;

// 에러 메시지 스타일
const ErrorMessage = styled.div`
  color: #ff3333;
  font-size: 12px;
  text-align: center;
  padding: 20px;
`;

// 로딩 인디케이터
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
`;

const LoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid rgba(94, 92, 253, 0.2);
  border-top: 3px solid #5e5cfd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: #5e5cfd;
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
`;

// 위치 정보 인터페이스
interface LocationInfo {
  formatted_address: string;
  display_name: string;
  latitude: string;
  longitude: string;
}

// 인터페이스 정의
interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: string, latitude?: string, longitude?: string) => void;
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 최근 검색 위치 가져오기
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);

      try {
        // 최근 검색 목록 가져오기
        const savedLocations = localStorage.getItem('recentLocationSearches');
        const recentLocations = savedLocations
          ? JSON.parse(savedLocations)
          : generateDefaultLocations();

        setSearchResults(recentLocations);
        setLoading(false);

        // 검색창에 포커스
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } catch (err) {
        console.error('최근 검색 목록 로드 오류:', err);
        setError('최근 검색 목록을 불러올 수 없습니다.');
        setLoading(false);
      }
    }
  }, [isOpen]);

  // 기본 위치 생성
  const generateDefaultLocations = (): LocationInfo[] => {
    return [
      {
        formatted_address: '서울특별시 종로구 청운동',
        display_name: '청운동, 청운효자동, 종로구, 서울특별시, 대한민국',
        latitude: '37.58895',
        longitude: '126.96784',
      },
      {
        formatted_address: '서울특별시 종로구 신교동',
        display_name: '신교동, 청운효자동, 종로구, 서울특별시, 대한민국',
        latitude: '37.58416',
        longitude: '126.96723',
      },
    ];
  };

  // 검색 타이머 ref
  const searchTimerRef = useRef<number | null>(null);

  // 검색 함수
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      // 검색어가 없으면 최근 검색 목록 표시
      const savedLocations = localStorage.getItem('recentLocationSearches');
      const recentLocations = savedLocations
        ? JSON.parse(savedLocations)
        : generateDefaultLocations();

      setSearchResults(recentLocations);
      return;
    }

    // 이전 타이머 취소
    if (searchTimerRef.current !== null) {
      window.clearTimeout(searchTimerRef.current);
    }

    setLoading(true);

    // 디바운스 적용 (300ms)
    searchTimerRef.current = window.setTimeout(() => {
      try {
        setError(null);

        // 더미 검색 결과
        const results: LocationInfo[] = searchDummyLocations(searchTerm);
        setSearchResults(results);
        setLoading(false);
      } catch (error) {
        console.error('검색 오류:', error);
        setError('검색 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }, 300);
  };

  // 더미 검색 결과 생성
  const searchDummyLocations = (term: string): LocationInfo[] => {
    return [
      {
        formatted_address: `서울특별시 종로구 ${term}동`,
        display_name: `${term}동, 종로구, 서울특별시, 대한민국`,
        latitude: '37.5631',
        longitude: '126.9847',
      },
      {
        formatted_address: `서울특별시 마포구 ${term}동`,
        display_name: `${term}동, 마포구, 서울특별시, 대한민국`,
        latitude: '37.5536',
        longitude: '126.9154',
      },
    ];
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    handleSearch();
  };

  // 검색 결과 클릭 핸들러
  const handleResultClick = (location: LocationInfo) => {
    // 선택한 위치 저장
    saveRecentLocation(location);

    // 선택한 위치 전달
    onSelectLocation(location.formatted_address, location.latitude, location.longitude);
    onClose();
  };

  // 최근 검색 위치 저장
  const saveRecentLocation = (location: LocationInfo) => {
    try {
      // 기존 저장된 최근 검색 가져오기
      const savedLocations = localStorage.getItem('recentLocationSearches');
      let recentLocations: LocationInfo[] = savedLocations ? JSON.parse(savedLocations) : [];

      // 중복 제거
      recentLocations = recentLocations.filter(
        loc => loc.formatted_address !== location.formatted_address,
      );

      // 앞에 추가
      recentLocations.unshift(location);

      // 최대 5개까지만 저장
      if (recentLocations.length > 5) {
        recentLocations = recentLocations.slice(0, 5);
      }

      // 로컬 스토리지에 저장
      localStorage.setItem('recentLocationSearches', JSON.stringify(recentLocations));
    } catch (error) {
      console.error('최근 위치 저장 오류:', error);
    }
  };

  // 배경 클릭 시 모달 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>지역 검색</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <SearchContainer>
          <SearchInputWrapper>
            <SearchInput
              ref={inputRef}
              type="text"
              placeholder="지역을 검색하세요"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
            />
            <SearchIcon>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                  stroke="#B6B6B6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="#B6B6B6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </SearchIcon>
          </SearchInputWrapper>

          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>검색 중...</LoadingText>
            </LoadingContainer>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            <SearchResultList>
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <SearchResultItem key={index} onClick={() => handleResultClick(result)}>
                    {result.formatted_address}
                  </SearchResultItem>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>검색 결과가 없습니다.</div>
              )}
            </SearchResultList>
          )}
        </SearchContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default LocationSearchModal;
