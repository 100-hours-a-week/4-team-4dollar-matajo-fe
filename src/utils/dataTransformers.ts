/**
 * Transform snake_case keys to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform camelCase keys to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively transform object keys from snake_case to camelCase
 */
export function transformKeysToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToCamel);
  }

  const camelObj: Record<string, any> = {};

  Object.keys(obj).forEach(key => {
    const camelKey = snakeToCamel(key);
    camelObj[camelKey] = transformKeysToCamel(obj[key]);
  });

  return camelObj;
}

/**
 * Recursively transform object keys from camelCase to snake_case
 */
export function transformKeysToSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToSnake);
  }

  const snakeObj: Record<string, any> = {};

  Object.keys(obj).forEach(key => {
    const snakeKey = camelToSnake(key);
    snakeObj[snakeKey] = transformKeysToSnake(obj[key]);
  });

  return snakeObj;
}

/**
 * Transform API storage detail response to the frontend data structure
 */
export function transformStorageDetail(apiResponse: any): any {
  if (!apiResponse) return null;

  // First transform all keys to camelCase
  const camelCaseData = transformKeysToCamel(apiResponse);

  // Handle special cases where we need custom transformations
  // For example, if post_images should always be used instead of postImages:
  if (apiResponse.post_images && !camelCaseData.postImages) {
    camelCaseData.postImages = apiResponse.post_images;
  }

  // Ensure arrays are initialized even if missing
  camelCaseData.postImages = camelCaseData.postImages || [];
  camelCaseData.postTags = camelCaseData.postTags || [];

  return camelCaseData;
}
