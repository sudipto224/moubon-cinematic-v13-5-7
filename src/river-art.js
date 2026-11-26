/**
 * Normalized Sundarbans river centerline. Y is derived from the rendered world height,
 * so scene positions, boat movement and the painted river share one responsive route.
 */
export const RIVER_CENTERLINE = Object.freeze([
  0.52083, 0.52166, 0.52247, 0.52325, 0.52400, 0.52469, 0.52531, 0.52586, 0.52631, 0.52665, 0.52687, 0.52696, 0.52690, 0.52668, 0.52628, 0.52571,
  0.52492, 0.52393, 0.52271, 0.52124, 0.51952, 0.51754, 0.51528, 0.51271, 0.50984, 0.50669, 0.50327, 0.49962, 0.49574, 0.49167, 0.48742, 0.48302,
  0.47849, 0.47386, 0.46914, 0.46437, 0.45956, 0.45473, 0.44992, 0.44513, 0.44041, 0.43576, 0.43121, 0.42678, 0.42250, 0.41838, 0.41447, 0.41076,
  0.40729, 0.40407, 0.40112, 0.39842, 0.39598, 0.39379, 0.39187, 0.39022, 0.38884, 0.38772, 0.38688, 0.38631, 0.38601, 0.38599, 0.38625, 0.38679,
  0.38762, 0.38872, 0.39012, 0.39180, 0.39377, 0.39603, 0.39859, 0.40145, 0.40460, 0.40806, 0.41181, 0.41584, 0.42014, 0.42468, 0.42944, 0.43440,
  0.43954, 0.44483, 0.45028, 0.45582, 0.46147, 0.46721, 0.47298, 0.47880, 0.48463, 0.49046, 0.49626, 0.50201, 0.50769, 0.51327, 0.51876, 0.52411,
  0.52931, 0.53434, 0.53917, 0.54379, 0.54818, 0.55232, 0.55617, 0.55973, 0.56298, 0.56589, 0.56848, 0.57075, 0.57271, 0.57437, 0.57572, 0.57679,
  0.57758, 0.57809, 0.57833, 0.57832, 0.57805, 0.57754, 0.57678, 0.57581, 0.57460, 0.57318, 0.57155, 0.56972, 0.56769, 0.56548, 0.56309, 0.56053,
  0.55780, 0.55491, 0.55188, 0.54869, 0.54538, 0.54193, 0.53837, 0.53470, 0.53092, 0.52705, 0.52309, 0.51906, 0.51496, 0.51080, 0.50659, 0.50235,
  0.49808, 0.49378, 0.48947, 0.48516, 0.48086, 0.47657, 0.47230, 0.46807, 0.46388, 0.45974, 0.45567, 0.45166, 0.44773, 0.44389, 0.44015, 0.43651,
  0.43298, 0.42959, 0.42632, 0.42320, 0.42023, 0.41742, 0.41478, 0.41232, 0.41004, 0.40795, 0.40605, 0.40434, 0.40282, 0.40149, 0.40035, 0.39940,
  0.39864, 0.39808, 0.39770, 0.39752, 0.39753, 0.39775, 0.39815, 0.39875, 0.39954, 0.40054, 0.40172, 0.40312, 0.40470, 0.40648, 0.40848, 0.41066,
  0.41304, 0.41563, 0.41842, 0.42141, 0.42460, 0.42800, 0.43160, 0.43541, 0.43941, 0.44359, 0.44795, 0.45245, 0.45709, 0.46186, 0.46673, 0.47169,
  0.47674, 0.48184, 0.48700, 0.49219, 0.49740, 0.50261, 0.50781, 0.51298, 0.51812, 0.52320, 0.52821, 0.53313, 0.53795, 0.54266, 0.54724, 0.55168,
  0.55595, 0.56005, 0.56397, 0.56768, 0.57116, 0.57442, 0.57742, 0.58017, 0.58263, 0.58481, 0.58668, 0.58828, 0.58959, 0.59062, 0.59139, 0.59189,
  0.59214, 0.59213, 0.59188, 0.59138, 0.59066, 0.58970, 0.58852, 0.58712, 0.58552, 0.58370, 0.58169, 0.57948, 0.57709, 0.57452, 0.57178, 0.56886,
  0.56577, 0.56254, 0.55915, 0.55562, 0.55194, 0.54813, 0.54419, 0.54013, 0.53596, 0.53168, 0.52728, 0.52281, 0.51825, 0.51362, 0.50895, 0.50423,
  0.49948, 0.49471, 0.48993, 0.48517, 0.48041, 0.47568, 0.47100, 0.46637, 0.46180, 0.45731, 0.45290, 0.44860, 0.44441, 0.44034, 0.43641, 0.43262,
  0.42900, 0.42555, 0.42228, 0.41921, 0.41634, 0.41369, 0.41128, 0.40910, 0.40718, 0.40552, 0.40411, 0.40295, 0.40203, 0.40136, 0.40093, 0.40072,
  0.40074, 0.40100, 0.40147, 0.40216, 0.40307, 0.40418, 0.40550, 0.40703, 0.40874, 0.41066, 0.41277, 0.41506, 0.41753, 0.42018, 0.42302, 0.42601,
  0.42917, 0.43250, 0.43599, 0.43963, 0.44343, 0.44737, 0.45144, 0.45564, 0.45995, 0.46434, 0.46880, 0.47332, 0.47787, 0.48244, 0.48702, 0.49158,
  0.49612, 0.50060, 0.50502, 0.50936, 0.51360, 0.51772, 0.52172, 0.52557, 0.52925, 0.53275, 0.53604, 0.53913, 0.54197, 0.54458, 0.54691, 0.54896,
  0.55071, 0.55213, 0.55323, 0.55397, 0.55436, 0.55437, 0.55405, 0.55341, 0.55247, 0.55126, 0.54979, 0.54809, 0.54617, 0.54407, 0.54181, 0.53939,
  0.53685, 0.53421, 0.53148, 0.52869, 0.52587, 0.52302, 0.52018, 0.51737, 0.51460, 0.51190, 0.50929, 0.50679, 0.50442, 0.50221, 0.50018, 0.49833,
  0.49672, 0.49533, 0.49419, 0.49329, 0.49260, 0.49211, 0.49179, 0.49164, 0.49164, 0.49178, 0.49202, 0.49237, 0.49279, 0.49329, 0.49383, 0.49441,
  0.49500
]);

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Sample the normalized horizontal river position at a 0–1 journey progress. */
export function sampleRiverX(progress) {
  const p = clamp(progress) * (RIVER_CENTERLINE.length - 1);
  const index = Math.min(RIVER_CENTERLINE.length - 2, Math.floor(p));
  const fraction = p - index;
  return RIVER_CENTERLINE[index] + (RIVER_CENTERLINE[index + 1] - RIVER_CENTERLINE[index]) * fraction;
}


