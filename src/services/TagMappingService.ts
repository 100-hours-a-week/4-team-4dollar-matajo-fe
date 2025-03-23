// 인덱스 시그니처를 포함한 인터페이스 정의
interface TagIdMap {
  [key: string]: number;
}

// Tag IDs mapping based on the database structure
export const TAG_IDS: TagIdMap = {
  // Location types
  실내: 1,
  실외: 2,

  // Storage types
  상온보관: 3,
  냉장보관: 4,
  냉동보관: 5,

  // Item types
  식물: 6,
  전자기기: 7,
  가전: 8,
  서적: 9,
  의류: 10,
  식품: 11,
  스포츠: 12,
  가구: 13,
  취미: 14,

  // Duration options
  일주일이내: 15,
  '일주일 이내': 15, // Alternative format
  한달이내: 16,
  '한달 이내': 16, // Alternative format
  '3개월이상': 17,
  '3개월 이상': 17, // Alternative format

  // Valuable option
  귀중품: 18,
  귀중품O: 18, // Alternative format
};

/**
 * Converts selected tag names to their corresponding IDs
 * @param locationTag Location tag ('실내'|'실외')
 * @param itemTypes Array of item type tags
 * @param storageTypes Array of storage type tags
 * @param durationOptions Array of duration option tags
 * @param isValuableSelected Whether valuable option is selected
 * @returns Array of tag IDs
 */
export const convertTagsToIds = (
  locationTag: '실내' | '실외' | '',
  itemTypes: string[],
  storageTypes: string[],
  durationOptions: string[],
  isValuableSelected: boolean,
): number[] => {
  const tagIds: number[] = [];

  // Add location tag if selected
  if (locationTag && TAG_IDS[locationTag]) {
    tagIds.push(TAG_IDS[locationTag]);
  }

  // Add item types
  itemTypes.forEach(type => {
    if (TAG_IDS[type]) {
      tagIds.push(TAG_IDS[type]);
    }
  });

  // Add storage types
  storageTypes.forEach(type => {
    if (TAG_IDS[type]) {
      tagIds.push(TAG_IDS[type]);
    }
  });

  // Add duration options
  durationOptions.forEach(duration => {
    if (TAG_IDS[duration]) {
      tagIds.push(TAG_IDS[duration]);
    }
  });

  // Add valuable tag if selected
  if (isValuableSelected && TAG_IDS['귀중품']) {
    tagIds.push(TAG_IDS['귀중품']);
  }

  return tagIds;
};

/**
 * Converts selected tag names to string array
 * @param locationTag Location tag ('실내'|'실외')
 * @param itemTypes Array of item type tags
 * @param storageTypes Array of storage type tags
 * @param durationOptions Array of duration option tags
 * @param isValuableSelected Whether valuable option is selected
 * @returns Array of tag strings
 */
export const convertTagsToStrings = (
  locationTag: '실내' | '실외' | '',
  itemTypes: string[],
  storageTypes: string[],
  durationOptions: string[],
  isValuableSelected: boolean,
): string[] => {
  const tagStrings: string[] = [];

  // Add location tag if selected
  if (locationTag) {
    tagStrings.push(locationTag);
  }

  // Add item types
  itemTypes.forEach(type => {
    tagStrings.push(type);
  });

  // Add storage types
  storageTypes.forEach(type => {
    tagStrings.push(type);
  });

  // Add duration options
  durationOptions.forEach(duration => {
    tagStrings.push(duration);
  });

  // Add valuable tag if selected
  if (isValuableSelected) {
    tagStrings.push('귀중품');
  }

  return tagStrings;
};
