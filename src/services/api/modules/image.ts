import axios from 'axios';
import { API_PATHS } from '../../../constants/api';

interface PresignedUrlResponse {
  success: boolean;
  message: string;
  data: {
    presigned_url: string;
    image_url: string;
    temp_key: string;
  };
}

interface MoveImageResponse {
  success: boolean;
  message: string;
  data: {
    moved_images: Array<{
      temp_key: string;
      image_url: string;
      is_main_image: boolean;
    }>;
    failed_images: string[];
  };
}

const plainAxios = axios.create();

// presigned URL 요청
export const getPresignedUrl = async (
  filename: string,
  mime_type: string,
  category: string = 'post',
): Promise<PresignedUrlResponse> => {
  try {
    console.log('=== presigned URL 요청 시작 ===');
    console.log('1. 요청 파라미터:', {
      mime_type,
      filename,
      category,
    });

    const response = await plainAxios.post(API_PATHS.IMAGE.PRESIGNED_URL, {
      mime_type,
      filename,
      category,
    });

    console.log('2. presigned URL 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== presigned URL 요청 실패 ===');
    console.error('에러 객체:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
    }
    throw error;
  }
};

// S3에 이미지 업로드
const uploadImageToS3 = async (presigned_url: string, file: File): Promise<void> => {
  try {
    console.log('=== S3 업로드 시작 ===');
    console.log('1. 업로드 정보:', {
      presigned_url,
      filename: file.name,
      mime_type: file.type,
      file_size: file.size,
    });

    await axios.put(presigned_url, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    console.log('2. S3 업로드 완료');
  } catch (error) {
    console.error('=== S3 업로드 실패 ===');
    console.error('에러 객체:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
    }
    throw error;
  }
};

// 이미지 이동
export const moveImages = async (
  temp_keys: string[],
  category: string,
  main_flags: boolean[] = [],
): Promise<MoveImageResponse> => {
  try {
    console.log('=== 이미지 이동 시작 ===');
    console.log('1. 이동할 이미지 temp_keys:', temp_keys);

    const response = await plainAxios.post(API_PATHS.IMAGE.MOVE_IMAGE, {
      temp_keys,
      category,
      main_flags,
    });

    console.log('2. 이미지 이동 완료:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== 이미지 이동 실패 ===');
    console.error('에러 객체:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
    }
    throw error;
  }
};

// 단일 이미지 업로드
export const uploadImage = async (
  file: File,
  category: string,
  is_main_image: boolean = false,
): Promise<string> => {
  try {
    console.log('=== 단일 이미지 업로드 시작 ===');
    console.log('1. 파일 정보:', {
      filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      category,
      is_main_image,
    });

    // 파일 이름 생성
    const timestamp = Date.now();
    const filename = `${category}/${timestamp}-${file.name}`;

    // presigned URL 요청
    const presignedUrlResponse = await getPresignedUrl(filename, file.type, category);

    // S3에 업로드
    await uploadImageToS3(presignedUrlResponse.data.presigned_url, file);

    // 이미지 이동
    const moveResponse = await moveImages([presignedUrlResponse.data.temp_key], category, [
      is_main_image,
    ]);

    console.log('2. 단일 이미지 업로드 완료:', moveResponse.data.moved_images[0].image_url);
    return moveResponse.data.moved_images[0].image_url;
  } catch (error) {
    console.error('=== 단일 이미지 업로드 실패 ===');
    console.error('에러 객체:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
    }
    throw error;
  }
};

// 다중 이미지 업로드
export const uploadMultipleImages = async (
  files: File[],
  category: string,
  is_main_images: boolean[] = [],
): Promise<string[]> => {
  try {
    console.log('=== 다중 이미지 업로드 시작 ===');
    console.log(
      '1. 파일 정보:',
      files.map(file => ({
        filename: file.name,
        mime_type: file.type,
        file_size: file.size,
      })),
    );
    console.log('2. 카테고리 및 메인 이미지 플래그:', { category, is_main_images });

    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now();
      const filename = `${category}/${timestamp}-${index}-${file.name}`;

      const presignedUrlResponse = await getPresignedUrl(filename, file.type, category);
      await uploadImageToS3(presignedUrlResponse.data.presigned_url, file);

      return presignedUrlResponse.data.temp_key;
    });

    const temp_keys = await Promise.all(uploadPromises);
    const moveResponse = await moveImages(temp_keys, category, is_main_images);

    console.log(
      '3. 다중 이미지 업로드 완료:',
      moveResponse.data.moved_images.map(img => img.image_url),
    );
    return moveResponse.data.moved_images.map(img => img.image_url);
  } catch (error) {
    console.error('=== 다중 이미지 업로드 실패 ===');
    console.error('에러 객체:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
    }
    throw error;
  }
};

// Presigned URL을 사용하여 이미지를 업로드하는 함수
export const uploadImageWithPresignedUrl = async (
  presignedUrl: string,
  file: File,
): Promise<string> => {
  try {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    // 업로드된 이미지의 URL을 반환 (presignedUrl에서 파일명 추출)
    const fileName = presignedUrl.split('?')[0].split('/').pop();
    return `${API_PATHS.IMAGE.PRESIGNED_URL}/${fileName}`;
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw error;
  }
};
