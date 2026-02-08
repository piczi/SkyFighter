// 音效管理 Hook
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  createExplosionSound,
  createShootSound,
  createLaserSound,
  createHitSound,
  createPowerUpSound,
  createBombSound,
  createShieldSound,
  createBombItemSound,
  createEnemyShootSound,
  createPlayerHitSound,
  createGameOverSound,
  createStartSound
} from './soundEffects';

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('gameSoundEnabled');
    return saved === null ? true : saved === 'true';
  });

  const audioContextRef = useRef(null);

  // 初始化 AudioContext
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    // 如果 AudioContext 被挂起，恢复它
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }, []);

  // 用户交互时恢复 AudioContext
  useEffect(() => {
    const handleInteraction = () => {
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    };

    // 监听各种用户交互事件
    ['click', 'keydown', 'touchstart'].forEach(event => {
      window.addEventListener(event, handleInteraction, { once: true, passive: true });
    });

    return () => {
      ['click', 'keydown', 'touchstart'].forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  // 保存设置到 localStorage
  useEffect(() => {
    localStorage.setItem('gameSoundEnabled', soundEnabled.toString());
  }, [soundEnabled]);

  // 生成音效
  const playSound = useCallback((type) => {
    if (!soundEnabled) return;

    const ctx = initAudioContext();
    if (!ctx) return;

    // 如果 AudioContext 被挂起，恢复它
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    switch (type) {
      case 'shoot':
        createShootSound(ctx, now);
        break;
      case 'laser':
        createLaserSound(ctx, now);
        break;
      case 'explosion':
        createExplosionSound(ctx, now);
        break;
      case 'hit':
        createHitSound(ctx, now);
        break;
      case 'powerUp':
        createPowerUpSound(ctx, now);
        break;
      case 'bomb':
        createBombSound(ctx);
        break;
      case 'shield':
        createShieldSound(ctx, now);
        break;
      case 'bombItem':
        createBombItemSound(ctx, now);
        break;
      case 'enemyShoot':
        createEnemyShootSound(ctx, now);
        break;
      case 'playerHit':
        createPlayerHitSound(ctx, now);
        break;
      case 'gameOver':
        createGameOverSound(ctx, now);
        break;
      case 'start':
        createStartSound(ctx, now);
        break;
      default:
        break;
    }
  }, [soundEnabled, initAudioContext]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    soundEnabled,
    playSound,
    toggleSound
  };
}
