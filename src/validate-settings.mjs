function checkOneOf(field, value, options, message) {
  return options.includes(value) ? [] : [{ field, message }];
}

export function validateSettings(input, { themes, devices }) {
  const errors = [
    ...checkOneOf("theme", input.theme, themes, "알 수 없는 테마입니다."),
    ...checkOneOf("device", input.device, devices, "알 수 없는 디바이스입니다."),
  ];
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    settings: {
      storeName: String(input.storeName).trim(),
      tagline: String(input.tagline).trim(),
      theme: input.theme,
      device: input.device,
      autoAdvanceSec: Number(input.autoAdvanceSec),
    },
  };
}
