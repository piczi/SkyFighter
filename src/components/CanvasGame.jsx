// 游戏主组件 - Canvas 版本
import { useEffect, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { useSound } from '../hooks/useSound';
import { GameRenderer } from './GameRenderer';

export function CanvasGame() {
  const gameData = useGame();
  const { playSound, toggleSound } = useSound();
  
  const {
    gameState,
    gameWidth,
    gameHeight,
    startGame,
    togglePause,
    activeSkills,
    activateSkill,
    handleMove,
    handleEnd,
    handleBomb
  } = gameData;

  const canvasRef = useRef(null);
  const gameStateRef = useRef(gameState);

  // 同步 gameState 到 ref
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // 处理点击开始/继续游戏
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 处理技能点击
    if (gameState === 'playing') {
      // 技能点击处理移到 UIOverlay 组件中
      return;
    }

    if (gameStateRef.current === 'start') {
      // 检查是否点击音效按钮
      const soundBtnX = gameWidth / 2;
      const soundBtnY = gameHeight / 2 + 55;
      const distToSound = Math.sqrt(Math.pow(x - soundBtnX, 2) + Math.pow(y - soundBtnY, 2));
      if (distToSound < 25) {
        toggleSound();
        return;
      }

        // 检查是否点击开始按钮
        if (y > gameHeight / 2 + 260 && y < gameHeight / 2 + 310 &&
            x > gameWidth / 2 - 100 && x < gameWidth / 2 + 100) {
          playSound('start');
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
        playSound('start');
        startGame();
      }
    }
  };

  // 触摸/鼠标事件处理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isTouchDevice = false;

    const handleTouchStart = (e) => {
      isTouchDevice = true;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      handleMove(x, y);
    };

    const handleTouchMove = (e) => {
      if (!isTouchDevice) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      handleMove(x, y);
    };

    const handleMouseMove = (e) => {
      // 对于鼠标设备，移动时始终跟随
      if (isTouchDevice) return; // 如果是触摸设备，忽略鼠标移动
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleMove(x, y);
    };

    const handleTouchEnd = () => handleEnd();
    const handleMouseLeave = () => {
      // 鼠标离开canvas时停止跟随
      handleEnd();
    };
    const handleMouseDown = (e) => {
      // 鼠标点击时也触发移动（兼容性）
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleMove(x, y);
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
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
         handleBomb();
      } else if (e.code === 'Digit1') {
        // 使用技能1 - 时间减缓
        if (activeSkills.includes('timeSlow')) {
          activateSkill('timeSlow');
        }
      } else if (e.code === 'Digit2') {
        // 使用技能2 - 范围伤害
        if (activeSkills.includes('areaDamage')) {
          activateSkill('areaDamage');
        }
      } else if (e.code === 'Digit3') {
        // 使用技能3 - 自动瞄准
        if (activeSkills.includes('autoAim')) {
          activateSkill('autoAim');
        }
      } else if (e.code === 'Digit4') {
        // 使用技能4 - 能量护盾
        if (activeSkills.includes('energyShield')) {
          activateSkill('energyShield');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
   }, [gameState, startGame, togglePause, handleBomb, activeSkills, activateSkill]);

  return (
    <div className="game-container">
      <GameRenderer
        canvasRef={canvasRef}
        gameWidth={gameWidth}
        gameHeight={gameHeight}
        gameState={gameState}
        handleCanvasClick={handleCanvasClick}
        gameData={gameData}
      />
    </div>
  );
}

