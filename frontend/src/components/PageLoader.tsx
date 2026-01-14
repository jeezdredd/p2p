import { useEffect, useState } from 'react'
import './PageLoader.css'

interface PageLoaderProps {
  onComplete?: () => void
}

export default function PageLoader({ onComplete }: PageLoaderProps) {
  const [fillProgress, setFillProgress] = useState(0)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    console.log('PageLoader mounted')
    const TOTAL_DURATION = 2500 // 2.5 seconds
    const FILL_DURATION = 2000 // 2 seconds for filling
    const CURTAIN_DELAY = 200 // 0.2 seconds pause before curtain
    const CURTAIN_DURATION = 300 // 0.3 seconds for curtain animation
    
    const startTime = Date.now()

    // Smooth fill animation
    const fillInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / FILL_DURATION) * 100, 100)
      setFillProgress(Math.floor(progress))

      if (progress >= 100) {
        clearInterval(fillInterval)
        console.log('Fill complete')
      }
    }, 16) // ~60fps

    // Start curtain reveal after fill + delay
    const curtainTimer = setTimeout(() => {
      console.log('Curtain revealing')
      setIsRevealing(true)
    }, FILL_DURATION + CURTAIN_DELAY)

    // Complete and cleanup
    const completeTimer = setTimeout(() => {
      console.log('PageLoader complete')
      setIsComplete(true)
      onComplete?.()
    }, TOTAL_DURATION)

    return () => {
      clearInterval(fillInterval)
      clearTimeout(curtainTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  console.log('PageLoader render:', { fillProgress, isRevealing, isComplete })

  if (isComplete) return null

  return (
    <div className={`page-loader ${isRevealing ? 'revealing' : ''}`}>
      <div className="loader-container">
        {/* Liquid fill effect */}
        <div 
          className="liquid-fill"
          style={{ height: `${fillProgress}%` }}
        >
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>

        {/* Logo/Text in center */}
        <div className="loader-content">
          <div className="loader-logo">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="3" />
              <text
                x="40"
                y="50"
                fontSize="28"
                fontWeight="bold"
                textAnchor="middle"
                fill="currentColor"
              >
                P2P
              </text>
            </svg>
          </div>
          <div className="loader-text">
            <span className="loading-text">Loading</span>
            <span className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${fillProgress}%` }}
            />
          </div>
          <div className="progress-percent">{fillProgress}%</div>
        </div>
      </div>

      {/* Curtain reveal effect */}
      <div className="curtain curtain-left"></div>
      <div className="curtain curtain-right"></div>
    </div>
  )
}
