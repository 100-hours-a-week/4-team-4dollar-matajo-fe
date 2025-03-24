import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { loadDongDataFromCSV, searchDongData } from '../../utils/csvUtils';

// CSV 유틸에서 가져온 타입과 충돌을 피하기 위한 별칭 사용
import type { DongData as DongDataType } from '../../utils/csvUtils';

// 백엔드 API 호출 함수 (주석처리 상태)
// import { searchLocations } from '../../api/location';

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
  width: 85%; /* 모달의 85%로 수정 */
  margin: 0 auto 20px auto; /* 상하 여백 0, 좌우 auto로 중앙 정렬 */
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
  padding: 10px 16px; /* 패딩 좌우 추가 */
  border-bottom: 0.5px solid #b6b6b6;
  font-size: 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  line-height: 14.09px;
  color: #6f6f6f;
  cursor: pointer;
  /* 텍스트는 왼쪽 정렬 */
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

// "동"으로 끝나는 한글자 동 목록
const SINGLE_CHAR_DONGS = [
  '화동',
  '재동',
  '계동',
  '묘동',
  '평동',
  '다동',
  '초동',
  '정동',
  '능동',
  '묵동',
  '번동',
  '창동',
  '합동',
  '중동',
  '목동',
  '궁동',
  '항동',
  '본동',
  '길동',
  '우동',
  '좌동',
  '선동',
  '서동',
  '수동',
  '전동',
  '교동',
  '도동',
  '부동',
  '내동',
  '상동',
  '파동',
  '성동',
  '장동',
  '사동',
  '답동',
  '유동',
  '경동',
  '용동',
  '남동',
  '금동',
  '학동',
  '양동',
  '구동',
  '북동',
  '임동',
  '옥동',
  '신동',
  '왕동',
  '원동',
  '인동',
  '효동',
  '천동',
  '대동',
  '추동',
  '직동',
  '오동',
  '호동',
  '변동',
  '세동',
  '방동',
  '갑동',
  '죽동',
  '와동',
  '법동',
  '동동',
  '달동',
  '탑동',
  '영동',
  '지동',
  '하동',
  '율동',
  '작동',
  '일동',
  '이동',
  '풍동',
  '궐동',
  '포동',
  '당동',
  '삼동',
  '송동',
  '역동',
  '명동',
  '마동',
  '순동',
  '국동',
  '행동',
  '청동',
  '시동',
  '덕동',
  '배동',
  '봉동',
  '외동',
  '현동',
  '석동',
  '두동',
  '강동',
  '안동',
  '연동',
  '저동',
  '혈동',
  '통동',
];

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

      // 백엔드 API 호출 (주석 처리)
      /* 
      searchLocations('')
        .then(data => {
          setDongData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('위치 데이터 로드 오류:', error);
          setLoading(false);
        });
      */

      // CSV 파일에서 동 데이터 로드 (임시 방식)
      loadDongDataFromCSV('public/data/korea_dong_coordinates.csv')
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
              {
                original_name: '송파구 잠실동',
                display_name: '잠실동, 송파구, 서울특별시, 대한민국',
                latitude: '37.5089',
                longitude: '127.0865',
              },
              {
                original_name: '강동구 천호동',
                display_name: '천호동, 강동구, 서울특별시, 대한민국',
                latitude: '37.5451',
                longitude: '127.1272',
              },
              {
                original_name: '관악구 신림동',
                display_name: '신림동, 관악구, 서울특별시, 대한민국',
                latitude: '37.4859',
                longitude: '126.9289',
              },
              {
                original_name: '종로구 종로1가',
                display_name: '종로1가, 종로구, 서울특별시, 대한민국',
                latitude: '37.5704',
                longitude: '126.9931',
              },
              {
                original_name: '중구 명동',
                display_name: '명동, 중구, 서울특별시, 대한민국',
                latitude: '37.5631',
                longitude: '126.9847',
              },
              {
                original_name: '용산구 이태원동',
                display_name: '이태원동, 용산구, 서울특별시, 대한민국',
                latitude: '37.5345',
                longitude: '126.9936',
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
                original_name: '종로구 명동',
                display_name: '명동, 중구, 서울특별시, 대한민국',
                latitude: '37.5631',
                longitude: '126.9847',
              },
              {
                original_name: '서울시 중구',
                display_name: '중구, 서울특별시, 대한민국',
                latitude: '37.5641',
                longitude: '126.9979',
              },
              {
                original_name: '경기도 수원시',
                display_name: '수원시, 경기도, 대한민국',
                latitude: '37.2636',
                longitude: '127.0286',
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

    // 백엔드 API 호출 코드 (주석 처리)
    /*
    if (value.trim()) {
      setLoading(true);
      searchLocations(value)
        .then(data => {
          setSearchResults(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('검색 오류:', error);
          setLoading(false);
        });
    } else {
      setSearchResults(recentSearches);
    }
    */

    // CSV 기반 검색 (임시 방식)
    if (value.trim()) {
      // 검색어 길이가 1자인 경우
      if (value.length === 1) {
        // 한글자 동 목록에서 시작하는 항목 필터링
        const singleCharResults = SINGLE_CHAR_DONGS.filter(dong => dong.startsWith(value)).map(
          dong => {
            // 한글자 동의 경우 원래 형식을 맞춤
            const formattedAddress = `서울특별시 중구 ${dong}`;
            return {
              formatted_address: formattedAddress,
              display_name: `${dong}, 중구, 서울특별시, 대한민국`,
              latitude: '37.5631',
              longitude: '126.9847',
            };
          },
        );

        // 동 데이터에서 시/도/구 등 필터링 (1자 검색어)
        const locationResults = dongData
          .filter(
            item =>
              (item.original_name.includes('시') && item.original_name.includes(value)) ||
              (item.original_name.includes('도') && item.original_name.includes(value)) ||
              (item.original_name.includes('구') && item.original_name.includes(value)),
          )
          .map(item => ({
            formatted_address: item.original_name, // original_name을 formatted_address로 사용
            display_name: item.display_name,
            latitude: item.latitude,
            longitude: item.longitude,
          }));

        // 결과 합치기
        setSearchResults([...singleCharResults, ...locationResults].slice(0, 100));
      } else {
        // 2자 이상인 경우 display_name을 기준으로 검색
        const filteredResults = dongData
          .filter(item => item.display_name.includes(value))
          .map(item => ({
            formatted_address: item.original_name, // original_name을 formatted_address로 사용
            display_name: item.display_name,
            latitude: item.latitude,
            longitude: item.longitude,
          }));

        // 결과 수가 적을 경우 최대 100개만 표시
        setSearchResults(filteredResults.slice(0, 100));
      }
    } else {
      // 검색어가 없을 경우 최근 검색 목록 표시
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
