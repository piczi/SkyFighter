// 道具相关逻辑
import { getNextWeapon } from './gameUtils';
import {
  PLAYER_SIZE,
  ITEM_CONFIG
} from './gameConstants';

/**
 * 处理道具收集
 * @param {Array} items - 道具数组
 * @param {Object} player - 玩家对象
 * @param {Object} setters - 状态设置函数
 * @param {Function} playSound - 播放音效函数
 * @returns {Array} 过滤后的道具数组
 */
export function handleItemCollection(items, player, setters, playSound) {
  return items.filter(item => {
    const collected =
      Math.abs(item.x - player.x) < PLAYER_SIZE &&
      Math.abs(item.y - player.y) < PLAYER_SIZE;

    if (collected) {
      switch (item.type) {
        case 'power':
          player.power = Math.min(ITEM_CONFIG.powerMax, player.power + 1);
          playSound('powerUp');
          break;
        case 'bomb':
          setters.setBombCount(prev => prev + 1);
          playSound('bombItem');
          break;
        case 'shield':
          player.shield = Math.min(ITEM_CONFIG.shieldMax, player.shield + ITEM_CONFIG.shieldIncrease);
          playSound('shield');
          break;
        case 'weapon':
          player.weapon = getNextWeapon(player.weapon);
          player.power = 1;
          playSound('powerUp');
          break;
      }
      return false;
    }
    return true;
  });
}