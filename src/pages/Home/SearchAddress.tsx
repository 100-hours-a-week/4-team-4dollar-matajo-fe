import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { initializeKakaoMaps } from '../../services/KakaoMapService';
import { searchDong } from '../../services/api/modules/place';

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

const SearchAddress: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchAddress[]>([]);
  const [dongResults, setDongResults] = useState<string[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDongLoading, setIsDongLoading] = useState(false);
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

  // 디바운스를 위한 타이머 ref
  const searchTimerRef = useRef<number | null>(null);
  const dongSearchTimerRef = useRef<number | null>(null);

  // 동 검색 디바운스 함수
  const searchDongWithDebounce = async (value: string) => {
    if (!value.trim()) {
      setDongResults([]);
      setShowDongDropdown(false);
      return;
    }

    // 이전 타이머가 있다면 제거
    if (dongSearchTimerRef.current !== null) {
      window.clearTimeout(dongSearchTimerRef.current);
    }

    setIsDongLoading(true);

    // 300ms 디바운스 적용
    dongSearchTimerRef.current = window.setTimeout(async () => {
      try {
        const results = await searchDong(value);
        setDongResults(results);
        setShowDongDropdown(results.length > 0);
      } catch (error) {
        console.error('동 검색 오류:', error);
      } finally {
        setIsDongLoading(false);
      }
    }, 300);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // 동 검색 API 호출
    searchDongWithDebounce(value);
  };

  // 동 검색 결과 항목 클릭 핸들러
  const handleDongSelect = (address: string) => {
    // 주소에서 동 이름 추출 (마지막 부분)
    const parts = address.split(' ');
    const dongName = parts[parts.length - 1]; // 마지막 부분이 동 이름으로 가정

    // 선택된 동을 가지고 Registration1 페이지로 돌아가기
    navigate('/registration/step1', {
      state: {
        selectedAddress: {
          address: address, // 전체 주소
          roadAddress: address, // 도로명 주소가 없으면 동일하게 설정
          place: dongName, // 동 이름
          latitude: '', // API로부터 받은 데이터에 좌표가 없으므로 빈 값으로 설정
          longitude: '',
        },
      },
    });
  };

  // 디바운스 적용된 주소 검색 함수 (기존 카카오맵 검색)
  const searchAddress = () => {
    if (!searchTerm.trim()) return;

    // API가 준비되지 않았다면 알림
    if (!apiReady) {
      alert('카카오맵 API가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // 이전 타이머가 있다면 제거
    if (searchTimerRef.current !== null) {
      window.clearTimeout(searchTimerRef.current);
    }

    setIsLoading(true);
    setIsSearched(true);
    setShowDongDropdown(false); // 검색 시작 시 드롭다운 닫기

    // 디바운스 적용 (300ms)
    searchTimerRef.current = window.setTimeout(() => {
      try {
        console.log('Starting search with:', searchTerm);

        // Place 검색
        const places = new window.kakao.maps.services.Places();
        const geocoder = new window.kakao.maps.services.Geocoder();

        // 장소 검색 (키워드 검색)
        places.keywordSearch(searchTerm, (placesResult: any, placesStatus: any) => {
          console.log('Places search result:', placesStatus);

          let formattedPlacesResults: SearchAddress[] = [];

          if (placesStatus === window.kakao.maps.services.Status.OK) {
            formattedPlacesResults = placesResult.map((item: any) => ({
              address_name: item.address_name,
              road_address_name: item.road_address_name || '도로명 주소 없음',
              place_name: item.place_name,
              x: item.x,
              y: item.y,
            }));
          }

          // 주소 검색
          geocoder.addressSearch(searchTerm, (addrResult: any, addrStatus: any) => {
            console.log('Address search result:', addrStatus);

            let formattedAddrResults: SearchAddress[] = [];

            if (addrStatus === window.kakao.maps.services.Status.OK) {
              formattedAddrResults = addrResult.map((item: any) => ({
                address_name: item.address_name || '',
                road_address_name: item.road_address
                  ? item.road_address.address_name
                  : '도로명 주소 없음',
                x: item.x,
                y: item.y,
              }));
            }

            // 모든 결과 병합
            const allResults = [...formattedPlacesResults, ...formattedAddrResults];

            // 중복 제거 (좌표 기준)
            const uniqueResults: SearchAddress[] = [];
            const seenCoords = new Set();

            allResults.forEach(item => {
              const coordKey = `${item.x},${item.y}`;
              if (!seenCoords.has(coordKey)) {
                seenCoords.add(coordKey);
                uniqueResults.push(item);
              }
            });

            console.log('Final results count:', uniqueResults.length);

            // 최종 결과 설정
            setSearchResults(uniqueResults);
            setIsLoading(false);
          });
        });
      } catch (error) {
        console.error('Error during search:', error);
        setIsLoading(false);
        alert('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }, 300); // 300ms 디바운스
  };

  // 검색 결과 항목 클릭 핸들러
  const handleResultClick = (result: SearchAddress) => {
    // 선택된 주소를 가지고 Registration1 페이지로 돌아가기
    navigate('/registration/step1', {
      state: {
        selectedAddress: {
          address: result.address_name,
          roadAddress: result.road_address_name,
          place: result.place_name,
          latitude: result.y,
          longitude: result.x,
        },
      },
    });
  };

  // 키보드 엔터 검색 핸들러 (디바운스 적용)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchAddress();
    }
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
            onKeyPress={handleKeyPress}
          />
          <SearchIcon onClick={searchAddress} />

          {/* 동 검색 드롭다운 */}
          {showDongDropdown && (
            <DropdownContainer ref={dropdownRef}>
              {isDongLoading ? (
                <LoadingContainer>
                  <LoadingSpinner />
                  <LoadingText>검색 중...</LoadingText>
                </LoadingContainer>
              ) : dongResults.length > 0 ? (
                dongResults.map((address, index) => (
                  <DropdownItem key={index} onClick={() => handleDongSelect(address)}>
                    <AddressText>{address}</AddressText>
                  </DropdownItem>
                ))
              ) : (
                <NoResultsText>검색 결과가 없습니다</NoResultsText>
              )}
            </DropdownContainer>
          )}
        </SearchInputContainer>

        {isLoading && !isDongLoading && (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>{apiReady ? '주소 검색 중...' : '카카오맵 API 초기화 중...'}</LoadingText>
          </LoadingContainer>
        )}

        {!isSearched && !isLoading && (
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

        {isSearched && !isLoading && (
          <SearchResultContainer>
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <SearchResultItem key={index} onClick={() => handleResultClick(result)}>
                  <ResultMainText>
                    {result.place_name
                      ? `${result.place_name}`
                      : result.road_address_name !== '도로명 주소 없음'
                        ? result.road_address_name
                        : result.address_name}
                  </ResultMainText>
                  <ResultSubText>
                    {result.place_name
                      ? result.road_address_name !== '도로명 주소 없음'
                        ? result.road_address_name
                        : result.address_name
                      : result.address_name}
                  </ResultSubText>
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
