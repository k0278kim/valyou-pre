function flattenObject(
  obj: any,
  parentKey: string = '',
  result: Record<string, any> = {}
): Record<string, any> {

  // 객체의 모든 키를 순회합니다.
  for (const key in obj) {
    // 객체가 직접 소유한 속성인지 확인합니다.
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // 새로운 키 이름을 생성합니다 (예: "Cloth" + "_" + "top_wear")
      // parentKey가 없는 최상위 레벨에서는 키 이름이 그대로 사용됩니다.
      const newKey = parentKey ? `${parentKey}_${key}` : key;

      const value = obj[key];

      // 값이 객체이고, null이 아니며, 배열이 아닌 경우에만 재귀 호출
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // 더 깊은 레벨로 재귀합니다.
        flattenObject(value, newKey, result);
      } else {
        // 값이 기본형(string, number)이거나 배열, null이면 결과에 바로 할당
        result[newKey] = value;
      }
    }
  }

  return result;
}
