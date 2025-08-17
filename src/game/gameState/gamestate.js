import { generateMap } from '../map/mapLogic.js';

// Plain object - better performance
const gameState = {
  map: null,
  turn: 1,
  player: {
    x: 0,
    y: 0,
    // Future player properties can go here:
    // health: 100,
    // inventory: [],
    // level: 1,
    // etc.
  },
  screen: {
    width: window.innerWidth,
    height: window.innerHeight
  },
  gamePhase: 'setup',
  
  // Initialize the game with a new map
  initializeGame(width = 100, height = height) {
    this.map = generateMap(width, height);
    this.gamePhase = 'playing';
    // Reset player to starting position
    this.player.x = 0;
    this.player.y = 0;
    // Update screen dimensions
    this.updateScreenDimensions();
  },
  
  // Update screen dimensions (call on window resize)
  updateScreenDimensions() {
    this.screen.width = window.innerWidth;
    this.screen.height = window.innerHeight;
  },
  
  // Get tile at specific coordinates
  getTileAt(x, y) {
    if (this.map && this.map.tiles && this.map.tiles[x] && this.map.tiles[x][y]) {
      return this.map.tiles[x][y];
    }
    return null;
  },
  
  // Get map dimensions
  getMapWidth() {
    return this.map ? this.map.width : 0;
  },
  
  getMapHeight() {
    return this.map ? this.map.height : 0;
  },
  
  // Player movement methods
  movePlayer(dx, dy) {
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;
    
    // Check if new position is within map bounds
    if (newX >= 0 && newX < this.getMapWidth() && 
        newY >= 0 && newY < this.getMapHeight()) {
      this.player.x = newX;
      this.player.y = newY;
      return true; // Movement successful
    }
    return false; // Movement failed (out of bounds)
  },
  
  // Get player position
  getPlayerPosition() {
    return { x: this.player.x, y: this.player.y };
  },
  
  // Set player position (with bounds checking)
  setPlayerPosition(x, y) {
    if (x >= 0 && x < this.getMapWidth() && 
        y >= 0 && y < this.getMapHeight()) {
      this.player.x = x;
      this.player.y = y;
      return true;
    }
    return false;
  },
  
  // Calculate camera position to center player
  getCameraForPlayer(currentCamera = { x: 0, y: 0 }) {
    const tileSize = 50;
    const playerPos = this.getPlayerPosition();
    
    // Calculate screen center
    const centerX = this.screen.width / 2;
    const centerY = this.screen.height / 2;
    
    // Calculate player position in screen coordinates
    const playerScreenX = playerPos.x * tileSize + tileSize / 2;
    const playerScreenY = playerPos.y * tileSize + tileSize / 2;
    
    // Only center if player is away from edges (50% of screen size from corners)
    const edgeThresholdX = this.screen.width * 0.5;
    const edgeThresholdY = this.screen.height * 0.5;
    
    let cameraX, cameraY;
    
    // X-axis centering
    if (playerScreenX < edgeThresholdX || playerScreenX > this.screen.width - edgeThresholdX) {
      // Player is near edge, center the camera
      cameraX = centerX - playerScreenX;
    } else {
      // Player is in center area, keep camera at current position
      cameraX = currentCamera.x;
    }
    
    // Y-axis centering
    if (playerScreenY < edgeThresholdY || playerScreenY > this.screen.height - edgeThresholdY) {
      // Player is near edge, center the camera
      cameraY = centerY - playerScreenY;
    } else {
      // Player is in center area, keep camera at current position
      cameraY = currentCamera.y;
    }
    
    return { x: cameraX, y: cameraY };
  }
};

export default gameState;