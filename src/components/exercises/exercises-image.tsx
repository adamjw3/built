"use client"

import { useEffect, useRef, useState } from 'react'
import { parseGIF, decompressFrames } from 'gifuct-js'

interface ExerciseImageProps {
  filename: string
  name: string
  className?: string
  width?: number
  height?: number
  paused?: boolean
}

// Cache for parsed GIF frames to avoid re-parsing
const gifFrameCache = new Map<string, any[]>()

export function ExerciseImage({ 
  filename, 
  name, 
  className = '',
  width = 200,
  height = 200,
  paused = false
}: ExerciseImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [frames, setFrames] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const animationRef = useRef<number>()
  const isGif = filename?.toLowerCase().endsWith('.gif')
  
  // Reset states when filename changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setImageLoaded(false)
  }, [filename])
  
  useEffect(() => {
    if (!isGif) return
    
    setIsLoading(true)
    setHasError(false)
    
    // Check cache first
    if (gifFrameCache.has(filename)) {
      setFrames(gifFrameCache.get(filename)!)
      setIsLoading(false)
      return
    }
    
    fetch(`/images/exercises/${filename}`)
      .then(resp => {
        if (!resp.ok) throw new Error('Failed to load image')
        return resp.arrayBuffer()
      })
      .then(buffer => {
        const gif = parseGIF(buffer)
        const frameData = decompressFrames(gif, true)
        // Cache the parsed frames
        gifFrameCache.set(filename, frameData)
        setFrames(frameData)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error loading GIF:', err)
        setHasError(true)
        setIsLoading(false)
      })
  }, [filename, isGif])
  
  useEffect(() => {
    if (!frames.length || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Draw first frame
    const firstFrame = frames[0]
    canvas.width = firstFrame.dims.width
    canvas.height = firstFrame.dims.height
    
    const imageData = ctx.createImageData(firstFrame.dims.width, firstFrame.dims.height)
    imageData.data.set(firstFrame.patch)
    ctx.putImageData(imageData, 0, 0)
    
    if (paused) return
    
    // Animate if not paused
    let frameIndex = 0
    const animate = () => {
      const frame = frames[frameIndex]
      const imageData = ctx.createImageData(frame.dims.width, frame.dims.height)
      imageData.data.set(frame.patch)
      ctx.putImageData(imageData, 0, 0)
      
      frameIndex = (frameIndex + 1) % frames.length
      animationRef.current = window.setTimeout(animate, frame.delay || 100)
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [frames, paused])
  
  // Loading placeholder
  const LoadingPlaceholder = () => (
    <div 
      className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
      style={{ width, height }}
    >
      <div className="text-gray-400 text-xs">Loading...</div>
    </div>
  )
  
  // Error placeholder
  const ErrorPlaceholder = () => (
    <div 
      className={`${className} bg-gray-100 flex items-center justify-center border`}
      style={{ width, height }}
    >
      <div className="text-gray-400 text-xs">Failed to load</div>
    </div>
  )

  if (!isGif) {
    return (
      <div className="relative" style={{ width, height }}>
        {!imageLoaded && <LoadingPlaceholder />}
        <img
          ref={imgRef}
          src={`/images/exercises/${filename}`}
          alt={name}
          width={width}
          height={height}
          className={`${className} ${!imageLoaded ? 'opacity-0 absolute inset-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => {
            setImageLoaded(true)
            setIsLoading(false)
          }}
          onError={() => {
            setHasError(true)
            setIsLoading(false)
          }}
          loading="lazy"
        />
        {hasError && <ErrorPlaceholder />}
      </div>
    )
  }
  
  if (isLoading) {
    return <LoadingPlaceholder />
  }
  
  if (hasError) {
    return <ErrorPlaceholder />
  }
  
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width, height, maxWidth: '100%', height: 'auto' }}
    />
  )
}