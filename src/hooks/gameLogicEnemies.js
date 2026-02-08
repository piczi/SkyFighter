// 敌人相关逻辑
import { getRandomEnemyType, getEnemyConfig } from './gameUtils';
import {
  BULLET_WIDTH,
  BULLET_HEIGHT,
  BULLET_SPEED,
  ENEMY_SPEED,
  ENEMY_SIZE,
  SPAWN_INTERVAL,
  GAME_WIDTH,
  GAME_HEIGHT
} from './gameConstants';

/**
 * 生成敌人
 * @param {Object} gameState - 游戏状态
 * @param {Object} pool - 对象池
 * @param {number} level - 当前等级
 * @returns {Object|null} 新敌人或null
 */
export function spawnEnemy(gameState, pool, level) {
  const { lastSpawn, now } = gameState;
  const spawnRate = Math.max(500, SPAWN_INTERVAL - level * 100);
  
  if (now - lastSpawn > spawnRate) {
    const type = getRandomEnemyType();
    const config = getEnemyConfig(type, GAME_WIDTH, ENEMY_SPEED, ENEMY_SIZE);
    
    return pool.getEnemy(() => ({
      x: Math.random() * (GAME_WIDTH - config.size),
      y: -config.size,
      type,
      hp: config.hp,
      maxHp: config.hp,
      speed: config.speed,
      size: config.size,
      score: config.score,
      id: now,
      lastShot: 0
    }));
  }
  return null;
}

/**
 * 处理射击敌机行为
 * @param {Object} enemy - 敌人对象
 * @param {Object} refs - 游戏refs
 * @param {Object} pool - 对象池
 * @param {number} now - 当前时间
 * @param {Function} playSound - 播放音效函数
 */
export function handleShooterEnemy(enemy, refs, pool, now, playSound) {
  if (now - enemy.lastShot > 2000) {
    const player = refs.playerRef.current;
    const dx = player.x - (enemy.x + enemy.size / 2);
    const dy = player.y - (enemy.y + enemy.size / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = BULLET_SPEED * 0.6;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    const enemyBullet = pool.getBullet(() => ({
      x: enemy.x + enemy.size / 2 - BULLET_WIDTH / 2,
      y: enemy.y + enemy.size / 2,
      vx,
      vy,
      damage: -1,
      isEnemy: true,
      id: now + Math.random(),
      prevX: undefined,
      prevY: undefined
    }));
    
    refs.bulletsRef.current.push(enemyBullet);
    playSound('enemyShoot');
    return { ...enemy, lastShot: now };
  }
  return enemy;
}

/**
 * 处理轰炸敌机行为
 * @param {Object} enemy - 敌人对象
 * @param {Object} refs - 游戏refs
 * @param {Object} pool - 对象池
 * @param {number} now - 当前时间
 * @param {Function} playSound - 播放音效函数
 */
export function handleBomberEnemy(enemy, refs, pool, now, playSound) {
  if (enemy.y > GAME_HEIGHT * 0.3 && !enemy.hasDropped) {
    for (let i = -1; i <= 1; i++) {
      const angle = Math.PI / 2 + i * 0.3;
      const bombSpeed = BULLET_SPEED * 0.8;
      const vx = Math.sin(angle) * bombSpeed;
      const vy = Math.cos(angle) * bombSpeed;
      
      const bomberBomb = pool.getBullet(() => ({
        x: enemy.x + enemy.size / 2 - BULLET_WIDTH / 2,
        y: enemy.y + enemy.size / 2,
        vx,
        vy,
        damage: -2,
        isEnemy: true,
        id: now + Math.random() + i,
        prevX: undefined,
        prevY: undefined
      }));
      refs.bulletsRef.current.push(bomberBomb);
    }
    playSound('enemyShoot');
    return { ...enemy, hasDropped: true };
  }
  return enemy;
}

/**
 * 处理分裂敌机行为
 * @param {Object} enemy - 敌人对象
 * @param {Object} refs - 游戏refs
 * @param {Object} pool - 对象池
 * @param {number} now - 当前时间
 * @param {number} baseSpeed - 基础速度
 * @param {number} baseSize - 基础大小
 */
export function handleSplitterEnemy(enemy, refs, pool, now, baseSpeed, baseSize) {
  if (enemy.hp <= 0 && !enemy.hasSplit) {
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI / 3) + Math.PI / 6;
      const splitSpeed = baseSpeed * 1.8;
      const vx = Math.cos(angle) * splitSpeed;
      const vy = Math.sin(angle) * splitSpeed;
      
      const smallEnemy = pool.getEnemy(() => ({
        x: enemy.x + enemy.size / 2,
        y: enemy.y + enemy.size / 2,
        type: 'fast',
        hp: 1,
        maxHp: 1,
        speed: baseSpeed * 1.5,
        size: baseSize * 0.5,
        score: 15,
        id: now + Math.random() + i,
        lastShot: 0,
        vx,
        vy
      }));
      refs.enemiesRef.current.push(smallEnemy);
    }
    return { ...enemy, hasSplit: true };
  }
  return enemy;
}