// 游戏渲染器组件
import { useEffect } from 'react';
import { 
  drawStars,
  drawPlayer, 
  drawEnemy, 
  drawBoss, 
  drawBullet, 
  drawItem, 
  drawExplosion, 
  drawHUD, 
  drawFPS,
  drawOverlay
} from './drawers';

export function GameRenderer({
  canvasRef,
  gameWidth,
  gameHeight,
  gameState,
  handleCanvasClick,
  gameData
}) {

  // 游戏循环
  useEffect(() => {
    let animationId;

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');

      // 清除画布并重置状态（优化清除性能）
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, gameWidth, gameHeight);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换矩阵
      ctx.beginPath(); // 清除路径

      // 绘制星空
      drawStars(ctx, gameWidth, gameHeight);

      // 只在 playing 状态时绘制游戏元素
      if (gameState === 'playing') {
        // 绘制道具
        gameData.items.forEach(item => drawItem(ctx, item));

        // 绘制子弹 (使用 ref 获取实时位置)
        gameData.bulletsRef.current.forEach(bullet => drawBullet(ctx, bullet));

        // 绘制敌人 (使用 ref 获取实时位置)
        gameData.enemiesRef.current.forEach(enemy => drawEnemy(ctx, enemy));

        // 绘制玩家 - 使用ref获取实时位置
        drawPlayer(ctx, gameData.playerRef.current);

        // 绘制爆炸效果
        gameData.explosions.forEach(exp => {
          drawExplosion(ctx, exp);
        });

        // 绘制 Boss
        if (gameData.boss) {
          drawBoss(ctx, gameData.boss);
        }

        // 绘制 HUD
        drawHUD(ctx, gameData.playerRef.current, gameData.score, gameData.level, gameData.bombCount, gameData.combo, gameData.stage, gameWidth);



        // 绘制 FPS
        drawFPS(ctx, gameWidth);
      }
      else {
        // 非 playing 状态，绘制覆盖层
        drawOverlay(ctx, gameState, gameWidth, gameHeight, gameData);
      }
      
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, gameWidth, gameHeight, gameData, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={gameWidth}
      height={gameHeight}
      onClick={handleCanvasClick}
      style={{ cursor: gameState === 'playing' ? 'crosshair' : 'default' }}
    />
  );
}