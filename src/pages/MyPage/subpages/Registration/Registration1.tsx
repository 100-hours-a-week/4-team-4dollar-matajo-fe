import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../../../components/layout/Header';
import BottomNavigation from '../../../../components/layout/BottomNavigation';
import Modal from '../../../../components/common/Modal';
import Toast from '../../../../components/common/Toast';
import { DaumAddressData, autoConvertAddress } from '../../../../utils/api/kakaoToDaum';
import { transformKeysToCamel } from '../../../../utils/dataTransformers';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#5E5CFD',
  background: '#F5F5FF',
  lightGray: '#EFEFEF',
  darkText: '#464646',
  redText: '#FF5050',
  grayText: '#6F6F6F',
  borderColor: '#E0E0E0',
  white: '#FFFFFF',
};

// 전체 페이지 레이아웃 컨테이너
const RegistrationContainer = styled.div`
  width: 100%;
  max-width: 375px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #f5f5ff;
  padding: 0;
  position: relative;
`;

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 375px;
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 136px; /* 하단 네비게이션 높이만큼 마진 */
  padding-top: 47px; /* 헤더 높이만큼 패딩 */
`;

// 프로그레스 바 컨테이너
const ProgressContainer = styled.div`
  margin: 20px 22px;
  position: relative;
`;

// 프로그레스 배경
const ProgressBackground = styled.div`
  width: 332px;
  height: 12px;
  background: ${THEME.lightGray};
  border-radius: 7px;
`;

// 프로그레스 완료 부분
const ProgressFill = styled.div`
  width: 111px; /* 1/3 진행 */
  height: 12px;
  background: ${THEME.primary};
  border-top-left-radius: 7px;
  border-bottom-left-radius: 7px;
`;

// 프로그레스 텍스트
const ProgressText = styled.span`
  position: absolute;
  right: 0;
  top: -15px;
  color: ${THEME.primary};
  font-size: 10px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  letter-spacing: 0.25px;
`;

// 폼 컨테이너
const FormContainer = styled.div`
  padding: 0 10px;
  margin-top: 30px;
`;

// 입력 필드 레이블
const InputLabel = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
  color: ${THEME.grayText};
`;

// 필수 표시 (*)
const RequiredMark = styled.span`
  color: ${THEME.redText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.01px;
`;

// 입력 필드
const InputField = styled.input<{
  isError?: boolean;
  isFocused?: boolean;
  readOnly?: boolean;
  hasValue?: boolean;
}>`
  width: 321px;
  height: 40px;
  border-radius: 15px;
  border: 0.5px solid
    ${props => {
      if (props.isError) return THEME.redText;
      if (props.isFocused) return THEME.primary;
      return THEME.grayText;
    }};
  padding: 0 15px;
  margin-bottom: 18px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  background-color: ${props => (props.readOnly ? '#F5F5F5' : 'white')};
  cursor: ${props => (props.readOnly ? 'pointer' : 'text')};
  color: ${props => (props.hasValue ? '#000000' : '#9e9e9e')};
  &:focus {
    outline: none;
    border-color: ${props => (props.isError ? THEME.redText : THEME.primary)};
  }
`;

// 주소 검색 버튼
const AddressSearchButton = styled.div`
  position: absolute;
  right: 25px;
  margin-top: -58px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &::before {
    content: '🔍';
    font-size: 20px;
  }
`;

// 헬퍼 텍스트
const HelperText = styled.div<{ visible?: boolean }>`
  color: ${THEME.redText};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 350;
  letter-spacing: 0.01px;
  margin-bottom: 3px;
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
  height: ${props => (props.visible ? 'auto' : '0')};
  margin-bottom: ${props => (props.visible ? '3px' : '0')};
  transition:
    visibility 0.2s,
    height 0.2s,
    margin-bottom 0.2s;
`;

// 텍스트 영역
const TextArea = styled.textarea<{ isError?: boolean; isFocused?: boolean }>`
  width: 321px;
  height: 171px;
  border-radius: 15px;
  border: 0.5px solid
    ${props => {
      if (props.isError) return THEME.redText;
      if (props.isFocused) return THEME.primary;
      return THEME.grayText;
    }};
  padding: 15px;
  margin-bottom: 18px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  resize: none;
  &:focus {
    outline: none;
    border-color: ${props => (props.isError ? THEME.redText : THEME.primary)};
  }
`;

// 다음 버튼
const NextButton = styled.button`
  width: 349px;
  height: 47px;
  position: absolute;
  left: 13px;
  bottom: 90px;
  background: ${THEME.primary};
  border-radius: 15px;
  border: none;
  color: ${THEME.white};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
  cursor: pointer;
`;

