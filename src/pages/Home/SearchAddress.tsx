import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { initializeKakaoMaps } from '../../services/KakaoMapService';
import { searchDong } from '../../services/api/modules/place';
import { LocationInfo } from '../../services/LocationService';
import { debounce } from 'lodash';

// 스타일드 컴포넌트 정의 (기존 코드와 동일)
const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: white;
  overflow-y: auto;
  padding-top: 47px; /* 헤더 높이만큼 패딩 */
`;

const SearchInputContainer = styled.div`
  width: 90%;
  height: 53px;
  margin: 15px auto;
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 53px;
  padding: 0 50px 0 15px;
  border-radius: 7.5px;
  border: 0.5px solid #5e5cfd;
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
  outline: none;

  &::placeholder {
    color: #9e9e9e;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 15px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: '⌕';
    font-size: 24px;
    color: #5e5cfd;
  }
`;

const SearchHelpSection = styled.div`
  padding: 20px 25px;
`;

const SearchHelpTitle = styled.p`
  color: #5e5cfd;
  font-size: 16px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  margin-bottom: 15px;
`;

const HelpItem = styled.div`
  margin-bottom: 12px;
`;

const HelpText = styled.p`
  color: black;
  font-size: 13.5px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  letter-spacing: 0.01px;
  margin-bottom: 5px;

  strong {
    font-weight: 700;
  }
`;

const ExampleText = styled.p`
  color: #5e5cfd;
  font-size: 13.5px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  letter-spacing: 0.01px;
  margin-bottom: 10px;
  margin-left: 10px;
`;

const SearchResultContainer = styled.div`
  padding: 0 20px;
`;

const SearchResultItem = styled.div`
  padding: 15px 10px;
  border-bottom: 1px solid #efefef;
  cursor: pointer;

  &:hover {
    background-color: #f5f5ff;
  }
`;

const ResultMainText = styled.p`
  color: #010048;
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  margin-bottom: 5px;
`;

const ResultSubText = styled.p`
  color: #868686;
  font-size: 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
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
  border: 3px solid rgba(94, 92, 253, 0.2  );
};

export default SearchAddress;

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

// 드롭다운 컴포넌트 스타일 추가
const DropdownContainer = styled.div`
  position: absolute;
  top: 55px;
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const DropdownItem = styled.div`
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f5f5ff;
  }
`;

const AddressText = styled.p`
  color: #868686;
  font-size: 14px;
  font-weight: 400;
`;

const NoResultsText = styled.p`
  padding: 15px;
  text-align: center;
  color: #868686;
  font-size: 14px;
