import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import Header, { HeaderDropdownOption } from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import Modal from '../../../components/common/Modal';
import KakaoMap from '../../../components/feature/map/KakaoMap';
import {
  getStorageDetail,
  deleteStorage,
  toggleStorageVisibility,
} from '../../../services/api/modules/place';
import { transformStorageDetail } from '../../../utils/dataTransformers';
import ChatService from '../../../services/ChatService';
import axios from 'axios';
import Toast from '../../../components/common/Toast';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#280081',
  primaryLight: '#5E5CFD',
  primaryTransparent: 'rgba(56.26, 53.49, 252.61, 0.80)',
  background: '#F5F5FF',
  darkText: '#464646',
  lightGrayText: '#9C9C9C',
  blackText: '#292929',
  borderColor: '#D9D9D9',
  dividerColor: '#D9D9D9',
  white: '#FFFFFF',
};

// 모달관련 스타일 컴포넌트
const GrayText = styled.span`
  color: #5b5a5d;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
  word-wrap: break-word;
`;

const HighlightText = styled.span`
  color: #010048;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  line-height: 19.21px;
  word-wrap: break-word;
`;

const Container = styled.div`
  width: 100%;
  max-width: 480px;
  height: calc(100vh - 120px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 40px;
  padding-top: 10px;
`;

const ContentContainer = styled.div`
  position: relative;
  padding-bottom: 30px;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 260px;
  position: relative;
  background: #eeeeee;
  overflow: hidden;
`;

const ImageSlider = styled.div<{ currentIndex: number }>`
  display: flex;
  width: 100%;
  height: 100%;
  transform: translateX(${props => -props.currentIndex * 100}%);
  transition: transform 0.3s ease-in-out;
  will-change: transform;
  touch-action: pan-y; /* Y축 스크롤만 허용, X축 스크롤은 방지 */
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const ImageSlide = styled.div`
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoSection = styled.div`
  padding: 15px 25px;
  position: relative;
`;

const Title = styled.div`
  width: 100%;
  color: black;
  font-size: 20px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  line-height: 25.5px;
  letter-spacing: 0.4px;
  word-wrap: break-word;
  margin-bottom: 10px;
`;

const TagsContainer = styled.div`
  width: 100%;
  color: rgba(58, 0, 229, 0.6);
  font-size: 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  word-wrap: break-word;
  margin-bottom: 15px;
`;

const PriceContainer = styled.div`
  padding: 8px 0;
  display: flex;
  align-items: baseline;
`;

const PriceText = styled.span`
  color: #484444;
  font-size: 17px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  line-height: 21.88px;
  word-wrap: break-word;
`;

const UnitText = styled.span`
  color: #484444;
  font-size: 9px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  line-height: 21.88px;
  word-wrap: break-word;
  margin-left: 2px;
`;

const ChatButton = styled.div`
  width: 94px;
  height: 32px;
  padding: 3px 0;
  margin-top: 4px;
  position: relative;
  background: ${THEME.primary};
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const ChatButtonText = styled.div`
  color: white;
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 0.32px;
  word-wrap: break-word;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${THEME.dividerColor};
  margin: 15px 0;
`;

const DescriptionContainer = styled.div`
  padding: 0 25px;
  color: black;
  font-size: 13px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  line-height: 17px;
  letter-spacing: 0.26px;
  word-wrap: break-word;
`;

const LocationSection = styled.div`
  padding: 15px 25px;
  position: relative;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const LocationIcon = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LocationLabel = styled.div`
  color: ${THEME.lightGrayText};
  font-size: 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  line-height: 10.44px;
  letter-spacing: 0.24px;
  margin-right: 10px;
`;

const LocationText = styled.div`
  color: black;
  font-size: 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  line-height: 10.44px;
  letter-spacing: 0.24px;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 15px;
`;

const KeeperSection = styled.div`
  padding: 15px 25px;
`;

const KeeperCard = styled.div`
  width: 100%;
  max-width: 400px;
  height: 50px;
  border-radius: 10px;
  border: 1px #cfcffe solid;
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 15px;
`;

const KeeperInfo = styled.div`
  margin-left: 45px;
  display: flex;
  flex-direction: column;
`;

const KeeperLabel = styled.div`
  color: #515151;
  font-size: 10px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  line-height: 9.85px;
  word-wrap: break-word;
  margin-bottom: 4px;
`;

