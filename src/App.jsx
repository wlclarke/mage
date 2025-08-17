import { useState, useRef, useEffect } from 'react'
import gameState from './game/gameState/gamestate.js'
import './App.css'

/**
 * Main Game Component
 * 
 * This component serves as the root container for the turn-based game.
 * It manages the overall layout and state for:
 * - Game map (canvas element)
 * - Button menu (bottom toolbar)
 * - Event log (collapsible sidebar)
 * 
 * The layout is designed to be responsive and adapt to different screen sizes.
 */
function App() {
  // State for managing the event log visibility
  const [isLogOpen, setIsLogOpen] = useState(true)
  
  // Reference to the canvas element for future game logic
  const canvasRef = useRef(null)
  
  // Reference to the canvas container for responsive sizing
  const canvasContainerRef = useRef(null)
  
  // Camera/pan state
  const [camera, setCamera] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // Force re-render when player moves
  const [, forceUpdate] = useState({})
  
  // Player sprite image
  const [playerSprite, setPlayerSprite] = useState(null)

  /**
   * Load player sprite image
   */
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setPlayerSprite(img)
      // Re-render map when sprite loads
      const canvas = canvasRef.current
      if (canvas) {
        renderMap(canvas)
      }
    }
    img.onerror = () => {
      console.warn('Failed to load player sprite, using fallback circle')
      setPlayerSprite(null)
      // Re-render map with fallback
      const canvas = canvasRef.current
      if (canvas) {
        renderMap(canvas)
      }
    }
    // Preload the sprite
    img.src = '/assets/images/sprites/playerSprite.png'
  }, [])

  /**
   * Effect hook to handle canvas initialization and responsive sizing
   * 
   * This effect runs on component mount and whenever the canvas container
   * reference changes. It sets up the canvas with proper dimensions
   * and prepares it for future game rendering.
   */
  useEffect(() => {
    const canvas = canvasRef.current
    const container = canvasContainerRef.current
    
    if (canvas && container) {
      // Initialize game state
      gameState.initializeGame(100, 100)
      
      // Set initial camera to center player
      setCamera(gameState.getCameraForPlayer({ x: 0, y: 0 }))
      
      // Set canvas size to match container size
      const resizeCanvas = () => {
        const rect = container.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
        
        // Update screen dimensions in game state
        gameState.updateScreenDimensions()
        
        // Render the map
        renderMap(canvas)
      }
      
      // Initial resize
      resizeCanvas()
      
      // Add resize listener for responsive behavior
      const resizeObserver = new ResizeObserver(resizeCanvas)
      resizeObserver.observe(container)
      
      // Add window resize listener
      const handleWindowResize = () => {
        gameState.updateScreenDimensions()
        setCamera(gameState.getCameraForPlayer(camera))
      }
      window.addEventListener('resize', handleWindowResize)
      
      // Cleanup function to remove observers and listeners
      return () => {
        resizeObserver.disconnect()
        window.removeEventListener('resize', handleWindowResize)
      }
    }
  }, []) // Only run on mount

  /**
   * Handle mouse down for panning
   */
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - camera.x,
      y: e.clientY - camera.y
    })
  }

  /**
   * Handle mouse move for panning
   */
  const handleMouseMove = (e) => {
    if (isDragging) {
      setCamera({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  /**
   * Handle mouse up to stop panning
   */
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  /**
   * Handle mouse leave to stop panning
   */
  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  /**
   * Move player in specified direction
   */
  const movePlayer = (dx, dy) => {
    if (gameState.movePlayer(dx, dy)) {
      // Update camera to follow player (only when near edges)
      const newCamera = gameState.getCameraForPlayer(camera)
      setCamera(newCamera)
      // Force re-render to update log
      forceUpdate({})
      // Re-render the map with new player position
      const canvas = canvasRef.current
      if (canvas) {
        renderMap(canvas)
      }
    }
  }

  /**
   * Render the game map on the canvas
   * 
   * Draws the map tiles based on the game state data
   */
  const renderMap = (canvas) => {
    const ctx = canvas.getContext('2d')
    const map = gameState.map
    
    if (!map) return
    
    const mapWidth = gameState.getMapWidth()
    const mapHeight = gameState.getMapHeight()
    
    // Fixed tile size
    const tileSize = 50
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Define tile colors
    const tileColors = {
      0: '#90EE90', // green
      1: '#228B22', // dark green
      2: '#808080', // grey
      3: '#4169E1'  // blue
    }
    
    // Calculate visible tile range
    const startX = Math.floor(-camera.x / tileSize)
    const endX = Math.min(mapWidth, Math.ceil((-camera.x + canvas.width) / tileSize))
    const startY = Math.floor(-camera.y / tileSize)
    const endY = Math.min(mapHeight, Math.ceil((-camera.y + canvas.height) / tileSize))
    
    // Draw visible tiles only
    for (let x = Math.max(0, startX); x < endX; x++) {
      for (let y = Math.max(0, startY); y < endY; y++) {
        const tile = gameState.getTileAt(x, y)
        if (tile) {
          const color = tileColors[tile.type] || '#000000'
          
          ctx.fillStyle = color
          ctx.fillRect(
            x * tileSize + camera.x,
            y * tileSize + camera.y,
            tileSize,
            tileSize
          )
        }
      }
    }
    
    // Draw the player
    const playerPos = gameState.getPlayerPosition()
    const playerX = playerPos.x * tileSize + camera.x
    const playerY = playerPos.y * tileSize + camera.y
    
    if (playerSprite) {
      // Draw player sprite
      ctx.drawImage(
        playerSprite,
        playerX,
        playerY,
        tileSize,
        tileSize
      )
    } else {
      // Fallback to red circle if sprite fails to load
      const playerRadius = tileSize * 0.3
      
      // Player circle
      ctx.fillStyle = '#FF0000' // Red player
      ctx.beginPath()
      ctx.arc(
        playerX + tileSize / 2,
        playerY + tileSize / 2,
        playerRadius,
        0,
        2 * Math.PI
      )
      ctx.fill()
      
      // Player border
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  /**
   * Toggle function for the event log visibility
   * 
   * This function switches the log between open and closed states,
   * allowing users to show/hide the event log as needed.
   */
  const toggleLog = () => {
    setIsLogOpen(!isLogOpen)
  }

  return (
    <div className="game-container">
      {/* Main game area with canvas */}
      <div className="game-main">
        <div 
          ref={canvasContainerRef} 
          className="canvas-container"
        >
          <canvas
            ref={canvasRef}
            className="game-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          />
        </div>
        
        {/* Bottom button menu */}
        <div className="button-menu">
          <button 
            className="game-button"
            onClick={() => movePlayer(0, -1)}
          >
            North
          </button>
          <button 
            className="game-button"
            onClick={() => movePlayer(1, 0)}
          >
            East
          </button>
          <button 
            className="game-button"
            onClick={() => movePlayer(0, 1)}
          >
            South
          </button>
          <button 
            className="game-button"
            onClick={() => movePlayer(-1, 0)}
          >
            West
          </button>
          <button className="game-button">
            End Turn
          </button>
        </div>
      </div>
      
      {/* Collapsible event log */}
      <div className={`event-log ${isLogOpen ? 'open' : 'closed'}`}>
        <div className="log-header">
          <h3>Event Log</h3>
          <button 
            className="log-toggle"
            onClick={toggleLog}
            aria-label={isLogOpen ? 'Close log' : 'Open log'}
          >
            {isLogOpen ? '×' : '≡'}
          </button>
        </div>
        <div className="log-content">
          <p>Hello, this is the log</p>
          <p>Map generated: {gameState.getMapWidth()}x{gameState.getMapHeight()}</p>
          <p>Screen: {gameState.screen.width}x{gameState.screen.height}</p>
          <p>Player position: ({gameState.getPlayerPosition().x}, {gameState.getPlayerPosition().y})</p>
          <p>Camera: ({Math.round(camera.x)}, {Math.round(camera.y)})</p>
          <p>Player sprite: {playerSprite ? 'Loaded' : 'Loading...'}</p>
        </div>
      </div>
    </div>
  )
}

export default App
