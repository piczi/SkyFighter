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

        // 绘制技能UI
        if (gameState === 'playing') {
          const { skillPoints, activeSkills, skillCooldowns } = gameData;
          
          const getSkillCooldown = (skillId) => {
            const cooldowns = {
              'timeSlow': 15000,
              'areaDamage': 20000,
              'autoAim': 25000,
              'energyShield': 30000
            };
            return cooldowns[skillId] || 10000;
          };
          
          const skills = [
            { id: 'timeSlow', name: '⏱️ 时间减缓', desc: '减慢敌人速度' },
            { id: 'areaDamage', name: '💥 范围伤害', desc: '伤害所有敌人' },
            { id: 'autoAim', name: '🎯 自动瞄准', desc: '子弹自动追踪' },
            { id: 'energyShield', name: '🛡️ 能量护盾', desc: '吸收伤害' }
          ];
          
          const skillSize = 60;
          const margin = 10;
          const startY = gameHeight - skillSize - margin;
          
          skills.forEach((skill, index) => {
            const x = margin + index * (skillSize + margin);
            const y = startY;
            
            // 技能背景
            ctx.fillStyle = activeSkills.includes(skill.id) ? '#4CAF50' : '#757575';
            ctx.fillRect(x, y, skillSize, skillSize);
            
            // 技能图标
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(skill.name[0], x + skillSize/2, y + skillSize/2 - 5);
            
            // 冷却遮罩
            const cooldown = skillCooldowns[skill.id] || 0;
            const now = Date.now();
            const cooldownTime = getSkillCooldown(skill.id);
            const cooldownProgress = Math.max(0, (cooldown + cooldownTime - now) / cooldownTime);
            
            if (cooldownProgress > 0) {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.fillRect(x, y, skillSize, skillSize * cooldownProgress);
              
              ctx.fillStyle = '#ffffff';
              ctx.font = '12px Arial';
              ctx.fillText(Math.ceil(cooldownProgress * cooldownTime / 1000), x + skillSize/2, y + skillSize/2 + 10);
            }
          });
          
          // 技能点数显示
          ctx.fillStyle = '#FFD700';
          ctx.font = '16px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(`技能点: ${skillPoints}`, gameWidth - 20, gameHeight - 20);
        }

        // 绘制 FPS
        drawFPS(ctx, gameWidth);
      }
      else {
        // 非 playing 状态，绘制覆盖层
        drawOverlay(ctx, gameState, gameWidth, gameHeight, { soundEnabled: gameData.soundEnabled });
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