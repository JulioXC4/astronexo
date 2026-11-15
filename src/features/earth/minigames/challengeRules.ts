/** Educational thresholds used by the polar-night scene; NASA POWER supplies irradiance separately. */
export function evaluatePolarAllocation(heat: number, crops: number, radio: number) {
  const allocated = heat + crops + radio;
  const heatingSafe = heat >= 50;
  const cropsSafe = crops >= 20;
  const radioSafe = radio >= 10;
  return {
    allocated,
    heatingSafe,
    cropsSafe,
    radioSafe,
    success: allocated === 100 && heatingSafe && cropsSafe && radioSafe,
  };
}

/** Energy produced is an illustrative conversion of historical horizontal irradiance. */
export function evaluateSolarEnergy(irradianceKwhPerM2: number, angle: number, reservePercent: number) {
  const orientationFactor = Math.max(0.60, Math.cos((Math.abs(angle - 16) * Math.PI) / 180));
  const totalKwh = Number((irradianceKwhPerM2 * orientationFactor * 0.22 * 10).toFixed(2));
  const storedKwh = Number((totalKwh * reservePercent / 100).toFixed(2));
  return {
    totalKwh,
    storedKwh,
    daytimeKwh: Number((totalKwh - storedKwh).toFixed(2)),
    orientationFactor,
    orientationGood: Math.abs(angle - 16) <= 5,
    dayPowered: reservePercent <= 60,
    nightPowered: reservePercent >= 30,
  };
}
