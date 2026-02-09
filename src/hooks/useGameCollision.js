import { useCallback } from 'react';
import {
  rectCircleIntersect,
  segmentCircleIntersect,
  rectIntersect,
  getRandomItemType
} from './gameUtils';
import { PLAYER_SIZE, BULLET_WIDTH, BULLET_HEIGHT } from './gameConstants';

// 将椭圆碰撞转换为单位圆碰撞（通过坐标缩放），以复用现有的 circle/segment 工具函数
function rectEllipseIntersect(rectX, rectY, rectW, rectH, ellipseCx, ellipseCy, ellipseRx, ellipseRy) {
  // 避免除 0
  if (!ellipseRx || !ellipseRy) return false;
  const x = (rectX - ellipseCx) / ellipseRx;
  const y = (rectY - ellipseCy) / ellipseRy;
  const w = rectW / ellipseRx;
  const h = rectH / ellipseRy;
  return rectCircleIntersect(x, y, w, h, 0, 0, 1);
}

function segmentEllipseIntersect(x1, y1, x2, y2, ellipseCx, ellipseCy, ellipseRx, ellipseRy) {
  if (!ellipseRx || !ellipseRy) return false;
  const sx1 = (x1 - ellipseCx) / ellipseRx;
  const sy1 = (y1 - ellipseCy) / ellipseRy;
  const sx2 = (x2 - ellipseCx) / ellipseRx;
  const sy2 = (y2 - ellipseCy) / ellipseRy;
  return segmentCircleIntersect(sx1, sy1, sx2, sy2, 0, 0, 1);
}

/**
 * 游戏碰撞检测Hook
 * @returns {Object} 碰撞检测函数
 */