const KeeperName = styled.div`
  color: #515151;
  font-size: 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  line-height: 9.85px;
  word-wrap: break-word;
`;

const KeeperImageContainer = styled.div`
  width: 36px;
  height: 36px;
  position: absolute;
  left: 15px;
  background: white;
  border-radius: 9999px;
  border: 0.3px rgba(175.69, 175.69, 175.69, 0.8) solid;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const KeeperImage = styled.img`
  width: 28px;
  height: 29px;
  // box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const ImageIndicator = styled.div`
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const Dot = styled.div<{ isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => (props.isActive ? THEME.primary : 'rgba(255, 255, 255, 0.6)')};
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
`;

// 위치 아이콘 SVG 컴포넌트 추가
const LocationIconSVG = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 1.875C6.89844 1.875 4.375 4.39844 4.375 7.5C4.375 11.5625 10 18.125 10 18.125C10 18.125 15.625 11.5625 15.625 7.5C15.625 4.39844 13.1016 1.875 10 1.875ZM10 9.375C8.96484 9.375 8.125 8.53516 8.125 7.5C8.125 6.46484 8.96484 5.625 10 5.625C11.0352 5.625 11.875 6.46484 11.875 7.5C11.875 8.53516 11.0352 9.375 10 9.375Z"
      fill="#5E5CFD"
    />
  </svg>
);

// 드롭다운 메뉴 스타일 컴포넌트 추가
const DropdownMenu = styled.div`
  width: 83px;
  height: 78px;
  position: relative;
  background: white;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
`;

const DropdownItem = styled.div`
  width: 100%;
  height: 26px;
  display: flex;
  align-items: center;
  padding: 0 7px;
  cursor: pointer;
  position: relative;
  color: #2a2a2a;
  font-size: 10px;
  font-family: Noto Sans KR;
  font-weight: 700;
  letter-spacing: 0.2px;
  word-wrap: break-word;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const DropdownDivider = styled.div`
  width: 83px;
  height: 1px;
  background-color: #d9d9d9;
  position: absolute;
`;

const DropdownIcon = styled.div`
  width: 15px;
  height: 15px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const DeleteItem = styled(DropdownItem)`
  color: #ff0000;
