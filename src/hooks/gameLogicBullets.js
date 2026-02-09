// 子弹相关逻辑
import {
  PLAYER_SIZE,
  BULLET_WIDTH,
  BULLET_HEIGHT,
  SHOOT_INTERVAL,
  BULLET_SPEED,
  GAME_HEIGHT,
  GAME_WIDTH
} from './gameConstants';

/**
 * 创建玩家子弹
 * @param {Object} player - 玩家对象
 * @param {number} now - 当前时间
 * @param {Function} getBullet - 获取子弹函数
 * @returns {Array} 子弹数组
 */
export function createPlayerBullets(player, now, getBullet) {
  const newBullets = [];

  // 普通武器
  if (player.weapon === 'normal') {
    if (player.power >= 1) {
      // 单发：完全居中
      newBullets.push(getBullet(() => ({ 
        x: player.x, 
        y: player.y - BULLET_HEIGHT, 
        damage: 1, 
        id: now,
        prevX: undefined,
        prevY: undefined
      })));
    }
    if (player.power >= 2) {
      // 双发：对称分布在中心两侧
      const offset = BULLET_WIDTH;
      newBullets.push(getBullet(() => ({ 
        x: player.x - offset, 
        y: player.y - BULLET_HEIGHT, 
        damage: 1, 
        id: now + 1,
        prevX: undefined,
        prevY: undefined
      })));
      newBullets.push(getBullet(() => ({ 
        x: player.x + offset, 
        y: player.y - BULLET_HEIGHT, 
        damage: 1, 
        id: now + 2,
        prevX: undefined,
        prevY: undefined
      })));
    }
    if (player.power >= 3) {
      // 三发：中心 + 两侧对称
      const sideOffset = BULLET_WIDTH * 1.5;
      newBullets.push(getBullet(() => ({ 
        x: player.x - sideOffset, 
        y: player.y - BULLET_HEIGHT, 
        damage: 1, 
        id: now + 3,
        prevX: undefined,
        prevY: undefined
      })));
      newBullets.push(getBullet(() => ({ 
        x: player.x, 
        y: player.y - BULLET_HEIGHT, 
        damage: 1, 
        id: now + 4,
        prevX: undefined,
        prevY: undefined
      })));
      newBullets.push(getBullet(() => ({ 
        x: player.x + sideOffset, 
        y: player.y - BULLET_HEIGHT, 
        damage: 1, 
        id: now + 5,
        prevX: undefined,
        prevY: undefined
      })));
    }
  }
  // 激光武器
  else if (player.weapon === 'laser') {
    const laserDamage = player.power;
    newBullets.push(getBullet(() => ({ 
      x: player.x - 2, 
      y: player.y - 300, // 激光从玩家上方300像素处开始，覆盖更大的区域
      width: 4,
      height: 300,
      damage: laserDamage, 
      id: now,
      isLaser: true,
      prevX: undefined,
      prevY: undefined
    })));
  }
  // 散射武器
  else if (player.weapon === 'spread') {
    // 对称的角度分布，确保居中
    const angles = [-0.4, -0.2, 0, 0.2, 0.4];
    const bulletCount = Math.min(player.power + 1, angles.length);
    
    // 确保总是有居中的子弹
    newBullets.push(getBullet(() => ({ 
      x: player.x, 
      y: player.y - BULLET_HEIGHT, 
      damage: 1, 
      angle: 0,
      id: now,
      prevX: undefined,
      prevY: undefined
    })));
    
    // 添加对称的侧边子弹
    for (let i = 1; i < bulletCount && i <= 2; i++) {
      // 左侧
      newBullets.push(getBullet(() => ({ 
        x: player.x, 
        y: player.y - BULLET_HEIGHT, 
        damage: 1, 
        angle: angles[2 - i], // -0.2, -0.4
        id: now + i * 2 - 1,
        prevX: undefined,
        prevY: undefined
      })));
      // 右侧
      newBullets.push(getBullet(() => ({ 
        x: player.x, 
        y: player.y - BULLET_HEIGHT, 
        damage: 1, 
        angle: angles[2 + i], // 0.2, 0.4
        id: now + i * 2,
        prevX: undefined,
        prevY: undefined
      })));
    }
  }

  return newBullets;
}

/**
 * 更新子弹位置
 * @param {Array} bullets - 子弹数组
 * @param {Function} returnBullet - 返回子弹到池的函数
 * @returns {Array} 更新后的子弹索引数组（需要移除的）
 */
export function updateBullets(bullets, returnBullet) {
  const bulletsToRemove = [];
  
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    let newX = bullet.x;
    let newY = bullet.y;

    if (bullet.vx !== undefined || bullet.vy !== undefined) {
      newX = (bullet.x || 0) + (bullet.vx || 0);
      newY = (bullet.y || 0) + (bullet.vy || 0);
    } else if (bullet.angle) {
      newX = bullet.x + Math.sin(bullet.angle) * BULLET_SPEED;
      newY = bullet.y - Math.cos(bullet.angle) * BULLET_SPEED;
    } else {
      newY = bullet.y - (bullet.isEnemy ? BULLET_SPEED * 0.6 : BULLET_SPEED);
    }

    bullet.prevX = bullet.x;
    bullet.prevY = bullet.y;
    bullet.x = newX;
    bullet.y = newY;

    // 检查是否需要移除
    const bulletHeight = bullet.height || BULLET_HEIGHT;
    const bulletWidth = bullet.width || BULLET_WIDTH;
    
    // 激光武器特殊处理：只在完全移出屏幕时移除
    if (bullet.isLaser) {
      if (bullet.y <= -bulletHeight || bullet.y >= GAME_HEIGHT + 100) {
        bulletsToRemove.push(i);
        returnBullet(bullet);
      }
    } else if (bullet.y <= -bulletHeight || bullet.y >= GAME_HEIGHT + bulletHeight ||
        bullet.x <= -bulletWidth || bullet.x >= GAME_WIDTH + bulletWidth) {
      bulletsToRemove.push(i);
      returnBullet(bullet);
    }
  }

  return bulletsToRemove;
}