export function useGameCollision() {
  /**
   * 主要碰撞检测函数
   * @param {Object} refs - 游戏refs对象
   * @param {Object} gameState - 游戏状态
   * @param {Object} setters - 状态设置函数
   * @param {Object} pool - 对象池方法
   * @returns {Object} 碰撞检测结果
   */
  const checkCollisions = useCallback((refs, gameState, setters, pool, playSound) => {
    const { bulletsRef, enemiesRef, playerRef } = refs;
    const { combo, maxCombo } = gameState;
    const { setCombo, setMaxCombo } = setters;
    
    const hitBullets = new Set();
    const hitEnemies = new Map();
    const items = [];
    const deadEnemies = new Set();
    let enemyBulletHits = 0;

    const playerX = playerRef.current.x;
    const playerY = playerRef.current.y;
    const playerRadius = PLAYER_SIZE * 0.4;

    for (const enemy of enemiesRef.current) {
      const enemyCenterX = enemy.x + enemy.size / 2;
      const enemyCenterY = enemy.y + enemy.size / 2;
      const isBomber = enemy.type === 'bomber';
      const enemyRadius = enemy.size * 0.4;
      // 轰炸机绘制为椭圆：ctx.ellipse(x, y, size*0.6, size*0.8, ...)
      const bomberRx = enemy.size * 0.6;
      const bomberRy = enemy.size * 0.8;

      for (const bullet of bulletsRef.current) {
        if (hitBullets.has(bullet.id)) continue;

        const bulletX = bullet.x;
        const bulletY = bullet.y;
        const bulletW = bullet.width || BULLET_WIDTH;
        const bulletH = bullet.height || BULLET_HEIGHT;

        if (!bullet.isEnemy) {
          // 玩家子弹打敌人
          let hit = false;

          // 激光武器特殊处理：直接检查矩形与圆碰撞
          if (bullet.isLaser) {
            hit = isBomber
              ? rectEllipseIntersect(bulletX, bulletY, bulletW, bulletH, enemyCenterX, enemyCenterY, bomberRx, bomberRy)
              : rectCircleIntersect(bulletX, bulletY, bulletW, bulletH, enemyCenterX, enemyCenterY, enemyRadius);
          } else {
            // 普通子弹使用线段碰撞检测
            if (bullet.prevX !== undefined && bullet.prevY !== undefined) {
              const segHit = (x1, y1, x2, y2) =>
                isBomber
                  ? segmentEllipseIntersect(x1, y1, x2, y2, enemyCenterX, enemyCenterY, bomberRx, bomberRy)
                  : segmentCircleIntersect(x1, y1, x2, y2, enemyCenterX, enemyCenterY, enemyRadius);

              hit = segHit(bullet.prevX, bullet.prevY, bulletX, bulletY);
              if (!hit) hit = segHit(bullet.prevX + bulletW, bullet.prevY, bulletX + bulletW, bulletY);
              if (!hit) hit = segHit(bullet.prevX, bullet.prevY + bulletH, bulletX, bulletY + bulletH);
              if (!hit) hit = segHit(bullet.prevX + bulletW, bullet.prevY + bulletH, bulletX + bulletW, bulletY + bulletH);
              if (!hit) hit = segHit(bullet.prevX + bulletW/2, bullet.prevY + bulletH/2, bulletX + bulletW/2, bulletY + bulletH/2);
            }

            // 矩形与圆碰撞检测
            if (!hit) {
              hit = isBomber
                ? rectEllipseIntersect(bulletX, bulletY, bulletW, bulletH, enemyCenterX, enemyCenterY, bomberRx, bomberRy)
                : rectCircleIntersect(bulletX, bulletY, bulletW, bulletH, enemyCenterX, enemyCenterY, enemyRadius);
            }
          }

          if (hit) {
            hitBullets.add(bullet.id);
            const currentHp = hitEnemies.get(enemy.id) ?? enemy.hp;
            const newHp = currentHp - bullet.damage;
            hitEnemies.set(enemy.id, newHp);

            // 击中但未致死时播放音效
            if (newHp > 0) {
              playSound('hit');
            }

            if (newHp <= 0) {
              deadEnemies.add(enemy.id);
              
              // 连击系统
              const currentCombo = combo + 1;
              setCombo(currentCombo);
              if (currentCombo > maxCombo) {
                setMaxCombo(currentCombo);
              }
              


              // 道具掉落
              if (Math.random() < 0.12) {
                const itemType = getRandomItemType();
                
                items.push(pool.getItem({
                  x: enemyCenterX,
                  y: enemyCenterY,
                  type: itemType,
                  id: Date.now() + Math.random()
                }));
              }
            }
          }
        } else {
          // 敌人子弹打玩家
          let hit = false;

          if (bullet.prevX !== undefined && bullet.prevY !== undefined) {
            hit = segmentCircleIntersect(bullet.prevX, bullet.prevY, bulletX, bulletY, playerX, playerY, playerRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX + bulletW, bullet.prevY, bulletX + bulletW, bulletY, playerX, playerY, playerRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX, bullet.prevY + bulletH, bulletX, bulletY + bulletH, playerX, playerY, playerRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX + bulletW, bullet.prevY + bulletH, bulletX + bulletW, bulletY + bulletH, playerX, playerY, playerRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX + bulletW/2, bullet.prevY + bulletH/2, bulletX + bulletW/2, bulletY + bulletH/2, playerX, playerY, playerRadius);
          }

          if (!hit) {
            hit = rectCircleIntersect(bulletX, bulletY, bulletW, bulletH, playerX, playerY, playerRadius);
          }

          if (hit) {
            hitBullets.add(bullet.id);
            enemyBulletHits++;
          }
        }
      }
    }

    // 检测玩家与敌人碰撞
    let playerHitByEnemy = false;
    for (const enemy of enemiesRef.current) {
      if (deadEnemies.has(enemy.id)) continue;

      const playerRectX = playerX - PLAYER_SIZE/2;
      const playerRectY = playerY - PLAYER_SIZE/2;
      const hit = enemy.type === 'bomber'
        ? rectEllipseIntersect(
            playerRectX, playerRectY, PLAYER_SIZE, PLAYER_SIZE,
            enemy.x + enemy.size / 2, enemy.y + enemy.size / 2,
            enemy.size * 0.6, enemy.size * 0.8
          )
        : rectIntersect(
            playerRectX, playerRectY, PLAYER_SIZE, PLAYER_SIZE,
            enemy.x, enemy.y, enemy.size, enemy.size
          );

      if (hit) {
        deadEnemies.add(enemy.id);
        playerHitByEnemy = true;
      }
    }

    return { hitBullets, hitEnemies, items, deadEnemies, enemyBulletHits, playerHitByEnemy };
  }, []);

  /**
   * 检测Boss碰撞
   * @param {Object} boss - Boss对象
   * @param {Object} refs - 游戏refs对象
   * @param {Object} pool - 对象池方法
   * @param {Function} playSound - 播放音效函数
   * @returns {Object} 碰撞结果
   */
  const checkBossCollisions = useCallback((boss, refs, pool, playSound) => {
    const { bulletsRef, playerRef } = refs;
    const bossBulletsHit = new Set(); // 击中Boss的子弹ID
    let totalDamage = 0; // 总伤害
    let playerHitByBoss = false;
    const playerX = playerRef.current.x;
    const playerY = playerRef.current.y;
    const playerRadius = PLAYER_SIZE * 0.4;

    const bossCenterX = boss.x + boss.size / 2;
    const bossCenterY = boss.y + boss.size / 2;
    const bossRadius = boss.size * 0.45;

    // 检查玩家子弹是否击中Boss（包括激光武器）
    for (const bullet of bulletsRef.current) {
      if (!bullet.isEnemy) {
        const bulletX = bullet.x;
        const bulletY = bullet.y;
        const bulletW = bullet.width || BULLET_WIDTH;
        const bulletH = bullet.height || BULLET_HEIGHT;
        
        let hit = false;
        
        // 对于激光武器，需要特殊处理，因为激光是长矩形
        if (bullet.isLaser) {
          // 激光武器直接检查矩形与圆的碰撞
          hit = rectCircleIntersect(bulletX, bulletY, bulletW, bulletH, bossCenterX, bossCenterY, bossRadius);
        } else {
          // 普通子弹使用线段碰撞检测
          if (bullet.prevX !== undefined && bullet.prevY !== undefined) {
            hit = segmentCircleIntersect(bullet.prevX, bullet.prevY, bulletX, bulletY, bossCenterX, bossCenterY, bossRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX + bulletW, bullet.prevY, bulletX + bulletW, bulletY, bossCenterX, bossCenterY, bossRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX, bullet.prevY + bulletH, bulletX, bulletY + bulletH, bossCenterX, bossCenterY, bossRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX + bulletW, bullet.prevY + bulletH, bulletX + bulletW, bulletY + bulletH, bossCenterX, bossCenterY, bossRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX + bulletW/2, bullet.prevY + bulletH/2, bulletX + bulletW/2, bulletY + bulletH/2, bossCenterX, bossCenterY, bossRadius);
          }
          if (!hit) {
            hit = rectCircleIntersect(bulletX, bulletY, bulletW, bulletH, bossCenterX, bossCenterY, bossRadius);
          }
        }
        
         if (hit) {
           bossBulletsHit.add(bullet.id);
           // 子弹伤害添加到总伤害，对Boss增加伤害乘数
           let baseDamage = bullet.damage || 1;
           
           // 激光武器对Boss的伤害进行限制
           if (bullet.isLaser) {
             // 激光武器对Boss的最大伤害为4（即使玩家火力等级很高）
             baseDamage = Math.min(baseDamage, 4);
           }
           
           const bossDamageMultiplier = 2; // Boss伤害乘数
           const damage = baseDamage * bossDamageMultiplier;
           totalDamage += damage;
           playSound('hit');
         }
      }
      
      // Boss子弹击中玩家
      if (bullet.isEnemy) {
        const bulletX = bullet.x;
        const bulletY = bullet.y;
        const bulletW = bullet.width || BULLET_WIDTH;
        const bulletH = bullet.height || BULLET_HEIGHT;
        
        let hit = false;
        if (bullet.prevX !== undefined && bullet.prevY !== undefined) {
          hit = segmentCircleIntersect(bullet.prevX, bullet.prevY, bulletX, bulletY, playerX, playerY, playerRadius);
        }
        if (!hit) {
          hit = rectCircleIntersect(bulletX, bulletY, bulletW, bulletH, playerX, playerY, playerRadius);
        }
        
        if (hit) {
          playerHitByBoss = true;
        }
      }
    }

    // 检查玩家与Boss碰撞
    const playerHitBoss = rectIntersect(
      playerX - PLAYER_SIZE/2, playerY - PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE,
      boss.x, boss.y, boss.size, boss.size
    );

    return { bossBulletsHit, totalDamage, playerHitByBoss, playerHitBoss };
  }, []);

  return {
    checkCollisions,
    checkBossCollisions
  };
}