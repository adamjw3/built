"use client"

import { useState, useEffect } from 'react'

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'unknown'
  id: string
  embedUrl: string
  thumbnailUrl: string
  title?: string
  duration?: string
  isValid: boolean
  error?: string
}

export function useVideo(url: string) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

  const validateVideoUrl = (url: string): boolean => {
    const { type, id } = parseVideoUrl(url)
    return type !== 'unknown' && id !== ''
  }

  useEffect(() => {
    if (!url.trim()) {
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
        isValid: false,
        error: 'Invalid video URL. Please use a valid YouTube or Vimeo URL.'
      })
      return
    }

    setIsLoading(true)

    const fetchVideoInfo = async () => {
      try {
        if (type === 'youtube') {
          const embedUrl = `https://www.youtube.com/embed/${id}`
          const thumbnailUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`
          
          // For now, skip API calls to avoid CORS issues
          setVideoInfo({
            type: 'youtube',
            id,
            embedUrl,
            thumbnailUrl,
            isValid: true
          })
        } else if (type === 'vimeo') {
          const embedUrl = `https://player.vimeo.com/video/${id}`
          
          // For now, skip API calls to avoid CORS issues
          setVideoInfo({
            type: 'vimeo',
            id,
            embedUrl,
            thumbnailUrl: `https://vumbnail.com/${id}.jpg`,
            isValid: true
          })
        }
      } catch (error) {
        setVideoInfo({
          type,
          id,
          embedUrl: '',
          thumbnailUrl: '',
          isValid: false,
          error: 'Failed to load video information'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideoInfo()
  }, [url])

  return {
    videoInfo,
    isLoading,
    isValidUrl: validateVideoUrl(url),
    parseVideoUrl
  }
}