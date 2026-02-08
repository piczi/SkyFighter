import { useCallback } from 'react';
import { createBossConfig } from './gameUtils';
import { createPlayerBullets, updateBullets } from './gameLogicBullets';
import { spawnEnemy, handleShooterEnemy, handleBomberEnemy, handleSplitterEnemy } from './gameLogicEnemies';
import { handleBoss } from './gameLogicBoss';
import { handleItemCollection } from './gameLogicItems';
import { ENEMY_SIZE } from './gameConstants';

/**
 * 游戏逻辑Hook
 * @returns {Object} 游戏逻辑函数
 */
export function useGameLogic() {
  const memoizedCreatePlayerBullets = useCallback((...args) => createPlayerBullets(...args), []);
  const memoizedSpawnEnemy = useCallback((...args) => spawnEnemy(...args), []);
  const memoizedHandleShooterEnemy = useCallback((...args) => handleShooterEnemy(...args), []);
  const memoizedHandleBomberEnemy = useCallback((...args) => handleBomberEnemy(...args), []);
  const memoizedHandleSplitterEnemy = useCallback((...args) => handleSplitterEnemy(...args), []);
  const memoizedHandleBoss = useCallback((...args) => handleBoss(...args), []);
  const memoizedUpdateBullets = useCallback((...args) => updateBullets(...args), []);
  const memoizedHandleItemCollection = useCallback((...args) => handleItemCollection(...args), []);
  const memoizedCreateBossConfig = useCallback((...args) => createBossConfig(...args), []);

  return {
    createPlayerBullets: memoizedCreatePlayerBullets,
    spawnEnemy: memoizedSpawnEnemy,
    handleShooterEnemy: memoizedHandleShooterEnemy,
    handleBomberEnemy: memoizedHandleBomberEnemy,
    handleSplitterEnemy: memoizedHandleSplitterEnemy,
    handleBoss: memoizedHandleBoss,
    updateBullets: memoizedUpdateBullets,
    handleItemCollection: memoizedHandleItemCollection,
    createBossConfig: memoizedCreateBossConfig
  };
}