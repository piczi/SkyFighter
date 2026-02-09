// 游戏主组件 - Canvas 版本
import { useEffect, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { useSound } from '../hooks/useSound';
import { GameRenderer } from './GameRenderer';

export function CanvasGame() {
  const { soundEnabled, playSound, toggleSound } = useSound();
  const gameData = useGame({ soundEnabled, playSound });
  
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
  const uiClickHandlersRef = useRef(null);

  // 同步 gameState 到 ref
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // 初始化 UI 点击处理函数 ref
  useEffect(() => {
    uiClickHandlersRef.current = {
      gameWidth,
      gameHeight,
      toggleSound,
      playSound,
      startGame,
      togglePause
    };
  }, [gameWidth, gameHeight, toggleSound, playSound, startGame, togglePause]);

  // 处理窗口大小变化
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateSize, 100);
    });

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  // 处理点击开始/继续游戏
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    handleUIClick(x, y);
  };

  // 统一的 UI 点击处理函数
  const handleUIClick = (x, y) => {
    const handlers = uiClickHandlersRef.current;
    if (!handlers) return;

    if (gameStateRef.current === 'playing') {
      return;
    }

    const { gameWidth, gameHeight, toggleSound, playSound, startGame, togglePause } = handlers;

    if (gameStateRef.current === 'start') {
      const soundBtnX = gameWidth / 2;
      const soundBtnY = gameHeight / 2 + 55;
      const distToSound = Math.sqrt(Math.pow(x - soundBtnX, 2) + Math.pow(y - soundBtnY, 2));
      if (distToSound < 25) {
        toggleSound();
        return;
      }

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

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const handleTouchStart = (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        if (gameStateRef.current !== 'playing') {
          handleUIClick(x, y);
        } else {
          handleMove(x, y);
        }
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        handleMove(x, y);
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      handleEnd();
    };

    const handleMouseMove = (e) => {
      if (isTouchDevice) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleMove(x, y);
    };

    const handleMouseLeave = () => {
      handleEnd();
    };

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleMove(x, y);
    };

    canvas.style.touchAction = 'none';
    canvas.style.webkitTouchCallout = 'none';
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
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