// 로딩 오버레이
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid ${THEME.lightGray};
  border-top: 5px solid ${THEME.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// 폼 데이터 타입 정의
interface FormData {
  postAddress: string;
  postTitle: string;
  postContent: string;
  preferPrice: string;
  postAddressData?: DaumAddressData; // Daum 주소 데이터 추가
}

// 오류 상태 타입 정의
interface ErrorState {
  postAddress: string;
  postTitle: string;
  postContent: string;
  preferPrice: string;
}

// 주소 정보 타입 정의
interface AddressInfo {
  address: string;
  roadAddress: string;
  place?: string;
  latitude: string;
  longitude: string;
}

// daum 전역 타입 정의 추가
declare global {
  interface Window {
    daum: any;
  }
}

const Registration1: React.FC = () => {
  // 라우터 관련 훅
  const navigate = useNavigate();
  const location = useLocation();

  // 폼 상태 관리
  const [formData, setFormData] = useState<FormData>({
    postAddress: '',
    postTitle: '',
    postContent: '',
    preferPrice: '',
  });

  // 에러 상태 관리
  const [errors, setErrors] = useState<ErrorState>({
    postAddress: '',
    postTitle: '',
    postContent: '',
    preferPrice: '',
  });

  // 포커스 상태 관리
  const [focused, setFocused] = useState<Record<string, boolean>>({
    postAddress: false,
    postTitle: false,
    postContent: false,
    preferPrice: false,
  });

  // 백 버튼 모달 상태
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);

  // 주소 검색 상태
  const [isAddressSearchActive, setIsAddressSearchActive] = useState(false);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 토스트 상태
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 글자수 제한
  const DESCRIPTION_MAX_LENGTH = 15;
  const DETAILS_MAX_LENGTH = 500;

  // 다음 우편번호 검색 열기
  const openDaumPostcode = () => {
    console.log('다음 우편번호 검색 열기');

    // 이미 검색 중이면 중복 실행 방지
    if (isAddressSearchActive) {
      console.log('이미 주소 검색이 진행 중입니다.');
      return;
    }

    // 이미 다음 우편번호 검색이 진행 중인지 확인
    if (document.getElementById('daum_postcode_iframe')) {
      console.log('이미 다음 우편번호 검색이 열려있습니다.');
      return;
    }

    // 검색 활성화 상태로 설정
    setIsAddressSearchActive(true);

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
    try {
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

          // 폼 데이터에 주소 정보 업데이트
          setFormData(prev => ({
            ...prev,
            postAddress: fullAddress,
          }));

          // 주소 필드의 에러 초기화
          setErrors(prev => ({ ...prev, postAddress: '' }));

          // 다음 주소 API 호출하여 상세 주소 데이터 가져오기
          processAddress(fullAddress, data);

          // 주소 검색 비활성화 상태로 설정
          setIsAddressSearchActive(false);

          // iframe 제거 시도
          cleanupPostcodeElement();
        },
        onclose: function () {
          // 창이 닫힐 때도 검색 비활성화
          setIsAddressSearchActive(false);

          // iframe 제거 시도
          cleanupPostcodeElement();
        },
        width: '100%',
        height: '100%',
        maxSuggestItems: 5,
        autoClose: true,
      }).open();
    } catch (error) {
      console.error('다음 주소 검색 오류:', error);
      showToast('주소 검색 실행 중 오류가 발생했습니다.');
      setIsAddressSearchActive(false);
    }
  };

  // Postcode iframe 제거 함수
  const cleanupPostcodeElement = () => {
    try {
      // iframe 요소 찾기
      const iframe = document.getElementById('daum_postcode_iframe');
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }

      // 레이어 요소 찾기 (iframe의 부모 요소일 수 있음)
      const layers = document.querySelectorAll('.layer');
      layers.forEach(layer => {
        if (layer.parentNode) {
          layer.parentNode.removeChild(layer);
        }
      });
    } catch (e) {
      console.error('주소 검색창 요소 제거 오류:', e);
    }
  };

  // 주소 처리 함수 - API 호출 없이 바로 데이터 사용
  const processAddress = async (address: string, directData?: any) => {
    setIsLoading(true);
    try {
      console.log('주소 데이터 처리 시작...');

      let daumAddressData: DaumAddressData;

      if (directData) {
        // 직접 받은 데이터가 있으면 바로 사용
        console.log('직접 받은 주소 데이터 사용:', directData);
        daumAddressData = directData;
      } else {
        // 없으면 API 호출
        console.log('Daum 주소 API 호출 시작...');
        daumAddressData = await autoConvertAddress(address);
        console.log('Daum 주소 API 응답 데이터:', daumAddressData);
      }

      // 폼 데이터에 Daum 주소 데이터 업데이트
      setFormData(prev => ({
        ...prev,
        postAddress: address,
        postAddressData: daumAddressData,
      }));

      // 로컬 스토리지에 업데이트된 데이터 저장
      const savedData = localStorage.getItem('registration_step1');
      const updatedData = {
        ...JSON.parse(savedData || '{}'),
        postAddress: address,
        postAddressData: daumAddressData,
      };
      localStorage.setItem('registration_step1', JSON.stringify(updatedData));

      showToast('주소가 설정되었습니다.');

      // 주소 검색 비활성화 상태로 설정
      setIsAddressSearchActive(false);

      // 검색창 요소 정리
      cleanupPostcodeElement();
    } catch (error) {
      console.error('주소 데이터 처리 실패:', error);
      showToast('주소 데이터 처리에 실패했습니다. 다시 시도해주세요.');
      setIsAddressSearchActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 폼 데이터 불러오기 (로컬 스토리지) 및 주소 데이터 처리
  useEffect(() => {
    // 로컬 스토리지에서 저장된 데이터 불러오기
    const savedData = localStorage.getItem('registration_step1');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }

    // location.state에서 주소 데이터 확인
    if (location.state && location.state.selectedAddress) {
      const selectedAddress = location.state.selectedAddress as AddressInfo;
      setIsLoading(true);

      // 비동기 함수를 별도로 정의하고 즉시 호출
      const processAddressData = async () => {
        try {
          console.log('Daum 주소 API 호출 시작...');

          // 다음 주소 API 호출하여 상세 주소 데이터 가져오기
          const daumAddressData = await autoConvertAddress(selectedAddress.address);

          console.log('Daum 주소 API 응답 데이터:', daumAddressData);

          // 폼 데이터에 주소 정보 및 Daum 주소 데이터 업데이트
          setFormData(prev => ({
            ...prev,
            postAddress: selectedAddress.address,
            postAddressData: daumAddressData,
          }));

          // 주소 필드의 에러 초기화
          setErrors(prev => ({ ...prev, postAddress: '' }));

          // 로컬 스토리지에 업데이트된 데이터 저장
          const updatedData = {
            ...JSON.parse(savedData || '{}'),
            postAddress: selectedAddress.address,
            postAddressData: daumAddressData,
          };
          localStorage.setItem('registration_step1', JSON.stringify(updatedData));

          showToast('주소 데이터가 변환되었습니다.');
        } catch (error) {
          console.error('주소 데이터 변환 실패:', error);
          showToast('주소 데이터 변환에 실패했습니다. 다시 시도해주세요.');

          // 주소만 업데이트
          setFormData(prev => ({
            ...prev,
            postAddress: selectedAddress.address,
          }));
        } finally {
          setIsLoading(false);
        }
      };

      // 비동기 함수 호출
      processAddressData();
    }
  }, [location.state]);

  // 토스트 메시지 표시 함수
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // 입력 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // 글자수 제한 처리
    if (name === 'postTitle' && value.length > DESCRIPTION_MAX_LENGTH) {
      return;
    }

    if (name === 'postContent' && value.length > DETAILS_MAX_LENGTH) {
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // 입력 시 해당 필드의 에러 메시지 초기화
    setErrors(prev => ({ ...prev, [name]: '' }));

    // 로컬 스토리지에 데이터 저장 (자동 저장)
    localStorage.setItem(
      'registration_step1',
      JSON.stringify({
        ...formData,
        [name]: value,
      }),
    );
  };

  // 포커스 핸들러
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setFocused(prev => ({ ...prev, [name]: true }));
  };

  // 블러 핸들러
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setFocused(prev => ({ ...prev, [name]: false }));
  };

  // 유효성 검사 함수
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      postAddress: '',
      postTitle: '',
      postContent: '',
      preferPrice: '',
    };

    // 주소 검사
    if (!formData.postAddress?.trim()) {
      newErrors.postAddress = '주소를 입력해주세요.';
      isValid = false;
    }

    // 설명 검사
    if (!formData.postTitle?.trim()) {
      newErrors.postTitle = '공간 한줄 소개를 입력해주세요.';
      isValid = false;
    } else if (formData.postTitle?.length > DESCRIPTION_MAX_LENGTH) {
      newErrors.postTitle = `최대 ${DESCRIPTION_MAX_LENGTH}자까지 입력 가능합니다.`;
      isValid = false;
    }

    // 상세 내용 검사 (필수 항목)
    if (!formData.postContent?.trim()) {
      newErrors.postContent = '내용을 입력해주세요.';
      isValid = false;
    } else if (formData.postContent?.length > DETAILS_MAX_LENGTH) {
      newErrors.postContent = `최대 ${DETAILS_MAX_LENGTH}자까지 입력 가능합니다.`;
      isValid = false;
    }

    // 가격 검사
    if (!formData.preferPrice?.trim()) {
      newErrors.preferPrice = '가격을 입력해주세요.';
      isValid = false;
    } else if (isNaN(Number(formData.preferPrice)) || Number(formData.preferPrice) <= 0) {
      newErrors.preferPrice = '유효한 가격을 입력해주세요.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    // 입력 데이터가 있는지 확인
    const hasData = Object.values(formData).some(value =>
      typeof value === 'string' ? value.trim() !== '' : true,
    );

    if (hasData) {
      // 데이터가 있으면 모달 표시
      setIsBackModalOpen(true);
    } else {
      // 데이터가 없으면 바로 이전 페이지로
      navigate('/');
    }
  };

  // 모달 확인 버튼 핸들러 (나가기)
  const handleConfirmExit = () => {
    // 로컬 스토리지 데이터 삭제
    localStorage.removeItem('registration_step1');
    localStorage.removeItem('registration_step2');
    localStorage.removeItem('registration_step3');
    navigate(-1);
  };

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    // 유효성 검사
    if (!validateForm()) {
      showToast('필수 입력 항목을 확인해주세요.');
      return;
    }

    try {
      // Daum 주소 데이터가 없는 경우 API 호출하여 가져오기
      if (!formData.postAddressData) {
        setIsLoading(true);
        console.log('주소 데이터 변환 시도...');
        const addressData = await autoConvertAddress(formData.postAddress);

        // 주소 데이터 업데이트
        const updatedFormData = {
          ...formData,
          postAddressData: addressData,
        };

        // 상태 및 로컬 스토리지 업데이트
        setFormData(updatedFormData);
        localStorage.setItem('registration_step1', JSON.stringify(updatedFormData));

        // 다음 단계로 이동
        console.log('다음 단계로 이동', updatedFormData);
        navigate('/mypage/registration/step2', { state: updatedFormData });
      } else {
        // 카멜케이스 유지 (스네이크 케이스 변환 제거)
        const apiReadyData = transformKeysToCamel({
          ...formData,
          preferPrice: parseInt(formData.preferPrice),
        });

        console.log('API 전송 준비된 데이터:', apiReadyData);

        // 이미 주소 데이터가 있으면 바로 다음 단계로 이동
        console.log('다음 단계로 이동', apiReadyData);
        navigate('/mypage/registration/step2', { state: apiReadyData });
      }
    } catch (error) {
      console.error('주소 데이터 처리 또는 이동 중 오류:', error);
      showToast('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 내용 컴포넌트
  const backModalContent = (
    <>
      <div style={{ fontSize: '24px', textAlign: 'center', marginBottom: '10px' }}>😮</div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ color: '#1e1e1e', fontSize: '18px', fontWeight: 700 }}>
          페이지에서 나가시나요?
        </span>
        <br />
        <br />
        <span style={{ color: 'black', fontSize: '14px' }}>진행상황은 저장되지 않습니다.</span>
      </div>
    </>
  );

  // 주소 필드 클릭 핸들러 - 직접 다음 우편번호 API 호출
  const handleAddressClick = () => {
    openDaumPostcode();
  };

  return (
    <>
      {/* 뒤로가기 모달 */}
      <Modal
        isOpen={isBackModalOpen}
        onClose={() => setIsBackModalOpen(false)}
        content={backModalContent}
        cancelText="취소"
        confirmText="나가기"
        onCancel={() => setIsBackModalOpen(false)}
        onConfirm={handleConfirmExit}
      />

      {/* 상단 헤더 */}
      <Header title="보관소 등록" showBackButton={true} onBack={handleBack} />

      <RegistrationContainer>
        <Container>
          {/* 프로그레스 바 */}
          <ProgressContainer>
            <ProgressBackground>
              <ProgressFill />
            </ProgressBackground>
            <ProgressText>1/3</ProgressText>
          </ProgressContainer>

          {/* 폼 컨테이너 */}
          <FormContainer>
            {/* 주소 입력 - 읽기 전용 및 클릭 시 주소 검색 페이지로 이동 */}
            <div>
              <InputLabel>
                주소를 입력해 주세요 <RequiredMark>*</RequiredMark>
              </InputLabel>
              <HelperText visible={!!errors.postAddress}>
                {errors.postAddress || '헬퍼 텍스트입니다.'}
              </HelperText>
              <InputField
                type="text"
                name="postAddress"
                value={formData.postAddress}
                onChange={handleInputChange}
                onFocus={e => {
                  e.preventDefault(); // 기본 이벤트 방지
                  e.stopPropagation(); // 이벤트 버블링 방지
                  handleAddressClick();
                }}
                onBlur={handleBlur}
                placeholder="주소를 입력해주세요"
                isError={!!errors.postAddress}
                isFocused={focused.postAddress}
                readOnly={true} // 읽기 전용으로 설정
                hasValue={!!formData.postAddress} // 값이 있는지 여부
                onClick={e => {
                  e.preventDefault(); // 기본 이벤트 방지
                  e.stopPropagation(); // 이벤트 버블링 방지
                  handleAddressClick();
                }}
              />
              <AddressSearchButton
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddressClick();
                }}
              />
            </div>

            {/* 한줄 소개 */}
            <div onClick={e => e.stopPropagation()}>
              <InputLabel>
                공간 한줄 소개 <RequiredMark>*</RequiredMark>
              </InputLabel>
              <HelperText visible={!!errors.postTitle}>
                {errors.postTitle || '헬퍼 텍스트입니다.'}
              </HelperText>
              <InputField
                type="text"
                name="postTitle"
                value={formData.postTitle}
                onChange={handleInputChange}
                onFocus={e => {
                  e.stopPropagation(); // 이벤트 버블링 방지
                  const { name } = e.target;
                  setFocused(prev => ({ ...prev, [name]: true }));
                }}
                onBlur={handleBlur}
                placeholder="공간을 한줄로 작성해주세요 (최대 15글자)"
                maxLength={DESCRIPTION_MAX_LENGTH}
                isError={!!errors.postTitle}
                isFocused={focused.postTitle}
                onClick={e => e.stopPropagation()}
              />
            </div>

            {/* 상세 내용 */}
            <div onClick={e => e.stopPropagation()}>
              <InputLabel>
                내용을 입력해주세요 <RequiredMark>*</RequiredMark>
              </InputLabel>
              <HelperText visible={!!errors.postContent}>
                {errors.postContent || '헬퍼 텍스트입니다.'}
              </HelperText>
              <TextArea
                name="postContent"
                value={formData.postContent}
                onChange={handleInputChange}
                onFocus={e => {
                  e.stopPropagation(); // 이벤트 버블링 방지
                  const { name } = e.target;
                  setFocused(prev => ({ ...prev, [name]: true }));
                }}
                onBlur={handleBlur}
                placeholder="장소에 대한 설명을 자세히 입력해주세요.
            보관 장소 설명 (보관장소 크기, 환경)
            유의사항 (보관기간, 보관 시 주의해야할 점)
            보관이 안되는 품목 (ex. 귀중품, 가구)
            기타 (자율적으로 하고 싶은말)
            *최대 500글자까지 입력 가능합니다*"
                maxLength={DETAILS_MAX_LENGTH}
                isError={!!errors.postContent}
                isFocused={focused.postContent}
                onClick={e => e.stopPropagation()}
              />
            </div>

            {/* 가격 입력 */}
            <div onClick={e => e.stopPropagation()}>
              <InputLabel>
                희망 가격 입력 <RequiredMark>*</RequiredMark>
              </InputLabel>
              <HelperText visible={!!errors.preferPrice}>
                {errors.preferPrice || '헬퍼 텍스트입니다.'}
              </HelperText>
              <InputField
                type="number"
                name="preferPrice"
                value={formData.preferPrice}
                onChange={handleInputChange}
                onFocus={e => {
                  e.stopPropagation(); // 이벤트 버블링 방지
                  const { name } = e.target;
                  setFocused(prev => ({ ...prev, [name]: true }));
                }}
                onBlur={handleBlur}
                placeholder="가격을 입력해주세요 (숫자만 입력해주세요)"
                isError={!!errors.preferPrice}
                isFocused={focused.preferPrice}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </FormContainer>
          {/* 다음 버튼 */}
          <NextButton onClick={handleSubmit}>다음</NextButton>
        </Container>
      </RegistrationContainer>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="보관소" />

      {/* 로딩 오버레이 */}
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}

      {/* 토스트 메시지 */}
      {toastVisible && <Toast message={toastMessage} visible={toastVisible} />}
    </>
  );
};

export default Registration1;
