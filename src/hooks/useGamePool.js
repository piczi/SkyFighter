import { useCallback, useRef } from 'react';
import { POOL_CONFIG } from './gameConstants';

/**
 * 游戏对象池管理Hook
 * @returns {Object} 对象池管理函数
 */
export function useGamePool() {
  const bulletPoolRef = useRef([]);
  const enemyPoolRef = useRef([]);
  const particlePoolRef = useRef([]);
  const explosionPoolRef = useRef([]);
  const itemPoolRef = useRef([]);

  /**
   * 初始化对象池
   */
  const initializePools = useCallback(() => {
    bulletPoolRef.current = Array.from({ length: POOL_CONFIG.bullets }, () => null);
    enemyPoolRef.current = Array.from({ length: POOL_CONFIG.enemies }, () => null);
    particlePoolRef.current = Array.from({ length: POOL_CONFIG.particles }, () => null);
    explosionPoolRef.current = Array.from({ length: POOL_CONFIG.explosions }, () => null);
    itemPoolRef.current = Array.from({ length: POOL_CONFIG.items }, () => null);
  }, []);

  /**
   * 从池中获取对象
   * @param {Array} pool - 对象池
   * @param {Function} createFn - 创建对象的函数
   * @returns {Object} 对象
   */
  const getObjectFromPool = useCallback((pool, createFn) => {
    for (let i = 0; i < pool.length; i++) {
      if (pool[i] === null) {
        pool[i] = createFn();
        return pool[i];
      }
    }
    // 池满时创建新对象
    const newObj = createFn();
    pool.push(newObj);
    return newObj;
  }, []);

  /**
   * 从池中获取子弹
   * @param {Function} createFn - 创建子弹的函数
   * @returns {Object} 子弹对象
   */
  const getBullet = useCallback((createFn) => {
    return getObjectFromPool(bulletPoolRef.current, createFn);
  }, [getObjectFromPool]);

  /**
   * 从池中获取敌人
   * @param {Function} createFn - 创建敌人的函数
   * @returns {Object} 敌人对象
   */
  const getEnemy = useCallback((createFn) => {
    return getObjectFromPool(enemyPoolRef.current, createFn);
  }, [getObjectFromPool]);

  /**
   * 从池中获取粒子
   * @param {Object} config - 粒子配置
   * @returns {Object} 粒子对象
   */
  const getParticle = useCallback((config) => {
    return getObjectFromPool(particlePoolRef.current, () => ({ ...config }));
  }, [getObjectFromPool]);

  /**
   * 从池中获取爆炸效果
   * @param {Function} createFn - 创建爆炸效果的函数
   * @returns {Object} 爆炸效果对象
   */
  const getExplosion = useCallback((createFn) => {
    return getObjectFromPool(explosionPoolRef.current, createFn);
  }, [getObjectFromPool]);

  /**
   * 从池中获取道具
   * @param {Object} item - 道具数据
   * @returns {Object} 道具对象
   */
  const getItem = useCallback((item) => {
    return getObjectFromPool(itemPoolRef.current, () => ({ ...item }));
  }, [getObjectFromPool]);

  /**
   * 返回对象到池
   * @param {Array} pool - 对象池
   * @param {Object} obj - 对象
   * @returns {boolean} 是否成功返回
   */
  const returnObjectToPool = useCallback((pool, obj) => {
    for (let i = 0; i < pool.length; i++) {
      if (pool[i] === obj) {
        pool[i] = null;
        return true;
      }
    }
    return false;
  }, []);

  /**
   * 返回子弹到池
   * @param {Object} bullet - 子弹对象
   */
  const returnBullet = useCallback((bullet) => {
    returnObjectToPool(bulletPoolRef.current, bullet);
  }, [returnObjectToPool]);

  /**
   * 返回粒子到池
   * @param {Object} particle - 粒子对象
   */
  const returnParticle = useCallback((particle) => {
    returnObjectToPool(particlePoolRef.current, particle);
  }, [returnObjectToPool]);

  /**
   * 返回爆炸效果到池
   * @param {Object} explosion - 爆炸效果对象
   */
  const returnExplosion = useCallback((explosion) => {
    returnObjectToPool(explosionPoolRef.current, explosion);
  }, [returnObjectToPool]);

  return {
    // Pool refs
    bulletPoolRef,
    enemyPoolRef,
    particlePoolRef,
    explosionPoolRef,
    itemPoolRef,
    // Methods
    initializePools,
    getObjectFromPool,
    returnObjectToPool,
    // Convenience methods
    getBullet,
    getEnemy,
    getParticle,
    getExplosion,
    getItem,
    returnBullet,
    returnParticle,
    returnExplosion
  };
}