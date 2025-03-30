import client from '../client';
import axios, { AxiosError } from 'axios';
import { API_BACKEND_URL, API_PATHS } from '../../../constants/api';
import { DaumAddressData } from '../../KakaoMapService';
import { response } from 'express';

// 보관소 등록 요청 인터페이스
export interface StorageRegistrationRequest {
  postTitle: string;
  postContent: string;
  postAddressData?: DaumAddressData;
  preferPrice: number | string;
  postTags: string[];
  storageLocation?: '실내' | '실외';
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
    const formData = new FormData();

    const postDataForServer = {
      post_title: postData.postTitle,
      post_content: postData.postContent,
      post_address_data: postData.postAddressData,
      prefer_price: String(postData.preferPrice),
      post_tags: postData.postTags,
      storage_location: postData.storageLocation,
    };

    formData.append('postData', JSON.stringify(postDataForServer));
    formData.append('mainImage', mainImage);

    detailImages.forEach(file => {
      formData.append('detailImages', file);
    });

    // client 인스턴스 사용
    const response = await client.post('/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      id: response.data.data?.post_id,
      success: true,
      message: '보관소가 성공적으로 등록되었습니다.',
    };
  } catch (error) {
    console.error('보관소 등록 실패:', error);

    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<any>;
      return {
        id: '',
        success: false,
        message: axiosError.response?.data?.message || '보관소 등록에 실패했습니다.',
      };
    }

    return {
      id: '',
      success: false,
      message: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
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
  const base64Content = base64String.split(',')[1] || base64String;
  const binaryString = window.atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mimeType });
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
    const formData = new FormData();

    const postDataForServer = {
      post_id: id,
      post_title: postData.postTitle,
      post_content: postData.postContent,
      post_address_data: postData.postAddressData,
      prefer_price: postData.preferPrice,
      post_tags: postData.postTags,
    };

    formData.append('postData', JSON.stringify(postDataForServer));
    formData.append('mainImage', mainImage);

    detailImages.forEach(file => {
      formData.append('detailImages', file);
    });

    const response = await client.put(`/api/posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return {
      id: response.data.data?.post_id || id,
      success: true,
      message: '보관소가 성공적으로 수정되었습니다.',
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
      message: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
};

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
