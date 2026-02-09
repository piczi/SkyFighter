// 游戏常量

// 游戏尺寸 - 动态获取
let gameWidthValue = 0;
let gameHeightValue = 0;

export const getGameWidth = () => {
  if (gameWidthValue === 0) {
    gameWidthValue = typeof window !== 'undefined' ? window.innerWidth : 800;
  }
  return gameWidthValue;
};

export const getGameHeight = () => {
  if (gameHeightValue === 0) {
    gameHeightValue = typeof window !== 'undefined' ? window.innerHeight : 600;
  }
  return gameHeightValue;
};

export const setGameSize = (width, height) => {
  gameWidthValue = width;
  gameHeightValue = height;
};

export const GAME_WIDTH = getGameWidth();
export const GAME_HEIGHT = getGameHeight();

// 游戏对象尺寸
export const PLAYER_SIZE = 50;
export const BULLET_WIDTH = 8;
export const BULLET_HEIGHT = 20;
export const ENEMY_SIZE = 45;

// 速度常量
export const PLAYER_SPEED = 30;
export const BULLET_SPEED = 15;
export const ENEMY_SPEED = 3;

// 时间间隔
export const SPAWN_INTERVAL = 1200;
export const SHOOT_INTERVAL = 200;

// 对象池配置
export const POOL_CONFIG = {
  bullets: 200,
  enemies: 100,
  particles: 1000,
  explosions: 50,
  items: 50
};

// 游戏状态
export const GAME_STATES = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover'
};

// 武器类型
export const WEAPON_TYPES = {
  NORMAL: 'normal',
  LASER: 'laser',
  SPREAD: 'spread'
};

// 敌人类型
export const ENEMY_TYPES = {
  NORMAL: 'normal',
  FAST: 'fast',
  TANK: 'tank',
  SHOOTER: 'shooter',
  BOMBER: 'bomber',
  SPLITTER: 'splitter',
  BOSS: 'boss'
};

// 道具类型
export const ITEM_TYPES = {
  POWER: 'power',
  BOMB: 'bomb',
  SHIELD: 'shield',
  WEAPON: 'weapon'
};

// 技能类型
export const SKILL_TYPES = {
  TIME_SLOW: 'timeSlow',
  AREA_DAMAGE: 'areaDamage',
  AUTO_AIM: 'autoAim',
  ENERGY_SHIELD: 'energyShield'
};

// 颜色常量
export const COLORS = {
  PLAYER: '#00d4ff',
  BULLET_PLAYER: '#00ff88',
  BULLET_ENEMY: '#ff4444',
  LASER: '#ff00ff',
  ENEMY_NORMAL: '#ff6b6b',
  ENEMY_FAST: '#ffd93d',
  ENEMY_TANK: '#6c5ce7',
  ENEMY_SHOOTER: '#00b894',
  ENEMY_BOMBER: '#ff8c00',
  ENEMY_SPLITTER: '#da70d6',
  BOSS: '#ff0000'
};

// 等级配置
export const LEVEL_CONFIG = {
  baseScorePerLevel: 500,
  levelsPerStage: 5,
  bombInitialCount: 3
};

// 连击配置
export const COMBO_CONFIG = {
  resetTimeout: 3000,
  minCombo: 1
};

// 道具配置
export const ITEM_CONFIG = {
  dropChance: 0.12,
  powerMax: 5,
  shieldMax: 100,
  shieldIncrease: 50
};

// Boss配置
export const BOSS_CONFIG = {
  phase1BulletCount: 3,
  phase2BulletCount: 8,
  shootInterval: 1000,
  phase2HpRatio: 0.5
};

// 音效类型
export const SOUND_TYPES = {
  SHOOT: 'shoot',
  EXPLOSION: 'explosion',
  POWERUP: 'powerUp',
  BOMB: 'bomb',
  BOMB_ITEM: 'bombItem',
  SHIELD: 'shield',
  HIT: 'hit',
  PLAYER_HIT: 'playerHit',
  START: 'start',
  GAME_OVER: 'gameOver',
  ENEMY_SHOOT: 'enemyShoot'
};