/** Sample a gently irregular, closed river band around the shared centerline. */
function riverSamples(worldHeight, startProgress, endProgress, viewWidth = 1200, count = 192, routeStart = 0, routeEnd = 1) {
  const travel = worldHeight * (endProgress - startProgress);
  return Array.from({ length: count + 1 }, (_, index) => {
    const localProgress = index / count;
    const routeProgress = routeStart + (routeEnd - routeStart) * localProgress;
    return {
      progress: routeProgress,
      localProgress,
      x: sampleRiverX(routeProgress) * viewWidth,
      y: worldHeight * startProgress + travel * localProgress
    };
  });
}

/** Taper the very beginning/end of the rendered river so its visible entry is not a rectangular pool. */
export function riverEndTaper(localProgress, ramp = 0.22, minimum = 0.48) {
  const edgeDistance = Math.min(clamp(localProgress), 1 - clamp(localProgress));
  const t = clamp(edgeDistance / ramp);
  return minimum + (1 - minimum) * t * t * (3 - 2 * t);
}


function irregularWidth(progress, baseWidth, variation, side = 0, phase = 0) {
  const low = Math.sin(progress * Math.PI * 1.55 + phase) * variation * .28;
  const middle = Math.sin(progress * Math.PI * 7.1 + phase * 1.71) * variation * .30;
  const long = Math.sin(progress * Math.PI * .72 + phase * .63) * variation * .28;
  const asymmetry = side * Math.sin(progress * Math.PI * 3.7 + phase + .8) * variation * .18;
  const fine = Math.sin(progress * Math.PI * 13.2 + phase * 2.4) * variation * .10;
  return baseWidth + low + middle + long + asymmetry + fine;
}

