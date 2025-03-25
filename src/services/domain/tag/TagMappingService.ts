// src/services/domain/tag/TagMappingService.ts

/**
 * 오버로드된 convertTagsToStrings 함수 - 객체 파라미터 버전 시그니처
 * @param storageData 옵션이 선택된 보관소 데이터
 * @returns API용 태그 문자열 배열
 */
export function convertTagsToStrings(storageData: {
  storageLocation: string;
  selectedItemTypes: string[];
  selectedStorageTypes: string[];
  selectedDurationOptions: string[];
  isValuableSelected: boolean;
}): string[];

/**
 * 오버로드된 convertTagsToStrings 함수 - 개별 파라미터 버전 시그니처
 * @param storageLocation 보관 위치
 * @param selectedItemTypes 선택된 물건 유형 배열
 * @param selectedStorageTypes 선택된 보관 방식 배열
 * @param selectedDurationOptions 선택된 보관 기간 배열
 * @param isValuableSelected 귀중품 선택 여부
 * @returns API용 태그 문자열 배열
 */
export function convertTagsToStrings(
  storageLocation: string,
  selectedItemTypes: string[],
  selectedStorageTypes: string[],
  selectedDurationOptions: string[],
  isValuableSelected: boolean,
): string[];

/**
 * convertTagsToStrings 함수의 실제 구현
 * 오버로드된 모든 시그니처를 처리할 수 있도록 구현
 */
export function convertTagsToStrings(
  arg1:
    | string
    | {
        storageLocation: string;
        selectedItemTypes: string[];
        selectedStorageTypes: string[];
        selectedDurationOptions: string[];
        isValuableSelected: boolean;
      },
  arg2?: string[],
  arg3?: string[],
  arg4?: string[],
  arg5?: boolean,
): string[] {
  // 객체 형태로 전달된 경우 처리
  if (typeof arg1 === 'object') {
    const storageData = arg1;
    const tags: string[] = [];

    // 보관 위치 태그 추가
    if (storageData.storageLocation) {
      tags.push(storageData.storageLocation);
    }

    // 물건 유형 태그 추가
    if (storageData.selectedItemTypes && storageData.selectedItemTypes.length > 0) {
      tags.push(...storageData.selectedItemTypes);
    }

    // 보관 방식 태그 추가
    if (storageData.selectedStorageTypes && storageData.selectedStorageTypes.length > 0) {
      tags.push(...storageData.selectedStorageTypes);
    }

    // 보관 기간 태그 추가
    if (storageData.selectedDurationOptions && storageData.selectedDurationOptions.length > 0) {
      tags.push(...storageData.selectedDurationOptions);
    }

    // 귀중품 태그 추가 (선택된 경우)
    if (storageData.isValuableSelected) {
      tags.push('귀중품');
    }

    return tags;
  }
  // 개별 파라미터로 전달된 경우 처리
  else {
    const storageLocation = arg1;
    const selectedItemTypes = arg2 || [];
    const selectedStorageTypes = arg3 || [];
    const selectedDurationOptions = arg4 || [];
    const isValuableSelected = arg5 || false;

    const tags: string[] = [];

    // 보관 위치 태그 추가
    if (storageLocation) {
      tags.push(storageLocation);
    }

    // 물건 유형 태그 추가
    if (selectedItemTypes.length > 0) {
      tags.push(...selectedItemTypes);
    }

    // 보관 방식 태그 추가
    if (selectedStorageTypes.length > 0) {
      tags.push(...selectedStorageTypes);
    }

    // 보관 기간 태그 추가
    if (selectedDurationOptions.length > 0) {
      tags.push(...selectedDurationOptions);
    }

    // 귀중품 태그 추가 (선택된 경우)
    if (isValuableSelected) {
      tags.push('귀중품');
    }

    return tags;
  }
}

/**
 * 태그 문자열을 카테고리별로 분류하여 파싱
 * @param tags API에서 가져온 태그 문자열 배열
 * @returns 카테고리별로 분류된 선택 항목 객체
 */
export const parseTagStrings = (
  tags: string[],
): {
  storageLocation: string;
  selectedItemTypes: string[];
  selectedStorageTypes: string[];
  selectedDurationOptions: string[];
  isValuableSelected: boolean;
} => {
  // 기본 빈 결과 객체
  const result: {
    storageLocation: string;
    selectedItemTypes: string[];
    selectedStorageTypes: string[];
    selectedDurationOptions: string[];
    isValuableSelected: boolean;
  } = {
    storageLocation: '',
    selectedItemTypes: [],
    selectedStorageTypes: [],
    selectedDurationOptions: [],
    isValuableSelected: false,
  };

  // 알려진 태그 카테고리
  const itemTypes = ['식물', '전자기기', '가전', '스포츠', '식품', '의류', '서적', '취미', '가구'];
  const storageTypes = ['냉장보관', '냉동보관', '상온보관'];
  const durationOptions = ['일주일 이내', '한달 이내', '3개월 이상'];

  // 각 태그 처리
  tags.forEach(tag => {
    // 보관 위치 확인
    if (tag === '실내' || tag === '실외') {
      result.storageLocation = tag;
    }
    // 물건 유형 확인
    else if (itemTypes.includes(tag)) {
      result.selectedItemTypes.push(tag);
    }
    // 보관 방식 확인
    else if (storageTypes.includes(tag)) {
      result.selectedStorageTypes.push(tag);
    }
    // 보관 기간 확인
    else if (durationOptions.includes(tag)) {
      result.selectedDurationOptions.push(tag);
    }
    // 귀중품 확인
    else if (tag === '귀중품') {
      result.isValuableSelected = true;
    }
  });

  return result;
};
