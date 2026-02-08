// 游戏工具函数

/**
 * 优化的矩形与圆相交检测
 * @param {number} rx - 矩形左上X
 * @param {number} ry - 矩形左上Y  
 * @param {number} rw - 矩形宽
 * @param {number} rh - 矩形高
 * @param {number} cx - 圆心X
 * @param {number} cy - 圆心Y
 * @param {number} radius - 圆半径
 * @returns {boolean} 是否相交
 */
export function rectCircleIntersect(rx, ry, rw, rh, cx, cy, radius) {
  const closestX = cx < rx ? rx : (cx > rx + rw ? rx + rw : cx);
  const closestY = cy < ry ? ry : (cy > ry + rh ? ry + rh : cy);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < radius * radius;
}

/**
 * 线段与圆相交检测
 * @param {number} x1 - 线段起点X
 * @param {number} y1 - 线段起点Y
 * @param {number} x2 - 线段终点X
 * @param {number} y2 - 线段终点Y
 * @param {number} cx - 圆心X
 * @param {number} cy - 圆心Y
 * @param {number} radius - 圆半径
 * @returns {boolean} 是否相交
 */
export function segmentCircleIntersect(x1, y1, x2, y2, cx, cy, radius) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;

  if (len2 === 0) {
    const distX = cx - x1;
    const distY = cy - y1;
    return distX * distX + distY * distY <= radius * radius;
  }

  const t = ((cx - x1) * dx + (cy - y1) * dy) / len2;
  const tClamped = Math.max(0, Math.min(1, t));

  const closestX = x1 + tClamped * dx;
  const closestY = y1 + tClamped * dy;

  const distX = cx - closestX;
  const distY = cy - closestY;

  return distX * distX + distY * distY <= radius * radius;
}

/**
 * 矩形与矩形相交检测
 * @param {number} r1x - 矩形1左上X
 * @param {number} r1y - 矩形1左上Y
 * @param {number} r1w - 矩形1宽
 * @param {number} r1h - 矩形1高
 * @param {number} r2x - 矩形2左上X
 * @param {number} r2y - 矩形2左上Y
 * @param {number} r2w - 矩形2宽
 * @param {number} r2h - 矩形2高
 * @returns {boolean} 是否相交
 */
export function rectIntersect(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
  return r1x < r2x + r2w && r1x + r1w > r2x && r1y < r2y + r2h && r1y + r1h > r2y;
}

/**
 * 获取技能冷却时间
 * @param {string} skillId - 技能ID
 * @returns {number} 冷却时间（毫秒）
 */
export function getSkillCooldown(skillId) {
  const cooldowns = {
    'timeSlow': 15000,
    'areaDamage': 20000,
    'autoAim': 25000,
    'energyShield': 30000
  };
  return cooldowns[skillId] || 10000;
}

/**
 * 生成随机道具类型
 * @returns {string} 道具类型
 */
export function getRandomItemType() {
  const itemTypes = ['power', 'bomb', 'shield', 'weapon'];
  const weights = [0.35, 0.25, 0.25, 0.15];
  let cumulative = 0;
  const random = Math.random();
  
  for (let i = 0; i < itemTypes.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return itemTypes[i];
    }
  }
  return 'power';
}

/**
 * 生成随机敌人类型
 * @returns {string} 敌人类型
 */
export function getRandomEnemyType() {
  const types = ['normal', 'fast', 'tank', 'shooter', 'bomber', 'splitter'];
  const weights = [0.4, 0.2, 0.12, 0.08, 0.12, 0.08];
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return types[i];
    }
  }
  return 'normal';
}

/**
 * 获取敌人配置
 * @param {string} type - 敌人类型
 * @param {number} gameWidth - 游戏宽度
 * @param {number} baseSpeed - 基础速度
 * @param {number} baseSize - 基础大小
 * @returns {Object} 敌人配置
 */
export function getEnemyConfig(type, gameWidth, baseSpeed, baseSize) {
  const configs = {
    normal: { hp: 1, speed: baseSpeed, size: baseSize, score: 10 },
    fast: { hp: 1, speed: baseSpeed * 1.5, size: baseSize * 0.7, score: 20 },
    tank: { hp: 5, speed: baseSpeed * 0.5, size: baseSize * 1.3, score: 50 },
    shooter: { hp: 2, speed: baseSpeed * 0.7, size: baseSize * 1.1, score: 30 },
    bomber: { hp: 3, speed: baseSpeed * 0.8, size: baseSize * 1.2, score: 40 },
    splitter: { hp: 2, speed: baseSpeed * 1.2, size: baseSize * 0.9, score: 25 }
  };
  return configs[type] || configs.normal;
}