/** Build a filled water/mud polygon with low-frequency irregular edges. */
export function buildRiverBand(worldHeight, startProgress, endProgress, baseHalfWidth, variation = 0, phase = 0, viewWidth = 1200, routeStart = 0, routeEnd = 1) {
  const samples = riverSamples(worldHeight, startProgress, endProgress, viewWidth, 192, routeStart, routeEnd);
  // Keep each bank as a horizontal offset from the shared centreline sample.
  // Perpendicular normals folded the broad channel back over itself at tight bends;
  // y-monotonic edges keep the filled polygon continuous at every route position.
  const left = samples.map(point => [
    point.x - irregularWidth(point.progress, baseHalfWidth, variation, -1, phase) * riverEndTaper(point.localProgress),
    point.y
  ]);
  const right = samples.map(point => [
    point.x + irregularWidth(point.progress, baseHalfWidth, variation, 1, phase) * riverEndTaper(point.localProgress),
    point.y
  ]).reverse();
  const polygon = [...left, ...right];
  return polygon.map(([x, y], index) => `${index ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ') + ' Z';
}

/** Build one softly broken bank/foam edge parallel to the river route. */
export function buildRiverEdgePath(worldHeight, startProgress, endProgress, halfWidth, side, variation = 0, phase = 0, viewWidth = 1200, routeStart = 0, routeEnd = 1) {
  const samples = riverSamples(worldHeight, startProgress, endProgress, viewWidth, 192, routeStart, routeEnd);
  return samples.map((point, index) => {
    const width = irregularWidth(point.progress, halfWidth, variation, side, phase) * riverEndTaper(point.localProgress);
    const x = point.x + width * side;
    return `${index ? 'L' : 'M'} ${x.toFixed(2)} ${point.y.toFixed(2)}`;
  }).join(' ');
}

/** Build a smooth-enough sampled SVG centerline for the supplied world dimensions. */
export function buildRiverPath(worldHeight, startProgress, endProgress, viewWidth = 1200, routeStart = 0, routeEnd = 1) {
  const startY = worldHeight * startProgress;
  const travel = worldHeight * (endProgress - startProgress);
  return RIVER_CENTERLINE.map((_, index) => {
    const localProgress = index / (RIVER_CENTERLINE.length - 1);
    const routeProgress = routeStart + (routeEnd - routeStart) * localProgress;
    const y = startY + travel * localProgress;
    return `${index ? 'L' : 'M'} ${(sampleRiverX(routeProgress) * viewWidth).toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}


/** WCAG relative luminance for a #RRGGBB token. */
export function relativeLuminance(hex) {
  const value = String(hex).replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(value)) throw new TypeError(`Expected #RRGGBB, received ${hex}`);
  const channels = [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16) / 255)
    .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
}

/** WCAG contrast ratio between two opaque sRGB colour tokens. */
export function contrastRatio(first, second) {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  const [lighter, darker] = a >= b ? [a, b] : [b, a];
  return (lighter + .05) / (darker + .05);
}
