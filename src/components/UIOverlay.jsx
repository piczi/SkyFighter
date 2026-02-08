// UI覆盖层组件
export function UIOverlay({ gameWidth, gameHeight, gameState, handleCanvasClick }) {
  return (
    <div className="overlay-container">
      {gameState === 'start' && (
        <canvas
          width={gameWidth}
          height={gameHeight}
          onClick={handleCanvasClick}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
      {gameState === 'paused' && (
        <canvas
          width={gameWidth}
          height={gameHeight}
          onClick={handleCanvasClick}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
      {gameState === 'gameover' && (
        <canvas
          width={gameWidth}
          height={gameHeight}
          onClick={handleCanvasClick}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
    </div>
  );
}