`;

// 백엔드 API 응답 데이터 타입 정의
interface StorageDetailData {
  postId: string | number;
  postImages?: string[];
  postTitle: string;
  postTags: string[];
  preferPrice: number;
  postContent: string;
  postAddress: string;
  nickname: string;
  hiddenStatus: boolean;
  editable: boolean; // userId 대신 editable 필드로 변경
  latitude?: number;
  longitude?: number;
}

interface StorageDetailProps {
  id?: string;
  onBack?: () => void;
}

const StorageDetail: React.FC<StorageDetailProps> = ({ id: propId, onBack }) => {
  // URL에서 id 파라미터 가져오기
  const { id: paramId } = useParams<{ id: string }>();
  // React Router의 useNavigate 훅 사용
  const navigate = useNavigate();

  // props로 전달된 id가 있으면 사용하고, 없으면 URL 파라미터 사용
  const id = propId || paramId;

  // 컨테이너 참조 생성
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 이미지 슬라이더 관련 상태 및 참조
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // API 응답 데이터 및 로딩 상태
  const [storageDetail, setStorageDetail] = useState<StorageDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const [isAuthor, setIsAuthor] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastRequestTimeRef = useRef<number>(0);
  const REQUEST_INTERVAL = 100; // 0.1초 간격으로 요청 제한

  // 주소 검색 기능 추가
  const searchAddressToCoordinate = useCallback(
    async (address: string): Promise<{ lat: number; lng: number } | null> => {
      return new Promise(resolve => {
        if (!address) {
          resolve(null);
          return;
        }

        const geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, (result: any, status: any) => {
          if (status === 'OK' && result.length > 0) {
            const { x, y } = result[0];
            resolve({ lat: parseFloat(y), lng: parseFloat(x) });
          } else {
            console.error('주소 검색 실패:', address);
            resolve(null);
          }
        });
      });
    },
    [],
  );

  // API에서 보관소 상세 정보 로드
  useEffect(() => {
    // 요청 간격 제한 확인
    const now = Date.now();
    if (now - lastRequestTimeRef.current < REQUEST_INTERVAL) {
      return;
    }
    lastRequestTimeRef.current = now;
    const fetchStorageDetail = async () => {
      if (!id) {
        setError('보관소 ID가 제공되지 않았습니다.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 실제 API 호출
        const response = await getStorageDetail(id);

        // API 응답 데이터 추출
        if (response.data && response.data.success) {
          const transformedData = transformStorageDetail(response.data.data);

          if (response.data.data.post_images && Array.isArray(response.data.data.post_images)) {
            transformedData.postImages = response.data.data.post_images;
          }

          // 주소를 좌표로 변환
          if (response.data.data.post_address) {
            const coordinates = await searchAddressToCoordinate(response.data.data.post_address);
            if (coordinates) {
              transformedData.latitude = coordinates.lat;
              transformedData.longitude = coordinates.lng;
              console.log('주소를 좌표로 변환 성공:', coordinates);
            } else {
              console.warn('주소를 좌표로 변환 실패:', response.data.data.post_address);
              setToastMessage('장소 위치를 검색할 수 없습니다.');
              setShowToast(true);
            }
          }

          setStorageDetail(transformedData);

          // editable 값으로 작성자 여부 판단
          setIsAuthor(transformedData.editable);
          setIsHidden(transformedData.hiddenStatus);
        } else {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }
      } catch (err) {
        console.error('보관소 상세 정보 로드 실패:', err);
        setError('보관소 정보를 불러오는 데 실패했습니다.');
        setStorageDetail(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorageDetail();
  }, [id, searchAddressToCoordinate]);

  // 토스트 메시지 표시 함수 수정
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    console.log('토스트 메시지 표시 시도:', { message, type });
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    const timer = setTimeout(() => {
      console.log('토스트 타이머 실행');
      setShowToast(false);
    }, 3000);

    return () => clearTimeout(timer);
  };

  // 토스트 상태 변경 추적
  useEffect(() => {
    console.log('토스트 상태 변경:', { showToast, toastMessage, toastType });
  }, [showToast, toastMessage, toastType]);

  // 채팅하기 버튼 클릭 핸들러 수정
  const handleChatClick = async () => {
    if (!storageDetail) return;

    try {
      // 작성자와 현재 사용자가 같은지 확인 (editable 값으로 판단)
      if (storageDetail.editable) {
        console.log('자신의 게시글 채팅 시도 - 토스트 표시');
        showToastMessage('본인의 장소에는 채팅을 생성할 수 없습니다.', 'info');
        return;
      }

      // ChatService 인스턴스 생성
      const chatService = ChatService.getInstance();

      // 채팅방 생성 요청
      const response = await chatService.createChatRoom({
        post_id: Number(storageDetail.postId),
      });

      if (response.success && response.data) {
        // 채팅방으로 이동
        navigate(`/chat/${response.data.id}`);
      } else {
        showToastMessage('채팅방 생성에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      showToastMessage('채팅방 생성에 실패했습니다. 다시 시도해주세요.', 'error');
    }
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    // 이미지 슬라이더 내부에서만 이벤트 실행
    if (e.currentTarget.contains(e.target as Node)) {
      setTouchStartX(e.touches[0].clientX);
      setTouchEndX(e.touches[0].clientX); // 초기화
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 이미지 슬라이더 내부에서만 이벤트 실행
    if (e.currentTarget.contains(e.target as Node)) {
      setTouchEndX(e.touches[0].clientX);

      // 슬라이더가 있고 이미지가 2개 이상일 때만 실시간 드래그 효과 적용
      if (sliderRef.current && (storageDetail?.postImages?.length ?? 0) > 1) {
        const dragDistance = e.touches[0].clientX - touchStartX;
        const slideWidth = sliderRef.current.offsetWidth;
        const maxOffset = ((storageDetail?.postImages?.length ?? 1) - 1) * slideWidth;

        // 현재 위치에서의 드래그 오프셋 계산
        let newOffset = currentImageIndex * slideWidth - dragDistance;

        // 경계 처리 (맨 앞, 맨 뒤 이미지에서 고무줄 효과)
        if (newOffset < 0) {
          newOffset = newOffset / 3; // 저항 효과
        } else if (newOffset > maxOffset) {
          newOffset = maxOffset + (newOffset - maxOffset) / 3; // 저항 효과
        }

        // translate3d를 사용하여 하드웨어 가속 적용
        sliderRef.current.style.transform = `translate3d(${-newOffset}px, 0, 0)`;
        sliderRef.current.style.transition = 'none';
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // 이미지 슬라이더 내부에서만 이벤트 실행
    if (e.currentTarget.contains(e.target as Node)) {
      // 최소 드래그 거리 (px)
      const minSwipeDistance = 50;
      const distance = touchStartX - touchEndX;

      if (Math.abs(distance) < minSwipeDistance) {
        // 작은 드래그는 원위치로 복원
        if (sliderRef.current) {
          sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
          sliderRef.current.style.transform = `translate3d(${-currentImageIndex * 100}%, 0, 0)`;
        }
        return;
      }

      // 상태 업데이트 및 이미지 이동
      if (distance > 0 && currentImageIndex < (storageDetail?.postImages?.length || 0) - 1) {
        // 오른쪽에서 왼쪽으로 스와이프 (다음 이미지)
        const newIndex = currentImageIndex + 1;
        setCurrentImageIndex(newIndex);

        // 애니메이션 적용
        if (sliderRef.current) {
          sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
          sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
        }
      } else if (distance < 0 && currentImageIndex > 0) {
        // 왼쪽에서 오른쪽으로 스와이프 (이전 이미지)
        const newIndex = currentImageIndex - 1;
        setCurrentImageIndex(newIndex);

        // 애니메이션 적용
        if (sliderRef.current) {
          sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
          sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
        }
      } else {
        // 첫 번째나 마지막 이미지에서 경계를 벗어나려는 시도는 원위치로
        if (sliderRef.current) {
          sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
          sliderRef.current.style.transform = `translate3d(${-currentImageIndex * 100}%, 0, 0)`;
        }
      }
    }
  };

  // 마우스 이벤트 핸들러 (데스크톱 지원)
  const handleMouseDown = (e: React.MouseEvent) => {
    // 이미지 드래그 중 텍스트 선택 방지
    e.preventDefault();

    // 이미지 슬라이더 내부에서만 이벤트 실행
    if (e.currentTarget.contains(e.target as Node)) {
      setIsDragging(true);
      setDragStartX(e.clientX);
      setTouchStartX(e.clientX);
      setTouchEndX(e.clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    // 이미지 슬라이더 내부에서만 이벤트 실행
    if (e.currentTarget.contains(e.target as Node)) {
      setTouchEndX(e.clientX);

      // 슬라이더가 있고 이미지가 2개 이상일 때만 실시간 드래그 효과 적용
      if (sliderRef.current && (storageDetail?.postImages?.length ?? 0) > 1) {
        const dragDistance = e.clientX - dragStartX;
        const slideWidth = sliderRef.current.offsetWidth;
        const maxOffset = ((storageDetail?.postImages?.length ?? 1) - 1) * slideWidth;

        // 현재 위치에서의 드래그 오프셋 계산
        let newOffset = currentImageIndex * slideWidth - dragDistance;

        // 경계 처리 (맨 앞, 맨 뒤 이미지에서 고무줄 효과)
        if (newOffset < 0) {
          newOffset = newOffset / 3;
        } else if (newOffset > maxOffset) {
          newOffset = maxOffset + (newOffset - maxOffset) / 3;
        }

        // translate3d를 사용하여 하드웨어 가속 적용
        sliderRef.current.style.transform = `translate3d(${-newOffset}px, 0, 0)`;
        sliderRef.current.style.transition = 'none';
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;

    // 이미지 슬라이더 내부에서만 이벤트 실행
    if (e.currentTarget.contains(e.target as Node)) {
      // 최소 드래그 거리 (px)
      const minSwipeDistance = 50;
      const distance = touchStartX - touchEndX;

      if (Math.abs(distance) < minSwipeDistance) {
        // 작은 드래그는 원위치로 복원
        if (sliderRef.current) {
          sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
          sliderRef.current.style.transform = `translate3d(${-currentImageIndex * 100}%, 0, 0)`;
        }
        setIsDragging(false);
        return;
      }

      // 상태 업데이트 및 이미지 이동
      if (distance > 0 && currentImageIndex < (storageDetail?.postImages?.length || 0) - 1) {
        // 오른쪽에서 왼쪽으로 드래그 (다음 이미지)
        const newIndex = currentImageIndex + 1;
        setCurrentImageIndex(newIndex);

        // 애니메이션 적용
        if (sliderRef.current) {
          sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
          sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
        }
      } else if (distance < 0 && currentImageIndex > 0) {
        // 왼쪽에서 오른쪽으로 드래그 (이전 이미지)
        const newIndex = currentImageIndex - 1;
        setCurrentImageIndex(newIndex);

        // 애니메이션 적용
        if (sliderRef.current) {
          sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
          sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
        }
      } else {
        // 첫 번째나 마지막 이미지에서 경계를 벗어나려는 시도는 원위치로
        if (sliderRef.current) {
          sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
          sliderRef.current.style.transform = `translate3d(${-currentImageIndex * 100}%, 0, 0)`;
        }
      }

      setIsDragging(false);
    }
  };

  // 이미지 제어 함수
  const nextImage = () => {
    if (currentImageIndex < (storageDetail?.postImages?.length || 0) - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);

      // 슬라이더 애니메이션 적용
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
      }
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);

      // 슬라이더 애니메이션 적용
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
      }
    }
  };

  // 특정 인덱스로 이동
  const goToImage = (index: number) => {
    if (index >= 0 && index < (storageDetail?.postImages?.length || 0)) {
      setCurrentImageIndex(index);

      // 슬라이더 애니메이션 적용
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      }
    }
  };

  // 모달 상태 관리
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);

  // 게시글 삭제 모달 열기
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  // 게시글 삭제 확인 처리
  const handleDeleteConfirm = async () => {
    try {
      if (!id) return;

      // 모달 닫기
      setIsDeleteModalOpen(false);

      // 로딩 표시
      setIsLoading(true);

      // API 호출로 보관소 삭제
      const response = await deleteStorage(id);

      console.log('보관소 삭제 완료:', response);

      // 성공 시 보관소 목록으로 이동
      navigate('/storages');
    } catch (err) {
      console.error('보관소 삭제 실패:', err);
      setError('보관소 삭제에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  // 게시글 삭제 취소 처리
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    console.log('게시글 삭제 취소');
  };

  // 공개/비공개 전환 모달 열기
  const openVisibilityModal = () => {
    setIsVisibilityModalOpen(true);
  };

  // 뒤로가기 처리 함수
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // 보관소 목록으로 이동 (기본값)
      navigate('/storages');
    }
  };

  // 모달 내용 컴포넌트 - 게시글 삭제
  const deleteStorageContent = (
    <>
      <HighlightText>게시글 삭제</HighlightText>
      <GrayText>하시겠습니까?</GrayText>
    </>
  );

  // 모달 내용 컴포넌트 - 공개/비공개 전환
  const visibilityContent = (
    <>
      <HighlightText>게시글을 {isHidden ? '공개' : '비공개'}</HighlightText>
      <GrayText>하시겠습니까?</GrayText>
    </>
  );

  // 공개/비공개 전환 핸들러
  const handleToggleVisibility = async () => {
    setIsVisibilityModalOpen(false);

    try {
      if (!id) return;

      // 로딩 상태 활성화
      setIsLoading(true);

      const response = await toggleStorageVisibility(id);

      // 로딩 상태 비활성화
      setIsLoading(false);

      // 응답 구조 검증
      if (response && response.data && response.data.success) {
        setIsHidden(!isHidden);
        showToastMessage(isHidden ? '보관소가 공개되었습니다.' : '보관소가 비공개되었습니다.');
      } else {
        console.warn('공개/비공개 전환 성공 응답 구조 확인:', response?.data);
        showToastMessage('공개/비공개 전환에 실패했습니다.', 'error');
      }
    } catch (error) {
      // 로딩 상태 비활성화
      setIsLoading(false);

      console.error('공개/비공개 전환 실패:', error);

      // 구체적인 에러 메시지 표시
      let errorMessage = '공개/비공개 전환에 실패했습니다. 다시 시도해주세요.';

      if (axios.isAxiosError(error) && error.response) {
        console.error('서버 응답 에러:', error.response.data);
        console.error('에러 상태 코드:', error.response.status);

        if (error.response.status === 401) {
          errorMessage = '로그인이 필요합니다.';
        } else if (error.response.status === 403) {
          errorMessage = '권한이 없습니다.';
        } else if (error.response.status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
      }

      showToastMessage(errorMessage, 'error');
    }
  };

  // 헤더 드롭다운 옵션 정의 수정
  const headerDropdownOptions: HeaderDropdownOption[] = isAuthor
    ? [
        {
          id: 'edit',
          label: '보관소 수정',
          icon: (
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.875 9.78113V12.1249H3.21875L10.1313 5.21238L7.7875 2.86863L0.875 9.78113ZM11.944 3.39961C12.1878 3.15586 12.1878 2.76211 11.944 2.51836L10.4815 1.05586C10.2378 0.812109 9.84402 0.812109 9.60027 1.05586L8.45652 2.19961L10.8003 4.54336L11.944 3.39961Z"
                fill="#020202"
              />
            </svg>
          ),
          onClick: () => navigate(`/storages/${id}/edit`),
        },
        {
          id: 'visibility',
          label: isHidden ? '공개하기' : '비공개',
          icon: isHidden ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 3C4.36364 3 1.25818 5.33091 0 8.5C1.25818 11.6691 4.36364 14 8 14C11.6364 14 14.7418 11.6691 16 8.5C14.7418 5.33091 11.6364 3 8 3ZM8 11.5C6.06727 11.5 4.5 10.0673 4.5 8.5C4.5 6.93273 6.06727 5.5 8 5.5C9.93273 5.5 11.5 6.93273 11.5 8.5C11.5 10.0673 9.93273 11.5 8 11.5ZM8 10C7.17182 10 6.5 9.32818 6.5 8.5C6.5 7.67182 7.17182 7 8 7C8.82818 7 9.5 7.67182 9.5 8.5C9.5 9.32818 8.82818 10 8 10Z"
                fill="#020202"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 3C4.36364 3 1.25818 5.33091 0 8.5C1.25818 11.6691 4.36364 14 8 14C11.6364 14 14.7418 11.6691 16 8.5C14.7418 5.33091 11.6364 3 8 3ZM8 11.5C6.06727 11.5 4.5 10.0673 4.5 8.5C4.5 6.93273 6.06727 5.5 8 5.5C9.93273 5.5 11.5 6.93273 11.5 8.5C11.5 10.0673 9.93273 11.5 8 11.5ZM8 10C7.17182 10 6.5 9.32818 6.5 8.5C6.5 7.67182 7.17182 7 8 7C8.82818 7 9.5 7.67182 9.5 8.5C9.5 9.32818 8.82818 10 8 10Z"
                fill="#020202"
              />
              <path d="M2 2L14 14" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ),
          onClick: () => openVisibilityModal(),
        },
        {
          id: 'delete',
          label: '삭제',
          icon: (
            <svg
              width="9"
              height="9"
              viewBox="0 0 9 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.875 1.00625L7.99375 0.125L4.5 3.61875L1.00625 0.125L0.125 1.00625L3.61875 4.5L0.125 7.99375L1.00625 8.875L4.5 5.38125L7.99375 8.875L8.875 7.99375L5.38125 4.5L8.875 1.00625Z"
                fill="#020202"
              />
            </svg>
          ),
          color: '#FF0000',
          onClick: () => openDeleteModal(),
        },
      ]
    : [];

  const requestLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        // 사용자에게 위치 권한이 필요하다는 메시지 표시
        alert('현재 위치 기능을 사용하기 위해서는 위치 권한이 필요합니다.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('위치 권한 확인 중 오류:', error);
      return false;
    }
  };

  return (
    <>
      {/* 상단 헤더 */}
      <Header
        title="보관소 상세 페이지"
        showBackButton={true}
        showOptionButton={isAuthor}
        onBack={handleBack}
        dropdownOptions={headerDropdownOptions}
      />

      <Container ref={containerRef}>
        {/* 게시글 삭제 모달 */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          content={deleteStorageContent}
          cancelText="취소"
          confirmText="삭제"
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />

        {/* 공개/비공개 전환 모달 */}
        <Modal
          isOpen={isVisibilityModalOpen}
          onClose={() => setIsVisibilityModalOpen(false)}
          content={visibilityContent}
          cancelText="취소"
          confirmText="확인"
          onCancel={() => setIsVisibilityModalOpen(false)}
          onConfirm={handleToggleVisibility}
        />

        {isLoading ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#f0f0f0',
            }}
          >
            <div>데이터 로딩 중...</div>
          </div>
        ) : error ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#f0f0f0',
            }}
          >
            <div>{error}</div>
          </div>
        ) : storageDetail ? (
          <ContentContainer>
            {/* 이미지 섹션 */}
            <ImageContainer>
              {!storageDetail.postImages || storageDetail.postImages.length === 0 ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#f0f0f0',
                  }}
                >
                  <div>이미지가 없습니다</div>
                </div>
              ) : (
                <>
                  <ImageSlider
                    ref={sliderRef}
                    currentIndex={currentImageIndex}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {storageDetail.postImages.map((imageUrl, index) => (
                      <ImageSlide key={index}>
                        <SlideImage src={imageUrl} alt={`보관소 이미지 ${index + 1}`} />
                      </ImageSlide>
                    ))}
                  </ImageSlider>

                  {/* 이미지 인디케이터 - 이미지가 2개 이상일 때만 표시 */}
                  {storageDetail.postImages && storageDetail.postImages.length > 1 && (
                    <ImageIndicator>
                      {storageDetail.postImages.map((_, index) => (
                        <Dot
                          key={index}
                          isActive={currentImageIndex === index}
                          onClick={() => goToImage(index)}
                        />
                      ))}
                    </ImageIndicator>
                  )}
                </>
              )}
            </ImageContainer>

            {/* 제목 및 정보 */}
            <InfoSection>
              <Title>{storageDetail.postTitle}</Title>
              <TagsContainer>
                {storageDetail.postTags.map((tag, index) => (
                  <span key={index}>#{tag} </span>
                ))}
              </TagsContainer>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <PriceContainer>
                  <PriceText>{storageDetail.preferPrice.toLocaleString()}원</PriceText>
                  <UnitText>/일</UnitText>
                </PriceContainer>

                {/* 채팅하기 버튼 */}
                <ChatButton onClick={handleChatClick}>
                  <ChatButtonText>채팅하기</ChatButtonText>
                </ChatButton>
              </div>
            </InfoSection>

            {/* 구분선 */}
            <Divider />

            {/* 상세 설명 */}
            <DescriptionContainer>
              {storageDetail.postContent.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </DescriptionContainer>

            {/* 구분선 */}
            <Divider />

            {/* 위치 정보 */}
            <LocationSection>
              <LocationInfo>
                <LocationIcon>
                  <LocationIconSVG />
                </LocationIcon>
                <LocationLabel>위치</LocationLabel>
                <LocationText>{storageDetail.postAddress || '위치 정보 없음'}</LocationText>
              </LocationInfo>

              {/* 구분선 */}
              <Divider />

              {/* 지도 */}
              <MapContainer>
                <KakaoMap
                  center={{
                    lat: storageDetail.latitude || 37.5665, // 기본값: 서울
                    lng: storageDetail.longitude || 126.978,
                  }}
                  level={3}
                  storageMarkers={[
                    {
                      id: storageDetail.postId.toString(),
                      name: storageDetail.postTitle,
                      latitude: storageDetail.latitude || 37.5665,
                      longitude: storageDetail.longitude || 126.978,
                      address: storageDetail.postAddress || '',
                    },
                  ]}
                  detailMode={true}
                  draggable={false}
                  zoomable={false}
                />
              </MapContainer>
            </LocationSection>

            {/* 보관인 정보 */}
            <KeeperSection>
              <KeeperCard>
                <KeeperImageContainer>
                  <KeeperImage src="/tajo-logo.png" alt="보관인 프로필" />
                </KeeperImageContainer>
                <KeeperInfo>
                  <KeeperLabel>보관인</KeeperLabel>
                  <KeeperName>{storageDetail.nickname}</KeeperName>
                </KeeperInfo>
              </KeeperCard>
            </KeeperSection>
            <BottomNavigation activeTab="보관소" />
          </ContentContainer>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <div>보관소 정보가 없습니다.</div>
          </div>
        )}
      </Container>

      {/* Toast 컴포넌트를 Container 밖으로 이동 */}
      <Toast
        message={toastMessage}
        visible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </>
  );
};

export default StorageDetail;
