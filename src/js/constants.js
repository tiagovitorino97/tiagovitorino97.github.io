export const MINESKIN_API_URL = 'https://mineskin.eu/skin/';
export const NON_MATERIAL_ITEMS = ['elytra', 'bow', 'crossbow', 'shield', 'trident', 'mace'];
export const NON_LEVEL_ENCHANTMENTS = ['mending', 'silk_touch', 'flame', 'infinity', 'multishot', 'channeling', 'aqua_affinity'];
export const ENCHANTMENT_INCOMPATIBILITIES = {
    "sharpness": ["smite", "bane_of_arthropods"],
    "smite": ["sharpness", "bane_of_arthropods"],
    "bane_of_arthropods": ["sharpness", "smite"],
    "efficiency": ["silk_touch"],
    "silk_touch": ["efficiency", "fortune"],
    "fortune": ["silk_touch"],
    "power": ["punch"],
    "punch": ["power"],
    "mending": ["infinity"],
    "infinity": ["mending"],
    "loyalty": ["riptide"],
    "riptide": ["loyalty", "channeling"],
    "channeling": ["riptide"],
    "curse_of_binding": ["curse_of_vanishing"],
    "curse_of_vanishing": ["curse_of_binding"],
    "fire_protection": ["blast_protection", "projectile_protection", "protection"],
    "blast_protection": ["fire_protection", "projectile_protection", "protection"],
    "projectile_protection": ["fire_protection", "blast_protection", "protection"],
    "protection": ["fire_protection", "blast_protection", "projectile_protection"],
    "frost_walker": ["depth_strider"],
    "depth_strider": ["frost_walker"]
};
export const MINECRAFT_DYE_COLORS = {
    undyed: 0xA06540,
    white: 0xF9FFFE,
    orange: 0xF9801D,
    magenta: 0xC74EBD,
    lightBlue: 0x3AB3DA,
    yellow: 0xFED83D,
    lime: 0x80C71F,
    pink: 0xF38BAA,
    gray: 0x474F52,
    lightGray: 0x9D9D97,
    cyan: 0x169C9C,
    purple: 0x8932B8,
    blue: 0x3C44AA,
    brown: 0x835432,
    green: 0x5E7C16,
    red: 0xB02E26,
    black: 0x1D1D21,
};
export const OVERLAY_REGIONS = [
    {
        name: 'head',
        front: { x: 40, y: 8, width: 8, height: 8 },
        top: { x: 40, y: 0, width: 8, height: 8 },
        bottom: { x: 48, y: 0, width: 8, height: 8 },
        right: { x: 32, y: 8, width: 8, height: 8 },
        left: { x: 48, y: 8, width: 8, height: 8 },
        back: { x: 56, y: 8, width: 8, height: 8 }
    },
    {
        name: 'body',
        front: { x: 20, y: 36, width: 8, height: 12 },
        top: { x: 20, y: 32, width: 8, height: 4 },
        bottom: { x: 28, y: 32, width: 8, height: 4 },
        right: { x: 16, y: 36, width: 4, height: 12 },
        left: { x: 28, y: 36, width: 4, height: 12 },
        back: { x: 32, y: 36, width: 8, height: 12 }
    },
    {
        name: 'right_arm',
        front: { x: 44, y: 36, width: 4, height: 12 },
        top: { x: 44, y: 32, width: 4, height: 4 },
        bottom: { x: 48, y: 32, width: 4, height: 4 },
        right: { x: 40, y: 36, width: 4, height: 12 },
        left: { x: 48, y: 36, width: 4, height: 12 },
        back: { x: 52, y: 36, width: 4, height: 12 }
    },
    {
        name: 'left_arm',
        front: { x: 52, y: 52, width: 4, height: 12 },
        top: { x: 52, y: 48, width: 4, height: 4 },
        bottom: { x: 56, y: 48, width: 4, height: 4 },
        right: { x: 48, y: 52, width: 4, height: 12 },
        left: { x: 56, y: 52, width: 4, height: 12 },
        back: { x: 60, y: 52, width: 4, height: 12 }
    },
    {
        name: 'right_leg',
        front: { x: 4, y: 36, width: 4, height: 12 },
        top: { x: 4, y: 32, width: 4, height: 4 },
        bottom: { x: 8, y: 32, width: 4, height: 4 },
        right: { x: 0, y: 36, width: 4, height: 12 },
        left: { x: 8, y: 36, width: 4, height: 12 },
        back: { x: 12, y: 36, width: 4, height: 12 }
    },
    {
        name: 'left_leg',
        front: { x: 4, y: 52, width: 4, height: 12 },
        top: { x: 4, y: 48, width: 4, height: 4 },
        bottom: { x: 8, y: 48, width: 4, height: 4 },
        right: { x: 0, y: 52, width: 4, height: 12 },
        left: { x: 8, y: 52, width: 4, height: 12 },
        back: { x: 12, y: 52, width: 4, height: 12 }
    }
];
export const OLD_FORMAT_TO_NEW = [
    // Legs
    { sx: 4, sy: 16, w: 4, h: 4, dx: 20, dy: 48, flip: true },
    { sx: 8, sy: 16, w: 4, h: 4, dx: 24, dy: 48, flip: true },
    { sx: 0, sy: 20, w: 4, h: 12, dx: 24, dy: 52, flip: true },
    { sx: 4, sy: 20, w: 4, h: 12, dx: 20, dy: 52, flip: true },
    { sx: 8, sy: 20, w: 4, h: 12, dx: 16, dy: 52, flip: true },
    { sx: 12, sy: 20, w: 4, h: 12, dx: 28, dy: 52, flip: true },
    // Arms
    { sx: 44, sy: 16, w: 4, h: 4, dx: 36, dy: 48, flip: true },
    { sx: 48, sy: 16, w: 4, h: 4, dx: 40, dy: 48, flip: true },
    { sx: 40, sy: 20, w: 4, h: 12, dx: 40, dy: 52, flip: true },
    { sx: 44, sy: 20, w: 4, h: 12, dx: 36, dy: 52, flip: true },
    { sx: 48, sy: 20, w: 4, h: 12, dx: 32, dy: 52, flip: true },
    { sx: 52, sy: 20, w: 4, h: 12, dx: 44, dy: 52, flip: true }
  ];

export const NON_VISIBLE = [
    // 64x32 and 64x64 skin parts
    { x: 0, y: 0, width: 8, height: 8 },
    { x: 24, y: 0, width: 16, height: 8 },
    { x: 56, y: 0, width: 8, height: 8 },
    { x: 0, y: 16, width: 4, height: 4 },
    { x: 12, y: 16, width: 8, height: 4 },
    { x: 36, y: 16, width: 8, height: 4 },
    { x: 52, y: 16, width: 4, height: 4 },
    { x: 56, y: 16, width: 8, height: 32 },
    //
    //// 64x64 skin parts
    { x: 0, y: 32, width: 4, height: 4 },
    { x: 12, y: 32, width: 8, height: 4 },
    { x: 36, y: 32, width: 8, height: 4 },
    { x: 52, y: 32, width: 4, height: 4 },
    { x: 0, y: 48, width: 4, height: 4 },
    { x: 12, y: 48, width: 8, height: 4 },
    { x: 28, y: 48, width: 8, height: 4 },
    { x: 44, y: 48, width: 8, height: 4 },
    { x: 60, y: 48, width: 4, height: 4 }
]