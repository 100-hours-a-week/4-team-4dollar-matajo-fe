import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { LocationInfo } from '../../services/LocationService';

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
  background-color: #f8f8f8;
  cursor: pointer;

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

// Kakao 전역 타입 정의
declare global {
  interface Window {
    kakao: any;
    daum: any;
  }
}

// 검색 주소 컴포넌트 인터페이스 정의
interface SearchAddressProps {
  onSelectLocation: (location: string, lat?: string, lng?: string) => void;
  recentLocations?: LocationInfo[];
}

const SearchAddress: React.FC<SearchAddressProps> = ({
  onSelectLocation,
  recentLocations = [],
}) => {
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 다음 우편번호 검색 열기
  const openDaumPostcode = () => {
    console.log('다음 우편번호 검색 열기');

    // 다음 우편번호 검색 스크립트가 로드되었는지 확인
    if (!window.daum || !window.daum.Postcode) {
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => {
        // 스크립트 로드 후 우편번호 검색 실행
        openDaumAddressSearch();
      };
      document.head.appendChild(script);
    } else {
      openDaumAddressSearch();
    }
  };

  // 다음 주소 검색 팝업 열기
  const openDaumAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data: any) {
        console.log('선택한 주소 데이터:', data);

        // 전체 주소 구성
        let fullAddress = data.address;
        let extraAddress = '';

        // 법정동이 있을 경우 추가
        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
          extraAddress += data.bname;
        }

        // 건물명이 있고, 공동주택일 경우 추가
        if (data.buildingName !== '' && data.apartment === 'Y') {
          extraAddress += extraAddress !== '' ? ', ' + data.buildingName : data.buildingName;
        }

        // 조합형 주소 완성
        if (extraAddress !== '') {
          fullAddress += ' (' + extraAddress + ')';
        }

        // 상태 업데이트
        setSelectedAddress(fullAddress);

        // 좌표 정보 없이 주소만 전달
        onSelectLocation(fullAddress);

        // 이전 페이지로 돌아가기
        navigate(-1);
      },
      width: '100%',
      height: '100%',
      maxSuggestItems: 5,
    }).open();
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(-1);
  };

  // 입력창 클릭 시 바로 다음 우편번호 검색 열기
  const handleInputClick = () => {
    openDaumPostcode();
  };

  return (
    <>
      <Header title="주소 검색" showBackButton={true} onBack={handleBack} />

      <Container>
        <SearchInputContainer>
          <SearchInput
            ref={searchInputRef}
            type="text"
            placeholder="주소를 검색하려면 클릭하세요"
            value={selectedAddress}
            onClick={handleInputClick}
            readOnly
          />
          <SearchIcon onClick={openDaumPostcode} />
        </SearchInputContainer>

        {!selectedAddress && (
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
          </SearchHelpSection>
        )}
      </Container>
    </>
  );
};

export default SearchAddress;
