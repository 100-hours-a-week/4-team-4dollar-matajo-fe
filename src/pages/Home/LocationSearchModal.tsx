import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { loadDongDataFromCSV, searchDongData } from '../../utils/csvUtils';

// CSV 유틸에서 가져온 타입과 충돌을 피하기 위한 별칭 사용
import type { DongData as DongDataType } from '../../utils/csvUtils';

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

// 스타일 컴포넌트
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

// 인터페이스 정의
interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: string, latitude?: string, longitude?: string) => void;
}

// 위치 정보 인터페이스
interface LocationItem {
  formatted_address: string;
  display_name: string;
  latitude: string;
  longitude: string;
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [dongData, setDongData] = useState<DongDataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 최근 검색한 지역 목록 (로컬 스토리지에서 가져오거나 기본값 사용)
  const [recentSearches, setRecentSearches] = useState<LocationItem[]>(() => {
    const saved = localStorage.getItem('recentLocationSearches');
    return saved
      ? JSON.parse(saved)
      : [
          {
            formatted_address: '영등포구 여의도동',
            display_name: '여의도동, 영등포구, 서울특별시, 대한민국',
            latitude: '37.5249',
            longitude: '126.9214',
          },
          {
            formatted_address: '마포구 서교동',
            display_name: '서교동, 마포구, 서울특별시, 대한민국',
            latitude: '37.5531',
            longitude: '126.9194',
          },
          {
            formatted_address: '강남구 역삼동',
            display_name: '역삼동, 강남구, 서울특별시, 대한민국',
            latitude: '37.5025',
            longitude: '127.0259',
          },
          {
            formatted_address: '성동구 성수동',
            display_name: '성수동, 성동구, 서울특별시, 대한민국',
            latitude: '37.5436',
            longitude: '127.0558',
          },
        ];
  });

  // 동 데이터 로드
  useEffect(() => {
    // 데이터 로드는 모달이 열릴 때만 수행
    if (isOpen && dongData.length === 0) {
      setLoading(true);

      // CSV 파일에서 동 데이터 로드
      loadDongDataFromCSV('/data/korea_dong_coordinates.csv')
        .then(data => {
          if (data.length > 0) {
            setDongData(data);
          } else {
            // CSV 로드 실패 시 기본 데이터 사용
            const mockDongData: DongDataType[] = [
              {
                original_name: '영등포구 여의도동',
                display_name: '여의도동, 영등포구, 서울특별시, 대한민국',
                latitude: '37.5249',
                longitude: '126.9214',
              },
              {
                original_name: '마포구 서교동',
                display_name: '서교동, 마포구, 서울특별시, 대한민국',
                latitude: '37.5531',
                longitude: '126.9194',
              },
              {
                original_name: '강남구 역삼동',
                display_name: '역삼동, 강남구, 서울특별시, 대한민국',
                latitude: '37.5025',
                longitude: '127.0259',
              },
              {
                original_name: '성동구 성수동',
                display_name: '성수동, 성동구, 서울특별시, 대한민국',
                latitude: '37.5436',
                longitude: '127.0558',
              },
              // 한글자 동 예시
              {
                original_name: '종로구 교동',
                display_name: '교동, 종로구, 서울특별시, 대한민국',
                latitude: '37.5764',
                longitude: '126.9832',
              },
              {
                original_name: '중구 정동',
                display_name: '정동, 중구, 서울특별시, 대한민국',
                latitude: '37.5658',
                longitude: '126.9727',
              },
              {
                original_name: '중구 명동',
                display_name: '명동, 중구, 서울특별시, 대한민국',
                latitude: '37.5631',
                longitude: '126.9847',
              },
            ];
            setDongData(mockDongData);
          }
        })
        .catch(error => {
          console.error('동 데이터 로드 오류:', error);
          // 오류 발생 시 기본 데이터 사용
          const mockDongData: DongDataType[] = [
            {
              original_name: '영등포구 여의도동',
              display_name: '여의도동, 영등포구, 서울특별시, 대한민국',
              latitude: '37.5249',
              longitude: '126.9214',
            },
            {
              original_name: '마포구 서교동',
              display_name: '서교동, 마포구, 서울특별시, 대한민국',
              latitude: '37.5531',
              longitude: '126.9194',
            },
            {
              original_name: '강남구 역삼동',
              display_name: '역삼동, 강남구, 서울특별시, 대한민국',
              latitude: '37.5025',
              longitude: '127.0259',
            },
            {
              original_name: '성동구 성수동',
              display_name: '성수동, 성동구, 서울특별시, 대한민국',
              latitude: '37.5436',
              longitude: '127.0558',
            },
          ];
          setDongData(mockDongData);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, dongData.length]);

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      // `display_name`을 기준으로 검색
      const filteredResults = dongData
        .filter(item => item.display_name.toLowerCase().includes(value.toLowerCase()))
        .map(item => ({
          formatted_address: item.original_name, // 검색 결과에서는 `formatted_address`(=original_name) 사용
          display_name: item.display_name, // 검색은 `display_name` 기준으로
          latitude: item.latitude,
          longitude: item.longitude,
        }));

      setSearchResults(filteredResults.slice(0, 100));
    } else {
      setSearchResults(recentSearches);
    }
  };

  // 검색 결과 아이템 클릭 핸들러
  const handleResultClick = (location: LocationItem) => {
    // 최근 검색 목록 업데이트 (중복 제거 및 최대 5개 유지)
    const updatedRecentSearches = [
      location,
      ...recentSearches.filter(item => item.formatted_address !== location.formatted_address),
    ].slice(0, 5);

    setRecentSearches(updatedRecentSearches);

    // 로컬 스토리지에 저장
    localStorage.setItem('recentLocationSearches', JSON.stringify(updatedRecentSearches));

    // 선택한 위치 전달 (formatted_address, latitude, longitude)
    onSelectLocation(location.formatted_address, location.latitude, location.longitude);
    onClose();
  };

  // 배경 클릭 시 모달 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 모달이 열릴 때 검색 입력란에 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // 모달이 열릴 때 최근 검색 목록 표시
      setSearchResults(recentSearches);
    }
  }, [isOpen, recentSearches]);

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
            <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
          ) : (
            <SearchResultList>
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <SearchResultItem key={index} onClick={() => handleResultClick(result)}>
                    {result.formatted_address} {/* 검색 결과에서는 `formatted_address` 표시 */}
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
