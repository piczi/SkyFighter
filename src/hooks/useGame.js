// 飞机大战游戏 Hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSound } from './useSound';

// 矩形与圆相交检测
function rectCircleIntersect(rx, ry, rw, rh, cx, cy, radius) {
  const closestX = Math.max(rx, Math.min(rx + rw, cx));
  const closestY = Math.max(ry, Math.min(ry + rh, cy));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < radius * radius;
}

// 线段与圆相交检测
function segmentCircleIntersect(x1, y1, x2, y2, cx, cy, radius) {
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

// 矩形与矩形相交检测
function rectIntersect(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
  return r1x < r2x + r2w && r1x + r1w > r2x && r1y < r2y + r2h && r1y + r1h > r2y;
}

// 游戏常量
const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const PLAYER_SIZE = 50;
const BULLET_WIDTH = 8;
const BULLET_HEIGHT = 20;
const ENEMY_SIZE = 45;
const PLAYER_SPEED = 30;
const BULLET_SPEED = 15;
const ENEMY_SPEED = 3;
const SPAWN_INTERVAL = 1200;
const SHOOT_INTERVAL = 200;

export function useGame() {
  const { soundEnabled, playSound } = useSound();
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [player, setPlayer] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, hp: 100, power: 1, shield: 0 });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [items, setItems] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [bombCount, setBombCount] = useState(3);

  const gameLoopRef = useRef(null);
  const lastShootRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const scoreRef = useRef(0);
  const enemiesRef = useRef([]);
  const bulletsRef = useRef([]);
  const playerRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, hp: 100, power: 1, shield: 0 });
  const lastPlayerStateRef = useRef(null);
  const touchPositionRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 });
  const isTouchingRef = useRef(false);

  // 开始游戏
  const startGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setLevel(1);
    const initialPlayer = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, hp: 100, power: 1, shield: 0 };
    playerRef.current = initialPlayer;
    setPlayer(initialPlayer);
    bulletsRef.current = [];
    setBullets([]);
    enemiesRef.current = [];
    setEnemies([]);
    setItems([]);
    setExplosions([]);
    setBombCount(3);
    setGameState('playing');
    lastShootRef.current = 0;
    lastSpawnRef.current = 0;
  }, []);

  // 暂停游戏
  const togglePause = useCallback(() => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  }, []);

  // 使用炸弹
  const useHandleBomb = useCallback(() => {
    if (bombCount > 0 && gameState === 'playing') {
      setBombCount(prev => prev - 1);
      playSound('bomb');
      enemiesRef.current.forEach(enemy => {
        const particles = [];
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5 + 2;
          particles.push({
            x: 0,
            y: 0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            size: Math.random() * 8 + 4,
            color: Math.random() > 0.5 ? '#ff6b6b' : Math.random() > 0.5 ? '#ffd93d' : '#ff8800'
          });
        }
        setExplosions(prev => [
          ...prev,
          {
            x: enemy.x + enemy.size / 2,
            y: enemy.y + enemy.size / 2,
            id: Date.now() + Math.random(),
            particles
          }
        ]);
        scoreRef.current += enemy.score;
      });
      setEnemies([]);
      enemiesRef.current = [];
      setScore(scoreRef.current);
    }
  }, [bombCount, gameState]);

  // 处理触摸/鼠标移动
  const handleMove = useCallback((x, y) => {
    touchPositionRef.current = { x, y };
    isTouchingRef.current = true;
  }, []);

  // 处理触摸/鼠标结束
  const handleEnd = useCallback(() => {
    isTouchingRef.current = false;
  }, []);

  // 碰撞检测
  const checkCollisions = useCallback((bulletsRef, enemiesRef, playerRef) => {
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
      const enemyRadius = enemy.size * 0.4;

      for (const bullet of bulletsRef.current) {
        if (hitBullets.has(bullet.id)) continue;

        const bulletX = bullet.x;
        const bulletY = bullet.y;
        const bulletW = BULLET_WIDTH;
        const bulletH = BULLET_HEIGHT;

        if (!bullet.isEnemy) {
          // 玩家子弹打敌人
          let hit = false;

          if (bullet.prevX !== undefined && bullet.prevY !== undefined) {
            hit = segmentCircleIntersect(bullet.prevX, bullet.prevY, bulletX, bulletY, enemyCenterX, enemyCenterY, enemyRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX + bulletW, bullet.prevY, bulletX + bulletW, bulletY, enemyCenterX, enemyCenterY, enemyRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX, bullet.prevY + bulletH, bulletX, bulletY + bulletH, enemyCenterX, enemyCenterY, enemyRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX + bulletW, bullet.prevY + bulletH, bulletX + bulletW, bulletY + bulletH, enemyCenterX, enemyCenterY, enemyRadius);
            if (!hit) hit = segmentCircleIntersect(bullet.prevX + bulletW/2, bullet.prevY + bulletH/2, bulletX + bulletW/2, bulletY + bulletH/2, enemyCenterX, enemyCenterY, enemyRadius);
          }

          if (!hit) {
            hit = rectCircleIntersect(bulletX, bulletY, bulletW, bulletH, enemyCenterX, enemyCenterY, enemyRadius);
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
              scoreRef.current += enemy.score;

              if (Math.random() < 0.1) {
                const itemTypes = ['power', 'bomb', 'shield'];
                const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                items.push({
                  x: enemyCenterX,
                  y: enemyCenterY,
                  type: itemType,
                  id: Date.now() + Math.random()
                });
              }
            }
          }
        }
        else {
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
    for (const enemy of enemiesRef.current) {
      if (deadEnemies.has(enemy.id)) continue;

      const hit = rectIntersect(
        playerX - PLAYER_SIZE/2, playerY - PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE,
        enemy.x, enemy.y, enemy.size, enemy.size
      );

      if (hit) {
        deadEnemies.add(enemy.id);
        scoreRef.current += enemy.score;
      }
    }

    return { hitBullets, hitEnemies, items, deadEnemies, enemyBulletHits };
  }, []);

  // 游戏循环
  useEffect(() => {
    const gameLoop = () => {
      if (gameState !== 'playing') {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const now = Date.now();
      let playerMoved = false;
      let playerStateChanged = false;

      // 更新玩家位置 (直接跟随鼠标)
      if (isTouchingRef.current) {
        const targetX = touchPositionRef.current.x;
        const targetY = touchPositionRef.current.y;

        const newX = Math.max(PLAYER_SIZE / 2, Math.min(GAME_WIDTH - PLAYER_SIZE / 2, targetX));
        const newY = Math.max(PLAYER_SIZE / 2, Math.min(GAME_HEIGHT - PLAYER_SIZE / 2, targetY));

        if (playerRef.current.x !== newX || playerRef.current.y !== newY) {
          playerRef.current = { ...playerRef.current, x: newX, y: newY };
          playerMoved = true;
        }
      }

      // 射击
      if (now - lastShootRef.current > SHOOT_INTERVAL) {
        const p = playerRef.current;
        const newBullets = [];

        if (p.power >= 1) {
          newBullets.push({ x: p.x - BULLET_WIDTH / 2, y: p.y - BULLET_HEIGHT, damage: 1, id: now });
        }
        if (p.power >= 2) {
          newBullets.push({ x: p.x - BULLET_WIDTH * 1.5, y: p.y - BULLET_HEIGHT + 10, damage: 1, id: now + 1 });
          newBullets.push({ x: p.x + BULLET_WIDTH * 0.5, y: p.y - BULLET_HEIGHT + 10, damage: 1, id: now + 2 });
        }
        if (p.power >= 3) {
          newBullets.push({ x: p.x - BULLET_WIDTH * 2.5, y: p.y - BULLET_HEIGHT + 20, damage: 1, angle: -0.1, id: now + 3 });
          newBullets.push({ x: p.x + BULLET_WIDTH * 1.5, y: p.y - BULLET_HEIGHT + 20, damage: 1, angle: 0.1, id: now + 4 });
        }

        // 只有在真正发射子弹时才播放音效
        if (newBullets.length > 0) {
          playSound('shoot');
        }

        bulletsRef.current = [...bulletsRef.current, ...newBullets];
        lastShootRef.current = now;
      }

      // 生成敌人
      const spawnRate = Math.max(500, SPAWN_INTERVAL - level * 100);
      if (now - lastSpawnRef.current > spawnRate) {
        const types = ['normal', 'fast', 'tank', 'shooter'];
        const weights = [0.5, 0.25, 0.15, 0.1];
        const random = Math.random();
        let type = 'normal';
        let cumulative = 0;

        for (let i = 0; i < types.length; i++) {
          cumulative += weights[i];
          if (random < cumulative) {
            type = types[i];
            break;
          }
        }

        const enemyConfigs = {
          normal: { hp: 1, speed: ENEMY_SPEED, size: ENEMY_SIZE, score: 10 },
          fast: { hp: 1, speed: ENEMY_SPEED * 1.5, size: ENEMY_SIZE * 0.7, score: 20 },
          tank: { hp: 5, speed: ENEMY_SPEED * 0.5, size: ENEMY_SIZE * 1.3, score: 50 },
          shooter: { hp: 2, speed: ENEMY_SPEED * 0.7, size: ENEMY_SIZE * 1.1, score: 30 }
        };

        const config = enemyConfigs[type];
        enemiesRef.current.push({
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
        });
        lastSpawnRef.current = now;
      }

      // 更新敌人位置
      enemiesRef.current = enemiesRef.current.map(enemy => {
        let newEnemy = { ...enemy, y: enemy.y + enemy.speed };
        if (enemy.type === 'shooter') {
          if (now - enemy.lastShot > 2000) {
            const player = playerRef.current;
            const dx = player.x - (enemy.x + enemy.size / 2);
            const dy = player.y - (enemy.y + enemy.size / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = BULLET_SPEED * 0.6;
            const vx = (dx / dist) * speed;
            const vy = (dy / dist) * speed;

            bulletsRef.current.push({
              x: enemy.x + enemy.size / 2 - BULLET_WIDTH / 2,
              y: enemy.y + enemy.size / 2,
              vx,
              vy,
              damage: -1,
              isEnemy: true,
              id: now + Math.random()
            });
            newEnemy.lastShot = now;
            playSound('enemyShoot');
          }
        }
        return newEnemy;
      });

      // 更新子弹位置
      bulletsRef.current = bulletsRef.current.map(bullet => {
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

        return { ...bullet, prevX: bullet.x, prevY: bullet.y, x: newX, y: newY };
      }).filter(bullet =>
        bullet.y > -BULLET_HEIGHT && bullet.y < GAME_HEIGHT + BULLET_HEIGHT &&
        bullet.x > -BULLET_WIDTH && bullet.x < GAME_WIDTH + BULLET_WIDTH
      );

      // 碰撞检测
      const collisionResult = checkCollisions(bulletsRef, enemiesRef, playerRef);

      // 移除被击中的子弹
      bulletsRef.current = bulletsRef.current.filter(b => !collisionResult.hitBullets.has(b.id));

      // 更新敌人HP
      for (const [enemyId, newHp] of collisionResult.hitEnemies) {
        const enemy = enemiesRef.current.find(e => e.id === enemyId);
        if (enemy) {
          enemy.hp = newHp;
        }
      }

      // 处理死亡敌人
      const deadEnemiesList = enemiesRef.current.filter(e => collisionResult.deadEnemies.has(e.id));
      enemiesRef.current = enemiesRef.current.filter(e => !collisionResult.deadEnemies.has(e.id) && e.y < GAME_HEIGHT + e.size);

      // 敌人子弹伤害
      const enemyBulletDamage = collisionResult.enemyBulletHits * 10;

      if (enemyBulletDamage > 0) {
        if (playerRef.current.shield <= 0) {
          playerRef.current.hp = Math.max(0, playerRef.current.hp - enemyBulletDamage);
          if (playerRef.current.hp <= 0) {
            setGameState('gameover');
            playSound('gameOver');
          }
        } else {
          const totalDamage = enemyBulletDamage;
          if (playerRef.current.shield >= totalDamage) {
            playerRef.current.shield -= totalDamage;
          } else {
            const remaining = totalDamage - playerRef.current.shield;
            playerRef.current.shield = 0;
            playerRef.current.hp = Math.max(0, playerRef.current.hp - remaining);
            if (playerRef.current.hp <= 0) {
              setGameState('gameover');
              playSound('gameOver');
            }
          }
        }
        playerStateChanged = true;
        playSound('playerHit');
      }

      // 检测玩家与敌人碰撞
      for (const enemy of enemiesRef.current) {
        const hit = rectIntersect(
          playerRef.current.x - PLAYER_SIZE/2, playerRef.current.y - PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE,
          enemy.x, enemy.y, enemy.size, enemy.size
        );

        if (hit) {
          collisionResult.deadEnemies.add(enemy.id);
          scoreRef.current += enemy.score;
          playerRef.current.hp = Math.max(0, playerRef.current.hp - 30);
          playerStateChanged = true;
          playSound('playerHit');
          if (playerRef.current.hp <= 0) {
            setGameState('gameover');
            playSound('gameOver');
          }
        }
      }

      // 移除碰撞死亡的敌人
      enemiesRef.current = enemiesRef.current.filter(e => !collisionResult.deadEnemies.has(e.id) && e.y < GAME_HEIGHT + e.size);

      // 爆炸效果
      deadEnemiesList.forEach(enemy => {
        const particles = [];
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 2;
          particles.push({
            x: 0,
            y: 0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            size: Math.random() * 6 + 3,
            color: Math.random() > 0.5 ? '#ff6b6b' : Math.random() > 0.5 ? '#ffd93d' : '#ff8800'
          });
        }
        setExplosions(prev => [
          ...prev,
          {
            x: enemy.x + enemy.size / 2,
            y: enemy.y + enemy.size / 2,
            id: Date.now() + Math.random(),
            particles
          }
        ]);
        playSound('explosion');
      });

      // 更新玩家状态 (仅当非位置属性改变时才更新 State，避免每帧重渲染)
      const currentPlayerState = playerRef.current;
      const lastState = lastPlayerStateRef.current ? JSON.parse(lastPlayerStateRef.current) : null;
      
      const statsChanged = 
        !lastState ||
        currentPlayerState.hp !== lastState.hp || 
        currentPlayerState.shield !== lastState.shield || 
        currentPlayerState.power !== lastState.power;

      if (statsChanged) {
        setPlayer({ ...currentPlayerState });
        lastPlayerStateRef.current = JSON.stringify(currentPlayerState);
      }

      // 更新分数 (仅当分数改变时)
      if (scoreRef.current !== score) {
        setScore(scoreRef.current);
      }

      // 更新等级
      const newLevel = Math.floor(scoreRef.current / 500) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
      }

      // 添加新道具
      if (collisionResult.items.length > 0) {
        setItems(prev => [...prev, ...collisionResult.items]);
      }

      // 更新道具位置
      setItems(prev =>
        prev.map(item => ({ ...item, y: item.y + 3 })).filter(item => item.y < GAME_HEIGHT)
      );

      // 检测玩家吃道具
      setItems(currentItems => {
        return currentItems.filter(item => {
          const collected =
            Math.abs(item.x - playerRef.current.x) < PLAYER_SIZE &&
            Math.abs(item.y - playerRef.current.y) < PLAYER_SIZE;

          if (collected) {
            if (item.type === 'power') {
              playerRef.current.power = Math.min(5, playerRef.current.power + 1);
              playSound('powerUp');
            } else if (item.type === 'bomb') {
              setBombCount(prev => prev + 1);
              playSound('bombItem');
            } else if (item.type === 'shield') {
              playerRef.current.shield = Math.min(100, playerRef.current.shield + 50);
              playSound('shield');
            }
            setPlayer({ ...playerRef.current });
            return false;
          }
          return true;
        });
      });

      // 更新爆炸效果 (粒子动画)
      setExplosions(prev => prev.map(exp => ({
        ...exp,
        particles: exp.particles?.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.03,
          size: p.size * 0.95
        })).filter(p => p.life > 0)
      })).filter(exp => exp.particles && exp.particles.length > 0));

      // 不再每帧更新 bullets 和 enemies 的 State，Canvas 直接使用 ref
      // setBullets([...bulletsRef.current]);
      // setEnemies([...enemiesRef.current]);

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, level, checkCollisions]);

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'start' || gameState === 'gameover') {
          startGame();
        } else if (gameState === 'playing') {
          togglePause();
        } else if (gameState === 'paused') {
          togglePause();
        }
      } else if (e.code === 'KeyB') {
        useHandleBomb();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startGame, togglePause, useHandleBomb]);

  return {
    gameState,
    score,
    level,
    player,
    bullets,
    enemies,
    items,
    explosions,
    bombCount,
    gameWidth: GAME_WIDTH,
    gameHeight: GAME_HEIGHT,
    startGame,
    togglePause,
    handleMove,
    handleEnd,
    useHandleBomb,
    // Canvas 渲染使用的实时数据源（避免 React state 与 ref 不同步导致抖动/重影）
    playerRef,
    bulletsRef,
    enemiesRef
  };
}
