// 飞机大战游戏 Hook - 主入口
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSound } from './useSound';
import { useGamePool } from './useGamePool';
import { useGameCollision } from './useGameCollision';
import { useGameLogic } from './useGameLogic';
import { runGameLoop } from './gameLoop';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  LEVEL_CONFIG
} from './gameConstants';


export function useGame() {
  const { playSound } = useSound();
  
  // Game Pool
  const {
    initializePools,
    getBullet,
    getEnemy,
    getParticle,
    getItem,
    returnBullet,
    returnParticle,
    returnExplosion
  } = useGamePool();
  
  // Game Collision
  const { checkCollisions, checkBossCollisions } = useGameCollision();
  
  // Game Logic
  const {
    createPlayerBullets,
    spawnEnemy,
    handleShooterEnemy,
    handleBomberEnemy,
    handleSplitterEnemy,
    handleBoss,
    updateBullets,
    handleItemCollection,
    createBossConfig
  } = useGameLogic();

  // State
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [stage, setStage] = useState(1);
  const [boss, setBoss] = useState(null);
  const [player, setPlayer] = useState({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 100,
    hp: 100,
    power: 1,
    shield: 0,
    weapon: 'normal',
    skills: []
  });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [items, setItems] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [bombCount, setBombCount] = useState(LEVEL_CONFIG.bombInitialCount);

  // Refs
  const gameLoopRef = useRef(null);
  const lastShootRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const scoreRef = useRef(0);
  const enemiesRef = useRef([]);
  const bulletsRef = useRef([]);
  const playerRef = useRef({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 100,
    hp: 100,
    power: 1,
    shield: 0,
    weapon: 'normal',
    skills: []
  });
  const lastPlayerStateRef = useRef(null);
  const touchPositionRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 });
  const isTouchingRef = useRef(false);
  const comboResetTimeoutRef = useRef(null);

  // 开始游戏
  const startGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setLevel(1);
    setStage(1);
    setBoss(null);
    setCombo(0);
    setMaxCombo(0);
    
    // 使用当前触摸位置或默认位置
    const initialPlayer = {
      x: touchPositionRef.current.x || GAME_WIDTH / 2,
      y: touchPositionRef.current.y || GAME_HEIGHT - 100,
      hp: 100,
      power: 1,
      shield: 0,
      weapon: 'normal',
      skills: []
    };
    
    playerRef.current = initialPlayer;
    setPlayer(initialPlayer);
    bulletsRef.current = [];
    setBullets([]);
    enemiesRef.current = [];
    setEnemies([]);
    setItems([]);
    setExplosions([]);
    setBombCount(LEVEL_CONFIG.bombInitialCount);
    setGameState('playing');
    lastShootRef.current = 0;
    lastSpawnRef.current = 0;
    isTouchingRef.current = false; // 重置触摸状态
    initializePools();
  }, [initializePools]);

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
          particles.push(getParticle({
            x: 0,
            y: 0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            size: Math.random() * 8 + 4,
            color: Math.random() > 0.5 ? '#ff6b6b' : Math.random() > 0.5 ? '#ffd93d' : '#ff8800'
          }));
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
  }, [bombCount, gameState, playSound, getParticle]);

  // 处理触摸/鼠标移动
  const handleMove = useCallback((x, y) => {
    touchPositionRef.current = { x, y };
    isTouchingRef.current = true;
  }, []);

  // 处理触摸/鼠标结束
  const handleEnd = useCallback(() => {
    isTouchingRef.current = false;
  }, []);

  // 游戏循环
  useEffect(() => {
    const gameLoop = () => {
      runGameLoop({
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
      });
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (comboResetTimeoutRef.current) {
        clearTimeout(comboResetTimeoutRef.current);
        comboResetTimeoutRef.current = null;
      }
    };
  }, [gameState, level, score, combo, maxCombo, stage, boss, playSound,
      getBullet, getEnemy, getParticle, getItem, returnBullet, returnParticle, returnExplosion,
      createPlayerBullets, spawnEnemy, handleShooterEnemy, handleBomberEnemy, handleSplitterEnemy,
      handleBoss, updateBullets, handleItemCollection, createBossConfig,
      checkCollisions, checkBossCollisions, setScore, setLevel, setStage, setBoss,
      setCombo, setMaxCombo, setPlayer, setEnemies, setItems, setExplosions,
      setBombCount, setGameState]);

  return {
    gameState,
    score,
    level,
    stage,
    boss,
    combo,
    maxCombo,
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
    handleBomb: useHandleBomb,
    playerRef,
    bulletsRef,
    enemiesRef,
    soundEnabled: true,
  };
}