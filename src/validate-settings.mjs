export function validateSettings(input) {
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
