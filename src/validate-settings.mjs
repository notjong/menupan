// 어드민이 보낸 설정을 _설정 시트에 쓰기 전에 검사한다(신뢰 경계).
function checkOneOf(field, value, options, message) {
  return options.includes(value) ? [] : [{ field, message }];
}

function checkNonNegativeInteger(field, value, message) {
  return Number.isInteger(value) && value >= 0 ? [] : [{ field, message }];
}

export function validateSettings(input, { themes, devices }) {
  const autoAdvanceSec = Number(input.autoAdvanceSec);
  const errors = [
    ...checkOneOf("theme", input.theme, themes, "알 수 없는 테마입니다."),
    ...checkOneOf("device", input.device, devices, "알 수 없는 디바이스입니다."),
    ...checkNonNegativeInteger("autoAdvanceSec", autoAdvanceSec, "자동전환초는 0 이상 정수여야 합니다."),
  ];
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    settings: {
      storeName: String(input.storeName).trim(),
      tagline: String(input.tagline).trim(),
      theme: input.theme,
      device: input.device,
      autoAdvanceSec,
    },
  };
}
