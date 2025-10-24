"use client"

import { useState, useEffect } from 'react'
import { Play, ExternalLink } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  className?: string
  width?: number
  height?: number
  autoplay?: boolean
  showTitle?: boolean
}

interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'unknown'
  id: string
  embedUrl: string
  thumbnailUrl: string
  title?: string
  error?: string
}

export function VideoPlayer({ 
  url, 
  className = '',
  width = 560,
  height = 315,
  autoplay = false,
  showTitle = false
}: VideoPlayerProps) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)

  // Extract video ID and type from URL
  const parseVideoUrl = (url: string): { type: VideoInfo['type'], id: string } => {
    if (!url) return { type: 'unknown', id: '' }

    // YouTube patterns
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const youtubeMatch = url.match(youtubeRegex)
    if (youtubeMatch) {
      return { type: 'youtube', id: youtubeMatch[1] }
    }

    // Vimeo patterns
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/
    const vimeoMatch = url.match(vimeoRegex)
    if (vimeoMatch) {
      return { type: 'vimeo', id: vimeoMatch[1] }
    }

    return { type: 'unknown', id: '' }
  }

  // Fetch video metadata
  useEffect(() => {
    if (!url) {
      setVideoInfo(null)
      return
    }

    const { type, id } = parseVideoUrl(url)
    
    if (type === 'unknown' || !id) {
      setVideoInfo({
        type: 'unknown',
        id: '',
        embedUrl: '',
        thumbnailUrl: '',
        error: 'Invalid video URL. Please use a valid YouTube or Vimeo URL.'
      })
      return
    }

    setIsLoading(true)

    const fetchVideoInfo = async () => {
      try {
        if (type === 'youtube') {
          const embedUrl = `https://www.youtube.com/embed/${id}${autoplay ? '?autoplay=1' : ''}`
          const thumbnailUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`
          
          // Skip API calls to avoid CORS issues  
          setVideoInfo({
            type: 'youtube',
            id,
            embedUrl,
            thumbnailUrl
          })
        } else if (type === 'vimeo') {
          const embedUrl = `https://player.vimeo.com/video/${id}${autoplay ? '?autoplay=1' : ''}`
          
          // Skip API calls to avoid CORS issues
          setVideoInfo({
            type: 'vimeo',
            id,
            embedUrl,
            thumbnailUrl: `https://vumbnail.com/${id}.jpg`
          })
        }
      } catch (error) {
        setVideoInfo({
          type,
          id,
          embedUrl: '',
          thumbnailUrl: '',
          error: 'Failed to load video information'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideoInfo()
  }, [url, autoplay])

  if (!url) return null

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`} style={{ width, height }}>
        <div className="text-gray-500 text-sm">Loading video...</div>
      </div>
    )
  }

  if (videoInfo?.error) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm`}>
        {videoInfo.error}
      </div>
    )
  }

  if (!videoInfo) return null

  const handlePlayClick = () => {
    setShowPlayer(true)
  }

  if (showPlayer) {
    return (
      <div className={`${className} relative`}>
        {showTitle && videoInfo.title && (
          <h3 className="text-sm font-medium text-gray-900 mb-2">{videoInfo.title}</h3>
        )}
        <div className="relative rounded-lg overflow-hidden" style={{ width, height }}>
          <iframe
            src={videoInfo.embedUrl}
            width={width}
            height={height}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <button
            onClick={() => setShowPlayer(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Hide video
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>Open in {videoInfo.type === 'youtube' ? 'YouTube' : 'Vimeo'}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} relative`}>
      {showTitle && videoInfo.title && (
        <h3 className="text-sm font-medium text-gray-900 mb-2">{videoInfo.title}</h3>
      )}
      <div 
        className="relative rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
        style={{ width, height }}
        onClick={handlePlayClick}
      >
        {videoInfo.thumbnailUrl && (
          <img
            src={videoInfo.thumbnailUrl}
            alt={videoInfo.title || 'Video thumbnail'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback for broken thumbnails
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3 group-hover:bg-white transition-colors shadow-lg">
            <Play className="h-6 w-6 text-gray-800 ml-0.5" fill="currentColor" />
          </div>
        </div>
        
        {/* Video type badge */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {videoInfo.type === 'youtube' ? 'YouTube' : 'Vimeo'}
        </div>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={handlePlayClick}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Play video
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
        >
          <span>Open in {videoInfo.type === 'youtube' ? 'YouTube' : 'Vimeo'}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}