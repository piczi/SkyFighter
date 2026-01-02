// 游戏主组件 - Canvas 版本
import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '../hooks/useGame';
import './Game.css';

export function CanvasGame() {
  const {
    gameState,
    score,
    level,
    player,
    playerRef,
    bulletsRef,
    enemiesRef,
    items,
    explosions,
    bombCount,
    gameWidth,
    gameHeight,
    startGame,
    togglePause,
    handleMove,
    handleEnd,
    useHandleBomb
  } = useGame();

  const canvasRef = useRef(null);
  const gameStateRef = useRef(gameState);
  const starsRef = useRef([]);
  const fpsRef = useRef({ lastTime: Date.now(), frameCount: 0, fps: 60 });

  // 同步 gameState 到 ref
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // 初始化星空背景
  useEffect(() => {
    starsRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * gameWidth,
      y: Math.random() * gameHeight,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3
    }));
  }, [gameWidth, gameHeight]);

  // 绘制星空背景
  const drawStars = (ctx) => {
    starsRef.current.forEach(star => {
      ctx.save();
      ctx.globalAlpha = star.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 移动星星
      star.y += star.speed;
      if (star.y > gameHeight) {
        star.y = 0;
        star.x = Math.random() * gameWidth;
      }
    });
  };

  // 绘制玩家飞机
  const drawPlayer = (ctx, player) => {
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

    // 引擎火焰
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 25);
    ctx.lineTo(x, y + 35 + Math.random() * 5);
    ctx.lineTo(x + 8, y + 25);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 25);
    ctx.lineTo(x, y + 30 + Math.random() * 3);
    ctx.lineTo(x + 4, y + 25);
    ctx.closePath();
    ctx.fill();
  };

  // 绘制敌人
  const drawEnemy = (ctx, enemy) => {
    const x = enemy.x + enemy.size / 2;
    const y = enemy.y + enemy.size / 2;
    const size = enemy.size;

    const colors = {
      normal: '#ff6b6b',
      fast: '#ffd93d',
      tank: '#6c5ce7',
      shooter: '#00b894'
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

  // 绘制子弹
  const drawBullet = (ctx, bullet) => {
    const x = bullet.x;
    const y = bullet.y;
    const width = 8;
    const height = 20;

    if (bullet.isEnemy) {
      // 计算子弹角度
      const angle = bullet.vx !== undefined || bullet.vy !== undefined 
        ? Math.atan2(bullet.vy, bullet.vx) 
        : Math.PI / 2;
      
      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(angle - Math.PI / 2);

      // 尾迹效果
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 15;
      
      // 子弹主体
      const gradient = ctx.createLinearGradient(-width / 2, -height / 2, -width / 2, height / 2);
      gradient.addColorStop(0, '#ff8888');
      gradient.addColorStop(0.5, '#ff4444');
      gradient.addColorStop(1, '#cc0000');
      ctx.fillStyle = gradient;

      ctx.beginPath();
      // 子弹形状 - 尖头
      ctx.moveTo(0, -height / 2);
      ctx.lineTo(width / 2, height / 2);
      ctx.lineTo(-width / 2, height / 2);
      ctx.closePath();
      ctx.fill();

      // 内部高光
      ctx.fillStyle = '#ffaaaa';
      ctx.beginPath();
      ctx.moveTo(0, -height / 4);
      ctx.lineTo(width / 4, height / 4);
      ctx.lineTo(-width / 4, height / 4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
    else {
      // 玩家子弹 - 青色
      const gradient = ctx.createLinearGradient(x, y + height, x, y);
      gradient.addColorStop(0, '#00ff88');
      gradient.addColorStop(0.5, '#00d4ff');
      gradient.addColorStop(1, '#0099cc');
      ctx.fillStyle = gradient;

      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  // 绘制道具
  const drawItem = (ctx, item) => {
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

  // 绘制爆炸效果
  const drawExplosion = (ctx, explosion) => {
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

  // 绘制 HUD
  const drawHUD = (ctx, playerData) => {
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
  };

  // 绘制 FPS
  const drawFPS = (ctx) => {
    const now = Date.now();
    fpsRef.current.frameCount++;

    // 每秒更新一次 FPS
    if (now - fpsRef.current.lastTime >= 1000) {
      fpsRef.current.fps = fpsRef.current.frameCount;
      fpsRef.current.frameCount = 0;
      fpsRef.current.lastTime = now;
    }

    // 根据 FPS 设置颜色
    const fps = fpsRef.current.fps;
    ctx.fillStyle = fps >= 55 ? '#00ff88' : fps >= 30 ? '#ffd93d' : '#ff6b6b';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`FPS: ${fps}`, gameWidth - 20, 45);
  };

  // 绘制游戏界面
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // 清除画布并重置状态
    ctx.clearRect(0, 0, gameWidth, gameHeight);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换矩阵
    ctx.beginPath(); // 清除路径

    // 绘制背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, gameHeight);
    bgGradient.addColorStop(0, '#050510');
    bgGradient.addColorStop(0.5, '#0a0a20');
    bgGradient.addColorStop(1, '#101030');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    // 绘制星空
    drawStars(ctx);

    // 只在 playing 状态时绘制游戏元素
    if (gameState === 'playing') {
      // 绘制道具
      items.forEach(item => drawItem(ctx, item));

      // 绘制子弹 (使用 ref 直接获取实时数据)
      bulletsRef.current.forEach(bullet => drawBullet(ctx, bullet));

      // 绘制敌人 (使用 ref 直接获取实时数据)
      enemiesRef.current.forEach(enemy => drawEnemy(ctx, enemy));

      // 绘制玩家
      drawPlayer(ctx, playerRef.current);

      // 绘制爆炸效果
      explosions.forEach(exp => {
        drawExplosion(ctx, exp);
      });

      // 绘制 HUD
      drawHUD(ctx, playerRef.current);

      // 绘制 FPS
      drawFPS(ctx);
    }
    else {
      // 非 playing 状态，绘制覆盖层
      drawOverlay(ctx);
    }
  }, [gameWidth, gameHeight, gameState, items, explosions, score, level, bombCount, bulletsRef, enemiesRef, playerRef]);

  // 游戏循环
  useEffect(() => {
    let animationId;

    const gameLoop = () => {
      draw();
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [draw]);

  // 触摸/鼠标事件处理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      handleMove(x, y);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleMove(x, y);
    };

    const handleTouchEnd = () => handleEnd();
    const handleMouseUp = () => handleEnd();

    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMove, handleEnd]);

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

  // 绘制覆盖层
  const drawOverlay = (ctx) => {
    if (gameState === 'start' || gameState === 'paused' || gameState === 'gameover') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, 0, gameWidth, gameHeight);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (gameState === 'start') {
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('✈️ 飞机大战', gameWidth / 2, gameHeight / 2 - 150);

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.fillText('🖱️ 鼠标/触摸移动', gameWidth / 2, gameHeight / 2 - 60);
        ctx.fillText('🔫 自动射击', gameWidth / 2, gameHeight / 2 - 30);
        ctx.fillText('💣 按 B 键使用炸弹', gameWidth / 2, gameHeight / 2);
        ctx.fillText('␣ 空格键暂停', gameWidth / 2, gameHeight / 2 + 30);

        // 敌人类型说明
        ctx.font = '14px Arial';
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('● 普通敌机', gameWidth / 2 - 80, gameHeight / 2 + 90);
        ctx.fillStyle = '#ffd93d';
        ctx.fillText('● 快速敌机', gameWidth / 2 + 80, gameHeight / 2 + 90);
        ctx.fillStyle = '#6c5ce7';
        ctx.fillText('● 坦克敌机', gameWidth / 2 - 80, gameHeight / 2 + 120);
        ctx.fillStyle = '#00b894';
        ctx.fillText('● 射击敌机', gameWidth / 2 + 80, gameHeight / 2 + 120);

        // 开始按钮
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.roundRect(gameWidth / 2 - 100, gameHeight / 2 + 170, 200, 50, 25);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('开始游戏', gameWidth / 2, gameHeight / 2 + 195);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText('点击按钮或按空格键开始', gameWidth / 2, gameHeight / 2 + 240);
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
        ctx.fillText(`最终得分: ${score}`, gameWidth / 2, gameHeight / 2 - 20);
        ctx.fillText(`到达等级: ${level}`, gameWidth / 2, gameHeight / 2 + 20);

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

  // 处理点击开始/继续游戏
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (gameStateRef.current === 'start') {
      // 检查是否点击开始按钮
      if (y > gameHeight / 2 + 170 && y < gameHeight / 2 + 220 &&
          x > gameWidth / 2 - 100 && x < gameWidth / 2 + 100) {
        startGame();
      }
    }
    else if (gameStateRef.current === 'paused') {
      if (y > gameHeight / 2 + 30 && y < gameHeight / 2 + 80 &&
          x > gameWidth / 2 - 80 && x < gameWidth / 2 + 80) {
        togglePause();
      }
    }
    else if (gameStateRef.current === 'gameover') {
      if (y > gameHeight / 2 + 70 && y < gameHeight / 2 + 120 &&
          x > gameWidth / 2 - 100 && x < gameWidth / 2 + 100) {
        startGame();
      }
    }
  };

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={gameWidth}
        height={gameHeight}
        onClick={handleCanvasClick}
        style={{ cursor: gameState === 'playing' ? 'crosshair' : 'default' }}
      />
    </div>
  );
}

