// 游戏主循环逻辑
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SIZE,
  ENEMY_SIZE,
  LEVEL_CONFIG
} from './gameConstants';

/**
 * 游戏主循环
 * @param {Object} params - 参数对象
 */
export function runGameLoop(params) {
  
  const {
    gameState,
    gameLoopRef,
    playerRef,
    touchPositionRef,
    isTouchingRef,
    lastShootRef,
    lastSpawnRef,
    scoreRef,
    enemiesRef,
    bulletsRef,
    comboResetTimeoutRef,
    level,
    stage,
    boss,
    combo,
    maxCombo,
    score,
    playSound,
    getBullet,
    getEnemy,
    getParticle,
    getItem,
    returnBullet,
    returnParticle,
    returnExplosion,
    createPlayerBullets,
    spawnEnemy,
    handleShooterEnemy,
    handleBomberEnemy,
    handleSplitterEnemy,
    handleBoss,
    updateBullets,
    handleItemCollection,
    createBossConfig,
    checkCollisions,
    checkBossCollisions,
    setScore,
    setLevel,
    setStage,
    setBoss,
    setCombo,
    setMaxCombo,
    setPlayer,
    setEnemies,
    setBullets,
    setItems,
    setExplosions,
    setBombCount,
    setGameState,
    lastPlayerStateRef
  } = params;

  if (gameState !== 'playing') {
    gameLoopRef.current = requestAnimationFrame(() => runGameLoop(params));
    return;
  }

  const now = Date.now();

  // 更新玩家位置 - 平滑跟随触摸/鼠标位置
  if (isTouchingRef.current) {
    const targetX = touchPositionRef.current.x;
    const targetY = touchPositionRef.current.y;
    const currentX = playerRef.current.x;
    const currentY = playerRef.current.y;
    
    // 添加平滑过渡效果，速度为0.2（20%的差值）
    const smoothingFactor = 0.2;
    const newX = Math.max(PLAYER_SIZE / 2, Math.min(GAME_WIDTH - PLAYER_SIZE / 2, 
      currentX + (targetX - currentX) * smoothingFactor));
    const newY = Math.max(PLAYER_SIZE / 2, Math.min(GAME_HEIGHT - PLAYER_SIZE / 2,
      currentY + (targetY - currentY) * smoothingFactor));

    if (Math.abs(newX - currentX) > 0.1 || Math.abs(newY - currentY) > 0.1) {
      playerRef.current = { ...playerRef.current, x: newX, y: newY };
    }
  }

  // 射击
  const weaponShootInterval = playerRef.current.weapon === 'laser' ? 50 : 200;
  if (now - lastShootRef.current > weaponShootInterval) {
    const newBullets = createPlayerBullets(playerRef.current, now, getBullet);
    
    if (newBullets.length > 0) {
      // 根据武器类型播放不同的射击声音
      if (playerRef.current.weapon === 'laser') {
        playSound('laser');
      } else {
        playSound('shoot');
      }
    }
    
    bulletsRef.current = [...bulletsRef.current, ...newBullets];
    lastShootRef.current = now;
  }

  // 生成敌人
  const spawnRate = Math.max(500, 1200 - level * 100);
  if (now - lastSpawnRef.current > spawnRate) {
    const newEnemy = spawnEnemy({ lastSpawn: lastSpawnRef.current, now }, { getEnemy }, level);
    if (newEnemy) {
      enemiesRef.current.push(newEnemy);
      lastSpawnRef.current = now;
    }
  }

  // Boss碰撞检测
  if (boss) {
    const bossResult = checkBossCollisions(boss, { bulletsRef, playerRef }, {}, playSound);
    
    // 应用Boss受到的伤害
    if (bossResult.totalDamage > 0) {
      boss.hp = Math.max(0, boss.hp - bossResult.totalDamage);
      
      // 如果Boss死亡，清空Boss并增加分数
      if (boss.hp <= 0) {
        playSound('explosion');
        scoreRef.current += boss.score;
        setScore(scoreRef.current);
        setBoss(null);
      }
    }
    
    // 移除击中Boss的子弹
    bulletsRef.current = bulletsRef.current.filter(b => !bossResult.bossBulletsHit.has(b.id));
    
    if (bossResult.playerHitByBoss) {
      const damage = 10;
      if (playerRef.current.shield <= 0) {
        playerRef.current.hp = Math.max(0, playerRef.current.hp - damage);
      } else {
        playerRef.current.shield = Math.max(0, playerRef.current.shield - damage);
      }
      playSound('playerHit');
    }
    
    if (bossResult.playerHitBoss) {
      playerRef.current.hp = Math.max(0, playerRef.current.hp - 50);
      playSound('playerHit');
    }
    
    if (playerRef.current.hp <= 0) {
      setGameState('gameover');
      playSound('gameOver');
    }
  }

  // 更新Boss位置和行为（只在Boss存活时）
  if (boss && boss.hp > 0) {
    const newBoss = handleBoss(boss, { playerRef, bulletsRef }, { getBullet }, now, playSound);
    setBoss(newBoss);
  }

  // 更新敌人
  for (let i = 0; i < enemiesRef.current.length; i++) {
    const enemy = enemiesRef.current[i];
    let updatedEnemy = { ...enemy, y: enemy.y + enemy.speed };

    if (enemy.type === 'shooter') {
      updatedEnemy = handleShooterEnemy(updatedEnemy, { playerRef, bulletsRef }, { getBullet }, now, playSound);
    }

    if (enemy.type === 'bomber') {
      updatedEnemy = handleBomberEnemy(updatedEnemy, { playerRef, bulletsRef }, { getBullet }, now, playSound);
    }

    if (enemy.type === 'splitter') {
      updatedEnemy = handleSplitterEnemy(updatedEnemy, { enemiesRef }, { getEnemy }, now, 3, ENEMY_SIZE);
    }

    if (updatedEnemy.vx !== undefined || updatedEnemy.vy !== undefined) {
      updatedEnemy.x += updatedEnemy.vx || 0;
      updatedEnemy.y += updatedEnemy.vy || 0;
    }

    enemiesRef.current[i] = updatedEnemy;
  }

  // 更新子弹
  const bulletsToRemove = updateBullets(bulletsRef.current, returnBullet);
  for (let i = bulletsToRemove.length - 1; i >= 0; i--) {
    bulletsRef.current.splice(bulletsToRemove[i], 1);
  }

  // 碰撞检测
  const collisionResult = checkCollisions(
    { bulletsRef, enemiesRef, playerRef },
    { combo, maxCombo },
    { setCombo, setMaxCombo },
    { getItem },
    playSound
  );

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
  
  // 更新分数
  deadEnemiesList.forEach(enemy => {
    scoreRef.current += enemy.score;
  });
  
  enemiesRef.current = enemiesRef.current.filter(e => !collisionResult.deadEnemies.has(e.id) && e.y < GAME_HEIGHT + e.size);
  
  // 更新敌人和子弹状态到 React
  // 每帧更新以确保流畅渲染
  setEnemies([...enemiesRef.current]);
  setBullets([...bulletsRef.current]);

  // 敌人子弹伤害
  const enemyBulletDamage = collisionResult.enemyBulletHits * 10;
  if (enemyBulletDamage > 0) {
    if (playerRef.current.shield <= 0) {
      playerRef.current.hp = Math.max(0, playerRef.current.hp - enemyBulletDamage);
    } else {
      const totalDamage = enemyBulletDamage;
      if (playerRef.current.shield >= totalDamage) {
        playerRef.current.shield -= totalDamage;
      } else {
        const remaining = totalDamage - playerRef.current.shield;
        playerRef.current.shield = 0;
        playerRef.current.hp = Math.max(0, playerRef.current.hp - remaining);
      }
    }
    playSound('playerHit');
    
    if (playerRef.current.hp <= 0) {
      setGameState('gameover');
      playSound('gameOver');
    }
  }

  // 爆炸效果
  deadEnemiesList.forEach((deadEnemy) => {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      particles.push(getParticle({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 6 + 3,
        color: Math.random() > 0.5 ? '#ff6b6b' : Math.random() > 0.5 ? '#ffd93d' : '#ff8800'
      }));
    }
    
    setExplosions(prev => [
      ...prev,
      {
        x: deadEnemy.x + deadEnemy.size / 2,
        y: deadEnemy.y + deadEnemy.size / 2,
        id: Date.now() + Math.random(),
        particles
      }
    ]);
    playSound('explosion');
  });

  // 更新玩家状态 - 包括位置变化
  const currentPlayerState = playerRef.current;
  const lastState = lastPlayerStateRef.current ? JSON.parse(lastPlayerStateRef.current) : null;
  
  const statsChanged = 
    !lastState ||
    currentPlayerState.x !== lastState.x ||  // 检查位置变化
    currentPlayerState.y !== lastState.y ||  // 检查位置变化
    currentPlayerState.hp !== lastState.hp || 
    currentPlayerState.shield !== lastState.shield || 
    currentPlayerState.power !== lastState.power;
  
  if (statsChanged) {
    setPlayer({ ...currentPlayerState });
    lastPlayerStateRef.current = JSON.stringify(currentPlayerState);
  }

  // 更新分数
  if (scoreRef.current !== score) {
    setScore(scoreRef.current);
  }

  // 更新等级和关卡
  const newLevel = Math.floor(scoreRef.current / LEVEL_CONFIG.baseScorePerLevel) + 1;
  if (newLevel > level) {
    setLevel(newLevel);
  }

  const newStage = Math.floor((newLevel - 1) / LEVEL_CONFIG.levelsPerStage) + 1;
  if (newStage > stage && (newLevel % LEVEL_CONFIG.levelsPerStage === 0)) {
    setStage(newStage);
    const bossConfig = createBossConfig(GAME_WIDTH, newStage, 3, ENEMY_SIZE);
    setBoss(bossConfig);
    playSound('gameOver');
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
    return handleItemCollection(currentItems, playerRef.current, {
      setBombCount
    }, playSound);
  });

  // 重置连击计数器
  if (collisionResult.deadEnemies.size === 0 && combo > 0) {
    if (comboResetTimeoutRef.current) {
      clearTimeout(comboResetTimeoutRef.current);
    }
    comboResetTimeoutRef.current = setTimeout(() => {
      setCombo(0);
    }, 3000);
  }

  // 更新爆炸效果
  setExplosions(prev => {
    const explosionsToRemove = [];
    const updatedExplosions = prev.map((exp, expIndex) => {
      const particlesToRemove = [];
      const updatedParticles = exp.particles?.map((p, pIndex) => {
        p.x = p.x + p.vx;
        p.y = p.y + p.vy;
        p.life = p.life - 0.03;
        p.size = p.size * 0.95;
        
        if (p.life <= 0) {
          particlesToRemove.push(pIndex);
          returnParticle(p);
        }
        return p;
      }).filter(p => p !== undefined) || [];
      
      for (let i = particlesToRemove.length - 1; i >= 0; i--) {
        exp.particles.splice(particlesToRemove[i], 1);
      }
      
      if (updatedParticles.length === 0) {
        explosionsToRemove.push(expIndex);
        returnExplosion(exp);
        return null;
      }
      
      return { ...exp, particles: updatedParticles };
    }).filter(exp => exp !== null);
    
    return updatedExplosions;
  });

  gameLoopRef.current = requestAnimationFrame(() => runGameLoop(params));
}