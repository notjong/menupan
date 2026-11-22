export function validateSettings(input, { themes, devices }) {
  const errors = [];
  if (!themes.includes(input.theme)) errors.push({ field: "theme", message: "알 수 없는 테마입니다." });
  if (!devices.includes(input.device)) errors.push({ field: "device", message: "알 수 없는 디바이스입니다." });
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