`;

interface SearchAddress {
  address_name: string;
  road_address_name: string;
  place_name?: string;
  x: string; // longitude
  y: string; // latitude
}

// Kakao 전역 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

// 검색 주소 컴포넌트 인터페이스 정의
interface SearchAddressProps {
  onSelectLocation: (location: string, lat?: string, lng?: string) => void;
  recentLocations?: LocationInfo[];
}

// 검색 결과 아이템 인터페이스 정의
interface SearchResult {
  dong: string;
  formatted_address: string;
  latitude?: string;
  longitude?: string;
}

const SearchAddress: React.FC<SearchAddressProps> = ({
  onSelectLocation,
  recentLocations = [],
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDongDropdown, setShowDongDropdown] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initializingRef = useRef(false);

  // 카카오맵 API 초기화 - 이제 공통 서비스를 활용
  useEffect(() => {
    // 중복 초기화 방지
    if (initializingRef.current) return;
    initializingRef.current = true;

    const initKakaoAPI = async () => {
      try {
        setIsLoading(true);

        // 새로운 서비스를 통해 카카오맵 초기화
        await initializeKakaoMaps();

        setApiReady(true);
        setIsLoading(false);
      } catch (error) {
        console.error('카카오맵 초기화 실패:', error);
        setIsLoading(false);
        alert('카카오맵 API 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
      }
    };

    // 함수 호출
    initKakaoAPI();

    return () => {
      initializingRef.current = false;
    };
  }, []);

  // 검색 디바운스를 위한 타이머 참조
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 검색어 변경 핸들러 (디바운스 적용)
  const debouncedSearch = useRef(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // 동 검색 API 호출
        const results = await searchDong(term);

        // 검색 결과 가공
        const formattedResults: SearchResult[] = results.map(dong => ({
          dong,
          formatted_address: dong, // API 결과가 단순 문자열인 경우 formatted_address도 동일하게 설정
        }));

        setSearchResults(formattedResults);
        setHasSearched(true);
      } catch (error) {
        console.error('동 검색 중 오류 발생:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300), // 300ms 디바운스
  ).current;

  // 검색어 변경 시 디바운스 검색 실행
  useEffect(() => {
    debouncedSearch(searchTerm);

    // 컴포넌트 언마운트 시 디바운스 취소
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  // 검색어 입력 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // 결과 항목 선택 핸들러
  const handleSelectResult = (result: SearchResult) => {
    onSelectLocation(result.formatted_address, result.latitude, result.longitude);
    setSearchTerm('');
    setSearchResults([]);
  };

  // 최근 위치 선택 핸들러
  const handleSelectRecent = (location: LocationInfo) => {
    onSelectLocation(location.formatted_address, location.latitude, location.longitude);
    setSearchTerm('');
    setSearchResults([]);
  };

  // 드롭다운 외부 클릭 감지를 위한 이벤트 리스너
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowDongDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate('/registration/step1');
  };

  return (
    <>
      <Header title="주소 검색" showBackButton={true} onBack={handleBack} />

      <Container>
        <SearchInputContainer>
          <SearchInput
            ref={searchInputRef}
            type="text"
            placeholder="주소를 입력해주세요"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <SearchIcon onClick={() => {}} />

          {/* 동 검색 드롭다운 */}
          {showDongDropdown && (
            <DropdownContainer ref={dropdownRef}>
              {isLoading ? (
                <LoadingContainer>
                  <LoadingSpinner />
                  <LoadingText>검색 중...</LoadingText>
                </LoadingContainer>
              ) : searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <DropdownItem key={index} onClick={() => handleSelectResult(result)}>
                    <AddressText>{result.formatted_address}</AddressText>
                  </DropdownItem>
                ))
              ) : (
                <NoResultsText>검색 결과가 없습니다</NoResultsText>
              )}
            </DropdownContainer>
          )}
        </SearchInputContainer>

        {isLoading && !showDongDropdown && (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>{apiReady ? '주소 검색 중...' : '카카오맵 API 초기화 중...'}</LoadingText>
          </LoadingContainer>
        )}

        {!hasSearched && !isLoading && (
          <SearchHelpSection>
            <SearchHelpTitle>이렇게 검색해보세요</SearchHelpTitle>

            <HelpItem>
              <HelpText>
                <strong>도로명</strong> + <strong>건물번호</strong>
              </HelpText>
              <ExampleText>예: 타조로 4길 114</ExampleText>
            </HelpItem>

            <HelpItem>
              <HelpText>
                <strong>동/읍·면/로</strong> + <strong>번지</strong>
              </HelpText>
              <ExampleText>예: 타조동 3535</ExampleText>
            </HelpItem>

            <HelpItem>
              <HelpText>
                <strong>건물명, 아파트명</strong>
              </HelpText>
              <ExampleText>예: 타조빌라</ExampleText>
            </HelpItem>

            <HelpItem>
              <HelpText>
                <strong>동 이름만 입력하기</strong>
              </HelpText>
              <ExampleText>예: 여의도동, 공덕동, 역삼동</ExampleText>
            </HelpItem>
          </SearchHelpSection>
        )}

        {hasSearched && !isLoading && (
          <SearchResultContainer>
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <SearchResultItem key={index} onClick={() => handleSelectResult(result)}>
                  <ResultMainText>{result.formatted_address}</ResultMainText>
                  <ResultSubText>{result.formatted_address}</ResultSubText>
                </SearchResultItem>
              ))
            ) : (
              <div style={{ padding: '30px 0', textAlign: 'center', color: '#868686' }}>
                검색 결과가 없습니다.
              </div>
            )}
          </SearchResultContainer>
        )}
      </Container>
    </>
  );
};

export default SearchAddress;
