// Boss相关逻辑
import { createBossConfig } from './gameUtils';
import {
  BULLET_WIDTH,
  BULLET_HEIGHT,
  BULLET_SPEED,
  ENEMY_SIZE,
  BOSS_CONFIG,
  GAME_WIDTH,
  GAME_HEIGHT
} from './gameConstants';

/**
 * 处理Boss行为
 * @param {Object} boss - Boss对象
 * @param {Object} refs - 游戏refs
 * @param {Object} pool - 对象池
 * @param {number} now - 当前时间
 * @param {Function} playSound - 播放音效函数
 * @returns {Object} 更新后的Boss
 */
export function handleBoss(boss, refs, pool, now, playSound) {
  let newBoss = { ...boss };
  newBoss.y += newBoss.speed;
  
  // Boss移动模式
  if (newBoss.movePattern === 'horizontal') {
    newBoss.x += Math.sin(now / 1000) * 3;
    if (newBoss.x <= 0 || newBoss.x >= GAME_WIDTH - newBoss.size) {
      newBoss.movePattern = 'vertical';
    }
  } else {
    newBoss.y += Math.sin(now / 800) * 2;
    if (newBoss.y <= 50 || newBoss.y >= GAME_HEIGHT * 0.4) {
      newBoss.movePattern = 'horizontal';
    }
  }
  
  // Boss攻击模式
  if (now - newBoss.lastShot > BOSS_CONFIG.shootInterval) {
    const player = refs.playerRef.current;
    
    if (newBoss.phase === 1) {
      // 第一阶段：三连射
      for (let i = -1; i <= 1; i++) {
        const angle = Math.atan2(
          player.y - (newBoss.y + newBoss.size / 2),
          player.x - (newBoss.x + newBoss.size / 2)
        ) + i * 0.2;
        const speed = BULLET_SPEED * 0.7;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const bossBullet = pool.getBullet(() => ({
          x: newBoss.x + newBoss.size / 2 - BULLET_WIDTH / 2,
          y: newBoss.y + newBoss.size / 2,
          vx,
          vy,
          damage: -3,
          isEnemy: true,
          id: now + Math.random() + i,
          prevX: undefined,
          prevY: undefined
        }));
        refs.bulletsRef.current.push(bossBullet);
      }
    } else if (newBoss.phase === 2) {
      // 第二阶段：全方位射击
      for (let i = 0; i < BOSS_CONFIG.phase2BulletCount; i++) {
        const angle = (i * Math.PI * 2) / BOSS_CONFIG.phase2BulletCount;
        const speed = BULLET_SPEED * 0.6;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const bossBullet = pool.getBullet(() => ({
          x: newBoss.x + newBoss.size / 2 - BULLET_WIDTH / 2,
          y: newBoss.y + newBoss.size / 2,
          vx,
          vy,
          damage: -2,
          isEnemy: true,
          id: now + Math.random() + i,
          prevX: undefined,
          prevY: undefined
        }));
        refs.bulletsRef.current.push(bossBullet);
      }
    }
    
    newBoss.lastShot = now;
    
    // 播放Boss射击音效
    if (typeof playSound === 'function') {
      playSound('enemyShoot');
    }
    
    // 阶段转换
    if (newBoss.hp <= newBoss.maxHp * BOSS_CONFIG.phase2HpRatio && newBoss.phase === 1) {
      newBoss.phase = 2;
    }
  }
  
  return newBoss;
}