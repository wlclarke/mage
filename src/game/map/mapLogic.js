
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
                danger: Math.floor(distance),
                settlement: 0,
                roadLevel: 0
            };
        }
    }
    
    //generate the highway recursively. takes in x and y, modifies either the left or upper tile
    function generateHighway(x,y) {

        map[x][y].roadLevel = 2;

        if (x == 0 && y == 0) {
            return;
        }

        if (x == 0) {
            generateHighway(x,y-1);
        }
        else if (y == 0) {
            generateHighway(x-1,y);
        } else {
            let roll = Math.random();
            if (roll < 0.5) {
                generateHighway(x,y-1);
            } else {
                generateHighway(x-1,y);
            }
        }
        
    }

    function 

    
    return {
        width: width,
        height: height,
        tiles: map
    };
}

function generateVillage(x,y,terrain) {

    var village = {
        name: "Village",
        population: 0,
        x: x,
        y: y,
        tradeLevel: 0,
        innLevel: 0,
        leaderLevel: false,
        friendliness: 0
    };

    return village;


}



export { generateMap };