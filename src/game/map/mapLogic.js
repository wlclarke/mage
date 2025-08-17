
// src/game/map/MapGenerator.js
export class MapGenerator {
  generateMap(width, height, seed) {
    // Your map generation logic here
  }
}

// src/game/map/TileSystem.js
export class TileSystem {
  getTileProperties(tileType) {
    // Tile logic and properties
  }
}

function generateMap(width, height) {
    var map = [];
    
    // Initialize 2D array
    for (let i = 0; i < width; i++) {
        map[i] = [];
        for (let j = 0; j < height; j++) {
            let distance = Math.sqrt(Math.pow(i - width / 2, 2) + Math.pow(j - height / 2, 2));
            let terrainRoll = Math.random();
            let terrain;
            
            if (terrainRoll < 0.5) {
                terrain = 0; // green
            } else if (terrainRoll < 0.7) {
                terrain = 1; // dark green
            } else if (terrainRoll < 0.9) {
                terrain = 2; // grey
            } else {
                terrain = 3; // blue
            }
            
            map[i][j] = {
                x: i,
                y: j,
                type: terrain,
                isVisible: false,
                isExplored: false,
                danger: Math.floor(distance)
            };
        }
    }
    
    return {
        width: width,
        height: height,
        tiles: map
    };
}

export { generateMap };