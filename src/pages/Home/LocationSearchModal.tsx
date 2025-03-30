import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { searchDong, getLocationId } from '../../services/api/modules/place';

// API 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LocationIdData {
  id: number;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface LocationSearchResponse extends ApiResponse<string[]> {}
type LocationIdResponse = LocationIdData[];

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
  display: flex;
  justify-content: center;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 28px;
  border-radius: 5px;
  border: 0.3px solid #000;
  padding: 0 28px 0 10px;
  font-size: 13px;
  font-family: 'Noto Sans KR', sans-serif;
  text-align: left;

  &:focus {
    outline: none;
    border-color: #3a00e5;
  }

  &::placeholder {
    color: #999;
    text-align: left;
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
  pointer-events: none;
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

// LocationInfo 인터페이스 수정
interface LocationInfo {
  formatted_address: string;
  display_name: string;
  latitude: string;
  longitude: string;
  location_id: number; // optional 제거
}

// 인터페이스 정의
interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (
    location: string,
    latitude?: string,
    longitude?: string,
    locationId?: number,
  ) => void;
}

const getCurrentLocationData = async (): Promise<LocationInfo[]> => {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;

    const response = await getLocationId(`${latitude},${longitude}`);
    const locationResponse = response as unknown as LocationIdData[];

    if (locationResponse && locationResponse.length > 0) {
      const locationData = locationResponse[0];
      return [
        {
          formatted_address: locationData.address || '현재 위치',
          display_name: locationData.address || '현재 위치',
          latitude: locationData.latitude.toString(),
          longitude: locationData.longitude.toString(),
          location_id: locationData.id,
        },
      ];
    }

    throw new Error('위치 정보를 가져오는데 실패했습니다.');
  } catch (error) {
    console.error('현재 위치 정보 가져오기 실패:', error);
    return [];
  }
};

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);

      const initializeLocations = async () => {
        try {
          const savedLocations = localStorage.getItem('recentLocationSearches');
          let recentLocations: LocationInfo[] = [];

          if (savedLocations) {
            recentLocations = JSON.parse(savedLocations);
          } else {
            // 저장된 위치가 없으면 현재 위치 정보 가져오기
            recentLocations = await getCurrentLocationData();
          }

          setSearchResults(recentLocations);
        } catch (err) {
          console.error('위치 정보 로드 오류:', err);
          setError('위치 정보를 불러올 수 없습니다.');
        } finally {
          setLoading(false);
        }
      };

      initializeLocations();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!searchTerm.trim()) {
      const savedLocations = localStorage.getItem('recentLocationSearches');
      setSearchResults(savedLocations ? JSON.parse(savedLocations) : []);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchDong(searchTerm);

      if (Array.isArray(response)) {
        const locationPromises = response.map(address => getLocationId(address));
        const locationResponses = await Promise.all(locationPromises);

        const formattedResults = locationResponses
          .map((locationResponse, index) => {
            if (
              locationResponse &&
              Array.isArray(locationResponse) &&
              locationResponse.length > 0
            ) {
              const locationData = locationResponse[0];
              return {
                formatted_address: response[index],
                display_name: response[index],
                latitude: locationData.latitude.toString(),
                longitude: locationData.longitude.toString(),
                location_id: locationData.id,
              } as LocationInfo;
            }
            return null;
          })
          .filter((result): result is LocationInfo => result !== null);

        setSearchResults(formattedResults);
      }
    } catch (error) {
      console.error('검색 오류:', error);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      handleSearch();
    }, 500); // 디바운스 시간을 500ms로 증가
  };

  const handleResultClick = (location: LocationInfo) => {
    saveRecentLocation(location);
    onSelectLocation(
      location.formatted_address,
      location.latitude,
      location.longitude,
      location.location_id,
    );
    onClose();
  };

  const saveRecentLocation = (location: LocationInfo) => {
    try {
      const savedLocations = localStorage.getItem('recentLocationSearches');
      let recentLocations: LocationInfo[] = savedLocations ? JSON.parse(savedLocations) : [];

      recentLocations = recentLocations.filter(
        loc => loc.formatted_address !== location.formatted_address,
      );

      recentLocations.unshift(location);

      if (recentLocations.length > 5) {
        recentLocations = recentLocations.slice(0, 5);
      }

      localStorage.setItem('recentLocationSearches', JSON.stringify(recentLocations));
    } catch (error) {
      console.error('최근 위치 저장 오류:', error);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
