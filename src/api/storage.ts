import { client } from './client';
import { API_BASE_URL, API_PATHS } from '../constants/api';
import axios from 'axios';

// 보관소 등록 요청 인터페이스
export interface StorageRegistrationRequest {
  postAddressData: string;
  postTitle: string;
  postContent: string;
  preferPrice: string;
  storageLocation: '실내' | '실외';
  tags: number[]; // 태그 ID 배열
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

    // 텍스트 정보 추가
    formData.append('postAddressData', postData.postAddressData);
    formData.append('postTitle', postData.postTitle);
    formData.append('postContent', postData.postContent);
    formData.append('preferPrice', postData.preferPrice);

    // 태그 ID 배열 추가
    if (postData.tags && postData.tags.length > 0) {
      // 백엔드에서 배열 형태로 받을 수 있도록 처리
      postData.tags.forEach((tagId, index) => {
        formData.append(`tags[${index}]`, tagId.toString());
      });
      // 또는 JSON 문자열로 변환하여 전송 (백엔드 API 구현에 따라 조정)
      // formData.append('tags', JSON.stringify(data.tags));
    }

    // 이미지 파일 추가
    formData.append('mainImage', mainImage);

    // 상세 이미지 추가
    detailImages.forEach((file, index) => {
      formData.append(`detailImages`, file);
    });

    // API 호출
    const response = await client.post(API_PATHS.STORAGE.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: false,
    });

    return {
      id: response.data.id,
      success: true,
    };
  } catch (error) {
    console.error('보관소 등록 실패:', error);

    if (axios.isAxiosError(error) && error.response) {
      return {
        id: '',
        success: false,
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
 */
export const updateStorage = async (
  id: string,
  data: StorageRegistrationRequest,
  mainImage: File,
  detailImages: File[],
): Promise<StorageRegistrationResponse> => {
  try {
    // FormData 객체 생성
    const formData = new FormData();

    // 기본 정보 추가
    formData.append('id', id);
    formData.append('postAddressData', data.postAddressData);
    formData.append('postTitle', data.postTitle);
    formData.append('postContent', data.postContent);
    formData.append('preferPrice', data.preferPrice);

    // 태그 ID 배열 추가
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tagId, index) => {
        formData.append(`tags[${index}]`, tagId.toString());
      });
    }

    // 이미지 파일 추가
    formData.append('mainImage', mainImage);

    // 상세 이미지 추가
    detailImages.forEach((file, index) => {
      formData.append(`detailImages`, file);
    });

    // API 호출
    const response = await client.put(API_PATHS.STORAGE.UPDATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: false,
    });

    return {
      id: response.data.id,
      success: true,
    };
  } catch (error) {
    console.error('보관소 수정 실패:', error);

    if (axios.isAxiosError(error) && error.response) {
      return {
        id: '',
        success: false,
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
