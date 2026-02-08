// 绘制函数模块 - 纯绘制逻辑，不使用React Hooks

export const drawStars = (ctx, gameWidth, gameHeight) => {
  // 绘制星空背景
  // 使用固定的随机种子来确保星星位置稳定
  const starCount = 100;
  ctx.fillStyle = '#ffffff';
  
  for (let i = 0; i < starCount; i++) {
    // 使用简单的伪随机算法
    const x = ((i * 137.5) % gameWidth);
    const y = ((i * 71.3) % gameHeight);
    const size = ((i % 3) + 1) * 0.5;
    const opacity = 0.3 + ((i % 5) / 10);
    
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

export const drawPlayer = (ctx, player) => {
  const x = player.x;
  const y = player.y;

  // 主体渐变
  const gradient = ctx.createLinearGradient(x, y - 25, x, y + 25);
  gradient.addColorStop(0, '#00d4ff');
  gradient.addColorStop(1, '#0099cc');

  // 主体三角形
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x, y - 25);
  ctx.lineTo(x + 25, y + 25);
  ctx.lineTo(x, y + 20);
  ctx.lineTo(x - 25, y + 25);
  ctx.closePath();
  ctx.fill();

  // 内部三角形
  ctx.fillStyle = '#0099cc';
  ctx.beginPath();
  ctx.moveTo(x, y - 15);
  ctx.lineTo(x + 15, y + 20);
  ctx.lineTo(x, y + 15);
  ctx.lineTo(x - 15, y + 20);
  ctx.closePath();
  ctx.fill();

  // 中心高光
  ctx.fillStyle = '#00ffff';
  ctx.beginPath();
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x + 10, y + 10);
  ctx.lineTo(x, y + 5);
  ctx.lineTo(x - 10, y + 10);
  ctx.closePath();
  ctx.fill();

  // 驾驶舱
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y - 17, 4, 0, Math.PI * 2);
  ctx.fill();

  // 护盾效果
  if (player.shield > 0) {
    ctx.save();
    ctx.strokeStyle = `rgba(0, 212, 255, ${Math.min(0.5, player.shield / 100)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 22 + player.shield / 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

   // 引擎火焰（使用确定性动画避免每帧随机）
   const flameOffset = Math.sin(Date.now() / 100) * 2;
   ctx.fillStyle = '#ff6600';
   ctx.beginPath();
   ctx.moveTo(x - 8, y + 25);
   ctx.lineTo(x, y + 35 + flameOffset);
   ctx.lineTo(x + 8, y + 25);
   ctx.closePath();
   ctx.fill();

   ctx.fillStyle = '#ffff00';
   ctx.beginPath();
   ctx.moveTo(x - 4, y + 25);
   ctx.lineTo(x, y + 30 + flameOffset * 0.5);
   ctx.lineTo(x + 4, y + 25);
   ctx.closePath();
   ctx.fill();
};

export const drawEnemy = (ctx, enemy) => {
  const x = enemy.x + enemy.size / 2;
  const y = enemy.y + enemy.size / 2;
  const size = enemy.size;

    const colors = {
      normal: '#ff6b6b',
      fast: '#ffd93d',
      tank: '#6c5ce7',
      shooter: '#00b894',
      bomber: '#ff8c00',
      splitter: '#da70d6'
    };
  const color = colors[enemy.type] || '#ff6b6b';

  ctx.fillStyle = color;

  if (enemy.type === 'tank') {
    // 坦克敌机 - 倒三角形
    ctx.beginPath();
    ctx.moveTo(x, y + size / 2);
    ctx.lineTo(x + size / 2, y - size / 2 + size * 0.2);
    ctx.lineTo(x + size * 0.35, y - size / 2);
    ctx.lineTo(x - size * 0.35, y - size / 2);
    ctx.lineTo(x - size / 2, y - size / 2 + size * 0.2);
    ctx.closePath();
    ctx.fill();

    // 内部细节
    const hpRatio = enemy.hp / enemy.maxHp;
    ctx.fillStyle = `rgba(255, 255, 255, ${hpRatio})`;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.lineTo(x + size * 0.35, y - size * 0.1);
    ctx.lineTo(x, y - size / 2);
    ctx.lineTo(x - size * 0.35, y - size * 0.1);
    ctx.closePath();
    ctx.fill();
  }
  else if (enemy.type === 'shooter') {
    // 射击敌机 - 倒三角形
    ctx.beginPath();
    ctx.moveTo(x, y + size / 2);
    ctx.lineTo(x + size / 2, y - size / 2);
    ctx.lineTo(x, y - size * 0.2);
    ctx.lineTo(x - size / 2, y - size / 2);
    ctx.closePath();
    ctx.fill();

    // 驾驶舱
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y + size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // 炮管
    ctx.fillStyle = '#333333';
    ctx.fillRect(x - size * 0.05, y - size / 2, size * 0.1, size * 0.15);
  }
  else if (enemy.type === 'bomber') {
    // 轰炸敌机 - 椭圆形
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 驾驶舱
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // 炸弹舱
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(x, y + size * 0.3, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  else if (enemy.type === 'splitter') {
    // 分裂敌机 - 六边形
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + Math.cos(angle) * size * 0.4;
      const py = y + Math.sin(angle) * size * 0.4;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // 中心核心
    ctx.fillStyle = '#da70d6';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 裂纹效果
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.15, y);
    ctx.lineTo(x + size * 0.15, y);
    ctx.moveTo(x, y - size * 0.15);
    ctx.lineTo(x, y + size * 0.15);
    ctx.stroke();
  }
  else if (enemy.type === 'fast') {
    // 快速敌机 - 菱形
    ctx.beginPath();
    ctx.moveTo(x, y - size / 2);
    ctx.lineTo(x + size / 2, y);
    ctx.lineTo(x, y + size / 2);
    ctx.lineTo(x - size / 2, y);
    ctx.closePath();
    ctx.fill();

    // 中心装饰
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.2);
    ctx.lineTo(x + size * 0.2, y);
    ctx.lineTo(x, y + size * 0.3);
    ctx.lineTo(x - size * 0.2, y);
    ctx.closePath();
    ctx.fill();
  }
  else {
    // 普通敌机 - 倒三角形
    ctx.beginPath();
    ctx.moveTo(x, y + size / 2);
    ctx.lineTo(x + size / 2, y - size / 2);
    ctx.lineTo(x, y - size * 0.2);
    ctx.lineTo(x - size / 2, y - size / 2);
    ctx.closePath();
    ctx.fill();

    // 中心装饰
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.35);
    ctx.lineTo(x + size * 0.2, y - size * 0.2);
    ctx.lineTo(x, y - size * 0.15);
    ctx.lineTo(x - size * 0.2, y - size * 0.2);
    ctx.closePath();
    ctx.fill();

    // 驾驶舱
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y + size * 0.25, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
};

export const drawBoss = (ctx, boss) => {
  const x = boss.x + boss.size / 2;
  const y = boss.y + boss.size / 2;
  const size = boss.size;

  // Boss主体 - 复杂的机械设计
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // 核心发光
  const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.2);
  coreGradient.addColorStop(0, '#ffff00');
  coreGradient.addColorStop(0.5, '#ff8800');
  coreGradient.addColorStop(1, '#ff0000');
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // 装甲板
  ctx.strokeStyle = '#cc0000';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const outerX = x + Math.cos(angle) * size * 0.45;
    const outerY = y + Math.sin(angle) * size * 0.45;
    const innerX = x + Math.cos(angle) * size * 0.3;
    const innerY = y + Math.sin(angle) * size * 0.3;
    
    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(outerX, outerY);
    ctx.stroke();
  }

  // 炮管
  if (boss.phase === 1) {
    // 第一阶段：三个炮管
    for (let i = -1; i <= 1; i++) {
      const angle = (i * Math.PI) / 3;
      const gunX = x + Math.cos(angle) * size * 0.35;
      const gunY = y + Math.sin(angle) * size * 0.35;
      
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(gunX, gunY, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // 第二阶段：八个炮管
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const gunX = x + Math.cos(angle) * size * 0.35;
      const gunY = y + Math.sin(angle) * size * 0.35;
      
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(gunX, gunY, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // HP条
  const hpRatio = boss.hp / boss.maxHp;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x - size * 0.5, y - size * 0.6, size, 8);
  ctx.fillStyle = hpRatio > 0.5 ? '#00ff00' : hpRatio > 0.25 ? '#ffff00' : '#ff0000';
  ctx.fillRect(x - size * 0.5, y - size * 0.6, size * hpRatio, 8);
  
  // 阶段标识
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`阶段 ${boss.phase}`, x, y - size * 0.65);
};

export const drawBullet = (ctx, bullet) => {
  const x = bullet.x;
  const y = bullet.y;
  const width = bullet.width || 8;
  const height = bullet.height || 20;

  if (bullet.isEnemy) {
    // 敌人子弹
    const color = bullet.damage === -2 ? '#ff0000' : '#ff4444'; // 轰炸机子弹为红色
    const angle = bullet.vx !== undefined || bullet.vy !== undefined 
      ? Math.atan2(bullet.vy, bullet.vx) 
      : Math.PI / 2;
    
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(angle - Math.PI / 2);

    // 尾迹效果
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    
    // 子弹主体
    const gradient = ctx.createLinearGradient(-width / 2, -height / 2, -width / 2, height / 2);
    gradient.addColorStop(0, color.replace('44', '88').replace('00', '44'));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, color.replace('ff', 'cc').replace('44', '00'));
    ctx.fillStyle = gradient;

    ctx.beginPath();
    // 子弹形状 - 尖头
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(width / 2, height / 2);
    ctx.lineTo(-width / 2, height / 2);
    ctx.closePath();
    ctx.fill();

    // 内部高光
    ctx.fillStyle = color.replace('44', 'aa').replace('00', '66');
    ctx.beginPath();
    ctx.moveTo(0, -height / 4);
    ctx.lineTo(width / 4, height / 4);
    ctx.lineTo(-width / 4, height / 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
  else if (bullet.isLaser) {
    // 激光武器
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(0.5, '#ff0088');
    gradient.addColorStop(1, '#ff0044');
    ctx.fillStyle = gradient;
    
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 20;
    ctx.fillRect(x, y, width, height);
    ctx.shadowBlur = 0;
  }
  else {
    // 玩家普通子弹 - 根据武器类型变色
    let startColor, midColor, endColor, shadowColor;
    
    // 使用传入的weapon参数判断武器类型
    const weapon = bullet.weapon || 'normal';
    if (weapon === 'spread') {
      startColor = '#ffff00';
      midColor = '#ffd700';
      endColor = '#ff8c00';
      shadowColor = '#ffff00';
    } else {
      startColor = '#00ff88';
      midColor = '#00d4ff';
      endColor = '#0099cc';
      shadowColor = '#00ff88';
    }

    const gradient = ctx.createLinearGradient(x, y + height, x, y);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(0.5, midColor);
    gradient.addColorStop(1, endColor);
    ctx.fillStyle = gradient;

    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
};

export const drawItem = (ctx, item) => {
  const x = item.x;
  const y = item.y;

  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (item.type === 'power') {
    ctx.fillStyle = 'rgba(255, 217, 61, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd93d';
    ctx.fillText('⚡', x, y);
  }
  else if (item.type === 'weapon') {
    ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff4500';
    ctx.fillText('🔫', x, y);
  }
  else if (item.type === 'bomb') {
    ctx.fillStyle = 'rgba(255, 107, 107, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('💣', x, y);
  }
  else if (item.type === 'shield') {
    ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('🛡', x, y);
  }
};

export const drawExplosion = (ctx, explosion) => {
  if (!explosion.particles || explosion.particles.length === 0) return;

  const centerX = explosion.x;
  const centerY = explosion.y;

  explosion.particles.forEach(particle => {
    const x = centerX + particle.x;
    const y = centerY + particle.y;

    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(x, y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};

export const drawHUD = (ctx, playerData, score, level, bombCount, combo, stage, gameWidth) => {

  // 分数
  ctx.fillStyle = '#00d4ff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`得分 ${score}`, 20, 20);

  // 等级
  ctx.fillStyle = '#00d4ff';
  ctx.fillText(`等级 ${level}`, 20, 45);

  // 炸弹
  ctx.fillStyle = '#00d4ff';
  ctx.fillText(`炸弹 ${bombCount}`, 20, 70);

  // 血条背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(20, 95, 150, 12);

  // 血条
  const hpWidth = Math.max(0, playerData.hp * 1.5);
  const hpGradient = ctx.createLinearGradient(20, 0, 20 + hpWidth, 0);
  hpGradient.addColorStop(0, '#ff6b6b');
  hpGradient.addColorStop(0.5, '#ff4444');
  hpGradient.addColorStop(1, '#cc0000');
  ctx.fillStyle = hpGradient;
  ctx.fillRect(20, 95, hpWidth, 12);

  // 护盾条
  if (playerData.shield > 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, 109, 150, 6);
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(20, 109, playerData.shield * 1.5, 6);
  }

  // 火力等级
  ctx.fillStyle = '#ffd93d';
  ctx.textAlign = 'right';
  ctx.fillText(`火力: ${playerData.power >= 5 ? 'MAX' : `Lv.${playerData.power}`}`, gameWidth - 20, 20);

  // 关卡显示
  if (stage !== undefined) {
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`关卡: ${stage}`, gameWidth - 20, 45);
  }

  // 连击显示
  if (combo > 1) {
    ctx.fillStyle = combo >= 10 ? '#ff00ff' : combo >= 5 ? '#ffff00' : '#00ffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`连击: x${combo}`, gameWidth - 20, 70);
  }
};

// FPS统计模块级变量
let fpsState = { lastTime: 0, frameCount: 0, fps: 60 };

export const drawFPS = (ctx, gameWidth) => {
  const now = Date.now();
  
  fpsState.frameCount++;

  // 每秒更新一次 FPS
  if (now - fpsState.lastTime >= 1000) {
    fpsState.fps = fpsState.frameCount;
    fpsState.frameCount = 0;
    fpsState.lastTime = now;
  }

  // 根据 FPS 设置颜色
  const fps = fpsState.fps;
  ctx.fillStyle = fps >= 55 ? '#00ff88' : fps >= 30 ? '#ffd93d' : '#ff6b6b';
  ctx.font = '14px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(`FPS: ${fps}`, gameWidth - 20, 45);
};

export const drawOverlay = (ctx, gameState, gameWidth, gameHeight, gameData = {}) => {
  if (gameState === 'start' || gameState === 'paused' || gameState === 'gameover') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (gameState === 'start') {
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 48px Arial';
      ctx.fillText('✈️ 飞机大战', gameWidth / 2, gameHeight / 2 - 180);

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText('🖱️ 鼠标/触摸移动', gameWidth / 2, gameHeight / 2 - 80);
      ctx.fillText('🔫 自动射击', gameWidth / 2, gameHeight / 2 - 50);
      ctx.fillText('💣 按 B 键使用炸弹', gameWidth / 2, gameHeight / 2 - 20);
      ctx.fillText('␣ 空格键暂停', gameWidth / 2, gameHeight / 2 + 10);

      // 音效控制按钮
      const soundBtnX = gameWidth / 2;
      const soundBtnY = gameHeight / 2 + 55;
      ctx.fillStyle = gameData.soundEnabled ? '#00d4ff' : '#666666';
      ctx.beginPath();
      ctx.arc(soundBtnX, soundBtnY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText(gameData.soundEnabled ? '🔊' : '🔇', soundBtnX, soundBtnY + 1);

      // 按钮说明
      ctx.font = '11px Arial';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('音效', soundBtnX, soundBtnY + 30);

      // 敌人类型说明
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('● 普通敌机', gameWidth / 2 - 80, gameHeight / 2 + 110);
      ctx.fillStyle = '#ffd93d';
      ctx.fillText('● 快速敌机', gameWidth / 2 + 80, gameHeight / 2 + 110);
      ctx.fillStyle = '#6c5ce7';
      ctx.fillText('● 坦克敌机', gameWidth / 2 - 80, gameHeight / 2 + 140);
      ctx.fillStyle = '#00b894';
      ctx.fillText('● 射击敌机', gameWidth / 2 + 80, gameHeight / 2 + 140);
      ctx.fillStyle = '#ff8c00';
      ctx.fillText('● 轰炸敌机', gameWidth / 2 - 80, gameHeight / 2 + 170);
      ctx.fillStyle = '#da70d6';
      ctx.fillText('● 分裂敌机', gameWidth / 2 + 80, gameHeight / 2 + 170);

      // 道具说明
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffd93d';
      ctx.fillText('⚡ 火力增强', gameWidth / 2 - 80, gameHeight / 2 + 200);
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('💣 炸弹', gameWidth / 2 + 80, gameHeight / 2 + 200);
      ctx.fillStyle = '#00d4ff';
      ctx.fillText('🛡 护盾', gameWidth / 2 - 80, gameHeight / 2 + 230);

      // 开始按钮
      ctx.fillStyle = '#00d4ff';
      ctx.beginPath();
      ctx.roundRect(gameWidth / 2 - 100, gameHeight / 2 + 260, 200, 50, 25);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('开始游戏', gameWidth / 2, gameHeight / 2 + 285);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('点击按钮或按空格键开始', gameWidth / 2, gameHeight / 2 + 330);
    }
    else if (gameState === 'paused') {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 48px Arial';
      ctx.fillText('游戏暂停', gameWidth / 2, gameHeight / 2 - 30);

      ctx.fillStyle = '#00d4ff';
      ctx.beginPath();
      ctx.roundRect(gameWidth / 2 - 80, gameHeight / 2 + 30, 160, 50, 25);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('继续游戏', gameWidth / 2, gameHeight / 2 + 55);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('点击按钮或按空格键继续', gameWidth / 2, gameHeight / 2 + 100);
    }
    else if (gameState === 'gameover') {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 48px Arial';
      ctx.fillText('游戏结束', gameWidth / 2, gameHeight / 2 - 80);

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText(`最终得分: ${gameData.score}`, gameWidth / 2, gameHeight / 2 - 20);
      ctx.fillText(`到达等级: ${gameData.level}`, gameWidth / 2, gameHeight / 2 + 20);
      ctx.fillText(`最高连击: x${gameData.maxCombo}`, gameWidth / 2, gameHeight / 2 + 60);

      ctx.fillStyle = '#00d4ff';
      ctx.beginPath();
      ctx.roundRect(gameWidth / 2 - 100, gameHeight / 2 + 70, 200, 50, 25);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('重新开始', gameWidth / 2, gameHeight / 2 + 95);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('点击按钮或按空格键重新开始', gameWidth / 2, gameHeight / 2 + 140);
    }
  }
};