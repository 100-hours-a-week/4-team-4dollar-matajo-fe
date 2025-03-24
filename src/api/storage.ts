import client from './client';
import { API_BACKEND_URL, API_PATHS } from '../constants/api';
import axios from 'axios';
import { DaumAddressData } from '../utils/KakaoToDaum';
import { response } from 'express';

// 보관소 등록 요청 인터페이스
export interface StorageRegistrationRequest {
  postTitle: string;
  postContent: string;
  postAddressData?: DaumAddressData; // Daum 주소 API 데이터
  preferPrice: string;
  postTags: string[]; // 태그 ID 배열
}

// 보관소 등록 응답 인터페이스
export interface StorageRegistrationResponse {
  id: string;
  success: boolean;
  message?: string;
}

/**
 * 보관소 정보와 이미지를 서버에 등록하는 함수
 *
 * @param data 보관소 기본 정보
 * @param mainImage 대표 이미지 파일
 * @param detailImages 상세 이미지 파일 배열
 * @returns 등록 결과와 ID
 */
export const registerStorage = async (
  postData: StorageRegistrationRequest,
  mainImage: File,
  detailImages: File[],
): Promise<StorageRegistrationResponse> => {
  try {
    // FormData 객체 생성
    const formData = new FormData();

    // postData 객체를 문자열로 직렬화하여 추가
    // 이때 postAddressData도 이미 객체 내부에 포함되어 있음
    const postDataStr = JSON.stringify({
      post_title: postData.postTitle,
      post_content: postData.postContent,
      post_address_data: postData.postAddressData,
      prefer_price: postData.preferPrice,
      post_tags: postData.postTags,
    });

    // 서버가 처리할 수 있는 방식으로 postData 추가
    // 일반 텍스트 필드로 전송
    formData.append('postData', new Blob([postDataStr], { type: 'application/json' }));

    // 이미지 파일 추가
    formData.append('mainImage', mainImage);

    // 상세 이미지 추가
    detailImages.forEach(file => {
      formData.append('detailImages', file);
    });

    console.log('전송하는 데이터 구조:', {
      postData: JSON.parse(postDataStr),
      mainImage: mainImage.name,
      detailImages: detailImages.map(f => f.name),
    });

    // API 호출
    const response = await client.post(API_PATHS.STORAGE.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });

    return {
      id: response.data.data.post_id,
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error('보관소 등록 실패:', error);

    if (axios.isAxiosError(error) && error.response) {
      return {
        id: '',
        success: error.response.data.success,
        message: error.response.data.message || '보관소 등록에 실패했습니다.',
      };
    }

    return {
      id: '',
      success: false,
      message: '보관소 등록 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.',
    };
  }
};

/**
 * Base64 문자열을 File 객체로 변환하는 함수
 *
 * @param base64String Base64로 인코딩된 이미지 문자열
 * @param fileName 파일 이름
 * @param mimeType 파일 타입 (기본값: image/jpeg)
 * @returns File 객체
 */
export const base64ToFile = (
  base64String: string,
  fileName: string,
  mimeType: string = 'image/jpeg',
): File => {
  // Base64 데이터 URL에서 실제 Base64 문자열 추출
  const base64Content = base64String.split(',')[1] || base64String;

  // Base64 문자열을 디코딩하여 바이너리 데이터로 변환
  const binaryString = window.atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Blob 객체 생성
  const blob = new Blob([bytes], { type: mimeType });

  // File 객체 생성
  return new File([blob], fileName, { type: mimeType });
};

/**
 * 보관소 수정 요청을 위한 함수
 *
 * @param id 수정할 보관소 ID
 * @param postData 보관소 기본 정보
 * @param mainImage 대표 이미지 파일
 * @param detailImages 상세 이미지 파일 배열
 * @returns 수정 결과와 ID
 */
export const updateStorage = async (
  id: string,
  postData: StorageRegistrationRequest,
  mainImage: File,
  detailImages: File[],
): Promise<StorageRegistrationResponse> => {
  try {
    // FormData 객체 생성
    const formData = new FormData();

    // postData 객체를 JSON 문자열로 직렬화
    const postDataStr = JSON.stringify({
      post_id: id,
      post_title: postData.postTitle,
      post_content: postData.postContent,
      post_address_data: postData.postAddressData,
      prefer_price: postData.preferPrice,
      post_tags: postData.postTags,
    });

    // 데이터 추가
    formData.append('postData', new Blob([postDataStr], { type: 'application/json' }));

    // 이미지 파일 추가
    formData.append('mainImage', mainImage);

    // 상세 이미지 추가
    detailImages.forEach(file => {
      formData.append('detailImages', file);
    });

    console.log('보관소 수정 데이터:', {
      postData: JSON.parse(postDataStr),
      mainImage: mainImage.name,
      detailImages: detailImages.map(f => f.name),
    });

    // API 호출
    const endpoint = API_PATHS.STORAGE.UPDATE.replace(':postId', id);
    const response = await client.put(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });

    return {
      id: response.data.data?.post_id || id,
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error('보관소 수정 실패:', error);

    if (axios.isAxiosError(error) && error.response) {
      return {
        id: '',
        success: error.response.data.success || false,
        message: error.response.data.message || '보관소 수정에 실패했습니다.',
      };
    }

    return {
      id: '',
      success: false,
      message: '보관소 수정 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.',
    };
  }
};
