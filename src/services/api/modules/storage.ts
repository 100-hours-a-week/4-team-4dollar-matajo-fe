import client from '../client';
import api, { API_BACKEND_URL, API_PATHS } from '../../../constants/api';
import axios from 'axios';
import { DaumAddressData } from '../../KakaoMapService';
import { transformKeysToSnake } from '../../../utils/dataTransformers';

// 타입 정의 통합
export interface LocationPost {
  post_id: number;
  post_title: string;
  post_address: string;
  post_content: string;
  post_tags: string[];
  post_images: string[];
  prefer_price: number;
  latitude: number;
  longitude: number;
  nickname: string;
  hidden_status: boolean;
}

export interface LocationIdData {
  id: number;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface LocationIdResponse extends Array<LocationIdData> {}

export interface LocationPostResponse {
  success: boolean;
  message: string;
  data: {
    posts: LocationPost[];
  };
}

// 보관소 등록 요청 인터페이스
export interface StorageRegistrationRequest {
  post_title: string;
  post_content: string;
  post_address_data: {
    address: string;
    address_english: string;
    address_type: string;
    apartment: string;
    auto_jibun_address: string;
    auto_jibun_address_english: string;
    auto_road_address: string;
    auto_road_address_english: string;
    bcode: string;
    bname: string;
    bname1: string;
    bname1_english: string;
    bname2: string;
    bname2_english: string;
    bname_english: string;
    building_code: string;
    building_name: string;
    hname: string;
    jibun_address: string;
    jibun_address_english: string;
    no_selected: string;
    postcode: string;
    postcode1: string;
    postcode2: string;
    postcode_seq: string;
    query: string;
    road_address: string;
    road_address_english: string;
    roadname: string;
    roadname_code: string;
    roadname_english: string;
    sido: string;
    sido_english: string;
    sigungu: string;
    sigungu_code: string;
    sigungu_english: string;
    user_language_type: string;
    user_selected_type: string;
    zonecode: string;
  };
  prefer_price: number;
  post_tags: string[];
}

// 보관소 등록 응답 인터페이스
export interface StorageRegistrationResponse {
  id: string;
  success: boolean;
  message?: string;
}

/**
 * 보관소 정보와 이미지를 서버에 등록하는 함수
 */
export const registerStorage = async (
  data: any,
  mainImage: File,
  detailImages: File[],
): Promise<StorageRegistrationResponse> => {
  try {
    // FormData 생성
    const formData = new FormData();

    // postData를 snake_case로 변환하여 추가
    const postData = {
      post_title: data.postTitle,
      post_content: data.postContent,
      post_address_data: data.postAddressData, // 이미 snake_case 형식임
      prefer_price: Number(data.preferPrice),
      post_tags: data.postTags,
    };
    const postDataStr = JSON.stringify(postData);
    // postData를 JSON 문자열로 변환하여 추가
    formData.append('postData', new Blob([postDataStr], { type: 'application/json' }));

    // 이미지 파일 추가
    formData.append('mainImage', mainImage);

    // 상세 이미지들 추가
    detailImages.forEach(file => {
      formData.append('detailImages', file);
    });

    // API 호출
    const response = await client.post('/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      id: response.data.data?.post_id || '0',
      success: true,
      message: response.data.message || 'write_post_success',
    };
  } catch (error) {
    console.error('보관소 등록 API 오류:', error);

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

    detailImages.forEach(file => {
      formData.append('detailImages', file);
    });

    console.log('보관소 수정 데이터:', {
      postData: snakeCaseData,
      mainImage: mainImage.name,
      detailImages: detailImages.map(f => f.name),
    });

    // API 호출
    const response = await client.put(`${API_PATHS.POSTS.UPDATE}/${id}`, formData, {
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

    // API 응답 데이터를 그대로 사용 (변환하지 않음)
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        posts: response.data.data.posts,
      },
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
 * 내 보관소 정보 인터페이스
 */
export interface StorageItem {
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
export interface MyStorageResponse {
  success: boolean;
  message: string;
  data: StorageItem[];
}

/**
 * 내 보관소 목록을 가져오는 함수
 *
 * @returns 내 보관소 목록
 */
export const getMyStorages = async (): Promise<any[]> => {
  try {
    const response = await client.get(API_PATHS.POSTS.MY_POSTS, {
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
