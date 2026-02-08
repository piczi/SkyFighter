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
  const memoizedCreatePlayerBullets = useCallback(createPlayerBullets, []);
  const memoizedSpawnEnemy = useCallback(spawnEnemy, []);
  const memoizedHandleShooterEnemy = useCallback(handleShooterEnemy, []);
  const memoizedHandleBomberEnemy = useCallback(handleBomberEnemy, []);
  const memoizedHandleSplitterEnemy = useCallback(handleSplitterEnemy, []);
  const memoizedHandleBoss = useCallback(handleBoss, []);
  const memoizedUpdateBullets = useCallback(updateBullets, []);
  const memoizedHandleItemCollection = useCallback(handleItemCollection, []);
  const memoizedCreateBossConfig = useCallback(createBossConfig, []);

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