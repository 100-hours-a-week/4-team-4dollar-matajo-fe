import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { searchDong, getLocationInfo } from '../../services/api/modules/place';
import { debounce } from 'lodash';

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
  dong: string;
  formattedAddress: string;
}

// API 응답 타입 수정
interface LocationSearchResponse {
  success: boolean;
  message: string;
  data: string[]; // 자동완성 결과 문자열 배열
}

interface LocationIdResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: number;
    latitude: number;
    longitude: number;
    dong: string;
    formattedAddress: string;
  }>;
}

// LocationItem 인터페이스 정의
interface LocationItem {
  formatted_address: string;
  display_name: string;
  latitude: string;
  longitude: string;
  location_id: number;
}

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

// 모달 프롭스 정의
interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (
    address: string,
    latitude?: string,
    longitude?: string,
    locationId?: number,
  ) => void;
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [recentLocations, setRecentLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 모달이 열릴 때 최근 위치 정보 로드
  useEffect(() => {
    if (isOpen) {
      try {
        // 저장된 최근 위치 정보 불러오기
        const savedLocations = localStorage.getItem('recentLocations');
        if (savedLocations) {
          setRecentLocations(JSON.parse(savedLocations));
          setSearchResults(JSON.parse(savedLocations));
        } else {
          setRecentLocations([]);
          setSearchResults([]);
        }

        // 검색 입력란에 포커스
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      } catch (err) {
        console.error('위치 정보 로드 오류:', err);
        setError('위치 정보를 불러올 수 없습니다.');
      }
    }
  }, [isOpen]);

  // 검색 함수
  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      const savedLocations = localStorage.getItem('recentLocations');
      setSearchResults(savedLocations ? JSON.parse(savedLocations) : []);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchDong(term);

      if (Array.isArray(results) && results.length > 0) {
        // 주소 문자열을 LocationItem 형식으로 변환
        const formattedResults = results.map(address => ({
          formatted_address: address,
          display_name: address,
          latitude: '',
          longitude: '',
          location_id: 0,
        }));

        setSearchResults(formattedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('검색 오류:', error);
      setError('검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 디바운스된 검색 함수
  const debouncedSearch = useCallback(
    debounce((term: string) => handleSearch(term), 300),
    [],
  );

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      debouncedSearch(value);
    } else if (value.length === 0) {
      // 입력값이 없으면 최근 검색 결과 표시
      const savedLocations = localStorage.getItem('recentLocations');
      setSearchResults(savedLocations ? JSON.parse(savedLocations) : []);
    }
  };

  // 검색 결과 선택 핸들러
  const handleResultClick = async (result: LocationItem) => {
    setLoading(true);
    try {
      // 주소에서 동/읍/리 단위까지만 추출
      const addressParts = result.formatted_address.split(' ');
      // 시/도, 시/군/구, 읍/면/동까지만 포함 (최대 3개 파트)
      const shortAddress = addressParts.slice(0, Math.min(3, addressParts.length)).join(' ');

      // 저장된 위치 정보가 있는지 확인
      if (result.location_id && result.latitude && result.longitude) {
        // 이미 완전한 정보가 있으면 바로 선택
        // 단, 간소화된 주소 사용
        const updatedResult = {
          ...result,
          formatted_address: shortAddress,
          display_name: shortAddress,
        };
        saveRecentLocation(updatedResult);
        onSelectLocation(shortAddress, result.latitude, result.longitude, result.location_id);
        onClose();
        return;
      }

      // 1. 위치 ID 조회
      const locationResponse = await getLocationInfo(shortAddress);
      console.log('위치 정보 조회 결과:', locationResponse);

      let locationId;
      let latitude;
      let longitude;

      if (locationResponse?.success && locationResponse.data?.length > 0) {
        locationId = locationResponse.data[0].id;
        latitude = locationResponse.data[0].latitude?.toString();
        longitude = locationResponse.data[0].longitude?.toString();
        console.log('위치 ID 및 좌표 정보:', { locationId, latitude, longitude });

        // 최근 위치에 저장
        const newLocation: LocationItem = {
          formatted_address: shortAddress,
          display_name: shortAddress,
          latitude: latitude || '',
          longitude: longitude || '',
          location_id: locationId,
        };
        saveRecentLocation(newLocation);

        // 2. 선택한 위치 정보 전달 (locationId 포함)
        onSelectLocation(shortAddress, latitude, longitude, locationId);
      } else {
        // API 응답이 없거나 에러인 경우 기본 정보만 전달
        onSelectLocation(shortAddress);
      }

      onClose();
    } catch (error) {
      console.error('위치 선택 중 오류 발생:', error);
      // 에러가 발생해도 기본 정보는 전달
      const addressParts = result.formatted_address.split(' ');
      const shortAddress = addressParts.slice(0, Math.min(3, addressParts.length)).join(' ');
      onSelectLocation(shortAddress);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // 최근 위치 ID 업데이트 함수
  const updateRecentLocationId = (location: LocationItem) => {
    try {
      const savedLocations = localStorage.getItem('recentLocations');
      if (!savedLocations) return;

      let recentLocations: LocationItem[] = JSON.parse(savedLocations);

      // 해당 위치 항목 찾아서 ID 업데이트
      const updatedLocations = recentLocations.map(loc => {
        if (loc.formatted_address === location.formatted_address) {
          return { ...loc, location_id: location.location_id };
        }
        return loc;
      });

      localStorage.setItem('recentLocations', JSON.stringify(updatedLocations));
      setRecentLocations(updatedLocations);
    } catch (error) {
      console.error('위치 ID 업데이트 오류:', error);
    }
  };

  // 최근 위치 저장 함수
  const saveRecentLocation = (location: LocationItem) => {
    try {
      const savedLocations = localStorage.getItem('recentLocations');
      let recentLocations: LocationItem[] = savedLocations ? JSON.parse(savedLocations) : [];

      // 중복 제거
      recentLocations = recentLocations.filter(
        loc => loc.formatted_address !== location.formatted_address,
      );

      // 새 위치를 배열 앞에 추가
      recentLocations.unshift(location);

      // 최대 3개만 유지
      if (recentLocations.length > 3) {
        recentLocations = recentLocations.slice(0, 3);
      }

      localStorage.setItem('recentLocations', JSON.stringify(recentLocations));
      setRecentLocations(recentLocations);
    } catch (error) {
      console.error('최근 위치 저장 오류:', error);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 키 입력 핸들러
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      debouncedSearch(searchTerm);
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
