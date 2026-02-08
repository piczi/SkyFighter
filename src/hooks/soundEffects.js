// 音效生成函数
export function createExplosionSound(ctx, now) {
  // 1. 轰鸣主体 - 低频噪声
  const bufferSize = ctx.sampleRate * 0.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
  }

  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  const lowpass = ctx.createBiquadFilter();

  noise.buffer = buffer;
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(400, now);
  lowpass.frequency.exponentialRampToValueAtTime(100, now + 0.4);

  noiseGain.gain.setValueAtTime(0.5, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

  noise.connect(lowpass);
  lowpass.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now);

  // 2. 低频震动 - 模拟雷声的"隆隆"感
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(60, now);
  osc1.frequency.exponentialRampToValueAtTime(30, now + 0.4);

  gain1.gain.setValueAtTime(0.4, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.4);

  // 3. 二次轰鸣 - 回响感
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(40, now);
  osc2.frequency.exponentialRampToValueAtTime(20, now + 0.3);

  gain2.gain.setValueAtTime(0.25, now);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(now);
  osc2.stop(now + 0.3);

  // 4. 冲击感 - 快速的低频脉冲
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();

  osc3.type = 'sawtooth';
  osc3.frequency.setValueAtTime(200, now);
  osc3.frequency.exponentialRampToValueAtTime(50, now + 0.1);

  gain3.gain.setValueAtTime(0.2, now);
  gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  osc3.connect(gain3);
  gain3.connect(ctx.destination);

  osc3.start(now);
  osc3.stop(now + 0.1);
}

export function createShootSound(ctx, now) {
  // 射击音效 - 快速的"啾"声
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(1000, now);
  oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.08);

  gainNode.gain.setValueAtTime(0.12, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

  oscillator.start(now);
  oscillator.stop(now + 0.08);
}

export function createLaserSound(ctx, now) {
  // 激光音效 - 柔和、持续的"嗡嗡"声
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(600, now);
  oscillator.frequency.setValueAtTime(500, now + 0.02);
  oscillator.frequency.setValueAtTime(400, now + 0.04);

  gainNode.gain.setValueAtTime(0.08, now);
  gainNode.gain.exponentialRampToValueAtTime(0.02, now + 0.06);

  oscillator.start(now);
  oscillator.stop(now + 0.06);
}

export function createHitSound(ctx, now) {
  // 击中音效 - 短促的"砰"声
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'square';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

  osc.start(now);
  osc.stop(now + 0.05);
}

export function createPowerUpSound(ctx, now) {
  // 获得强化道具音效 - 充满快乐的上升音
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now + i * 0.08);

    gainNode.gain.setValueAtTime(0.2, now + i * 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);

    oscillator.start(now + i * 0.08);
    oscillator.stop(now + i * 0.08 + 0.15);
  });
}

export function createBombSound(ctx, now) {
  // 炸弹音效 - 连续爆炸
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createExplosionSound(ctx, ctx.currentTime);
    }, i * 80);
  }
}

export function createShieldSound(ctx, now) {
  // 护盾音效 - 科技感的上升音
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(400, now);
  oscillator.frequency.exponentialRampToValueAtTime(1600, now + 0.25);

  gainNode.gain.setValueAtTime(0.15, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

  oscillator.start(now);
  oscillator.stop(now + 0.25);
}

export function createBombItemSound(ctx, now) {
  // 获得炸弹音效 - 活泼的音效
  const notes = [392, 523, 659]; // G4, C5, E5
  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(freq, now + i * 0.06);

    gainNode.gain.setValueAtTime(0.15, now + i * 0.06);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.1);

    oscillator.start(now + i * 0.06);
    oscillator.stop(now + i * 0.06 + 0.1);
  });
}

export function createEnemyShootSound(ctx, now) {
  // 敌人射击音效 - 较低沉的"啵"声
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(330, now);
  oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.1);

  gainNode.gain.setValueAtTime(0.1, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  oscillator.start(now);
  oscillator.stop(now + 0.1);
}

export function createPlayerHitSound(ctx, now) {
  // 玩家受伤音效
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(200, now);
  oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2);

  gainNode.gain.setValueAtTime(0.2, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

export function createGameOverSound(ctx, now) {
  // 游戏结束音效 - 悲伤的下降音
  const notes = [523, 494, 440, 392, 330];
  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(freq, now + i * 0.2);

    gainNode.gain.setValueAtTime(0.2, now + i * 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.3);

    oscillator.start(now + i * 0.2);
    oscillator.stop(now + i * 0.2 + 0.3);
  });
}

export function createStartSound(ctx, now) {
  // 游戏开始音效 - 充满活力的上升音
  const notes = [392, 523, 659, 784, 1047]; // G4, C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now + i * 0.08);

    gainNode.gain.setValueAtTime(0.15, now + i * 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);

    oscillator.start(now + i * 0.08);
    oscillator.stop(now + i * 0.08 + 0.2);
  });
}