/**
 * 获取下一个武器
 * @param {string} currentWeapon - 当前武器
 * @returns {string} 下一个武器
 */
export function getNextWeapon(currentWeapon) {
  const weapons = ['normal', 'laser', 'spread'];
  const currentIndex = weapons.indexOf(currentWeapon);
  return weapons[(currentIndex + 1) % weapons.length];
}

/**
 * 执行技能效果
 * @param {string} skillId - 技能ID
 * @param {Object} refs - 游戏refs对象
 * @param {Function} setBoss - 设置Boss的函数
 */
export function executeSkill(skillId, refs, setBoss) {
  const { enemiesRef, playerRef, boss } = refs;
  
  switch (skillId) {
    case 'timeSlow':
      // 时间减缓 - 减慢所有敌人速度50%，持续3秒
      enemiesRef.current.forEach(enemy => {
        enemy.originalSpeed = enemy.speed;
        enemy.speed *= 0.5;
      });
      if (boss) {
        boss.originalSpeed = boss.speed;
        boss.speed *= 0.5;
      }
      setTimeout(() => {
        enemiesRef.current.forEach(enemy => {
          if (enemy.originalSpeed !== undefined) {
            enemy.speed = enemy.originalSpeed;
            delete enemy.originalSpeed;
          }
        });
        if (boss) {
          boss.speed = boss.originalSpeed;
          delete boss.originalSpeed;
        }
      }, 3000);
      break;
      
    case 'areaDamage':
      // 范围伤害 - 对所有敌人造成50点伤害
      enemiesRef.current.forEach(enemy => {
        enemy.hp -= 50;
        if (enemy.hp <= 0) {
          // 处理敌人死亡 - 由游戏循环处理
        }
      });
      if (boss) {
        boss.hp -= 50;
        if (boss.hp <= 0) {
          setBoss(null);
        }
      }
      break;
      
    case 'autoAim':
      // 自动瞄准 - 玩家子弹自动追踪，持续5秒
      playerRef.current.autoAim = true;
      setTimeout(() => {
        playerRef.current.autoAim = false;
      }, 5000);
      break;
      
    case 'energyShield':
      // 能量护盾 - 生成100点护盾，持续8秒
      playerRef.current.energyShield = 100;
      setTimeout(() => {
        playerRef.current.energyShield = 0;
      }, 8000);
      break;
  }
}

/**
 * 创建爆炸粒子
 * @param {number} count - 粒子数量
 * @param {Function} getParticle - 从对象池获取粒子的函数
 * @returns {Array} 粒子数组
 */
export function createExplosionParticles(count, getParticle) {
  const particles = [];
  const colors = ['#ff6b6b', '#ffd93d', '#ff8800', '#ff0000'];
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    particles.push(getParticle({
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }
  return particles;
}

/**
 * 获取连击奖励分数
 * @param {number} combo - 连击数
 * @returns {number} 奖励分数
 */
export function getComboBonus(combo) {
  return Math.floor(Math.log(combo + 1) * 10);
}

/**
 * 检查是否应该生成Boss
 * @param {number} level - 当前等级
 * @param {number} stage - 当前关卡
 * @returns {boolean} 是否生成Boss
 */
export function shouldSpawnBoss(level, stage) {
  return level % 5 === 0 && stage < Math.floor((level - 1) / 5) + 1;
}

/**
 * 创建Boss配置
 * @param {number} gameWidth - 游戏宽度
 * @param {number} stage - 当前关卡
 * @param {number} baseSpeed - 基础速度
 * @param {number} baseSize - 基础大小
 * @returns {Object} Boss配置
 */
export function createBossConfig(gameWidth, stage, baseSpeed, baseSize) {
  const bossSize = baseSize * 3;
  const bossHp = 20 + (stage - 1) * 10;
  
  return {
    x: gameWidth / 2 - bossSize / 2,
    y: -bossSize,
    type: 'boss',
    hp: bossHp,
    maxHp: bossHp,
    speed: baseSpeed * 0.3,
    size: bossSize,
    score: bossHp * 10,
    id: Date.now(),
    lastShot: 0,
    phase: 1,
    movePattern: 'horizontal'
  };
}