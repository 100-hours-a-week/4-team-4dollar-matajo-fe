import client from '../client';
import api, { API_BACKEND_URL, API_PATHS } from '../../../constants/api';
import axios from 'axios';
import { DaumAddressData } from '../../../utils/api/kakaoToDaum';
import { transformKeysToSnake } from '../../../utils/dataTransformers';
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

// 위치 기반 게시글 인터페이스
export interface LocationPost {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  price: number;
  images: string[];
}

// 위치 기반 게시글 응답 인터페이스
export interface LocationPostResponse {
  success: boolean;
  message: string;
  data: {
    posts: LocationPost[];
  };
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

    // postData 객체를 스네이크 케이스로 변환
    const snakeCaseData = transformKeysToSnake(postData);
    console.log('전송할 postData(스네이크 케이스):', snakeCaseData);

    // 서버가 처리할 수 있는 방식으로 postData 추가
    const postDataStr = JSON.stringify(snakeCaseData);
    // Blob 객체로 변환하여 추가 (application/json 타입으로)
    formData.append('postData', new Blob([postDataStr], { type: 'application/json' }));

    // 이미지 파일 추가
    formData.append('mainImage', mainImage);

    // 상세 이미지 추가
    detailImages.forEach(file => {
      formData.append('detailImages', file);
    });

    console.log('전송하는 데이터 구조:', {
      postData: snakeCaseData,
      mainImage: mainImage.name,
      detailImages: detailImages.map(f => f.name),
    });

    // API 호출
    const response = await client.post(API_PATHS.POSTS.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });

    console.log('보관소 등록 응답:', response.data);

    // 응답 데이터 구조 검사
    if (response.data.success) {
      return {
        id: response.data.data?.post_id || '0',
        success: true,
        message: response.data.message || 'write_post_success',
      };
    } else {
      console.error('서버가 success: false를 반환했습니다:', response.data);
      return {
        id: '',
        success: false,
        message: response.data.message || '보관소 등록에 실패했습니다.',
      };
    }
  } catch (error) {
    console.error('보관소 등록 실패:', error);

    if (axios.isAxiosError(error) && error.response) {
      console.error('서버 응답 에러:', error.response.data);
      console.error('에러 상태 코드:', error.response.status);
      console.error('에러 헤더:', error.response.headers);

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

    // postData 객체에 id 추가 및 스네이크 케이스로 변환
    const updatedPostData = {
      ...postData,
      id: id,
    };

    const snakeCaseData = transformKeysToSnake(updatedPostData);
    console.log('전송할 postData(스네이크 케이스):', snakeCaseData);

    // 데이터 추가 - Blob 객체로 변환하여 추가
    const postDataStr = JSON.stringify(snakeCaseData);
    formData.append('postData', new Blob([postDataStr], { type: 'application/json' }));

    // 이미지 파일 추가
    formData.append('mainImage', mainImage);

    // 상세 이미지 추가
    detailImages.forEach(file => {
      formData.append('detailImages', file);
    });

    console.log('보관소 수정 데이터:', {
      postData: snakeCaseData,
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

// 위치 기반 게시글 인터페이스
export interface LocationPost {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  price: number;
  images: string[];
}

// 위치 기반 게시글 응답 인터페이스
export interface LocationPostResponse {
  success: boolean;
  message: string;
  data: {
    posts: LocationPost[];
  };
}

/**
 * 특정 동 위치 기반 게시글을 가져오는 함수
 *
 * @param locationInfoId 위치 정보 ID
 * @returns 위치 기반 게시글 목록
 */
export const getLocationPosts = async (locationInfoId: string): Promise<LocationPostResponse> => {
  try {
    const response = await client.get(
      `${API_PATHS.POSTS.BY_LOCATION}?locationInfoId=${locationInfoId}`,
    );

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error('위치 기반 게시글 조회 실패:', error);

    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data.message || '위치 기반 게시글 조회에 실패했습니다.',
        data: { posts: [] },
      };
    }

    return {
      success: false,
      message: '위치 기반 게시글 조회 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.',
      data: { posts: [] },
    };
  }
};

// createStorage 함수를 registerStorage의 별칭으로 내보내기
export const createStorage = registerStorage;

/**
 * 내 보관소/거래 목록을 가져오는 인터페이스
 */
export interface MyTradeItem {
  trade_id: number;
  keeper_status: boolean;
  trade_name: string;
  user_id: number;
  post_address: string;
  trade_date: string;
  start_date: string;
  storage_period: number;
  trade_price: number;
}

/**
 * 내 보관소 응답 인터페이스
 */
export interface MyTradeResponse {
  success: boolean;
  message: string;
  data: MyTradeItem[];
}

/**
 * 내 보관소 목록을 가져오는 함수
 *
 * @returns 내 보관소 목록
 */
export const getMyStorages = async (): Promise<MyTradeItem[]> => {
  try {
    const response = await client.get<MyTradeResponse>(API_PATHS.POSTS.MY_POSTS, {
      withCredentials: true,
    });

    console.log('API 응답:', response.data);

    if (response.data.success) {
      return response.data.data || [];
    } else {
      console.error('서버가 success: false를 반환했습니다:', response.data);
      return [];
    }
  } catch (error) {
    console.error('내 보관소 목록 조회 실패:', error);
    throw error;
  }
};
