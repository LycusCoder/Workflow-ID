import { useState, useEffect, useRef, useCallback } from 'react'
import * as faceapi from 'face-api.js'
import { FACE_DETECTION_CONFIG, TOAST_MESSAGES } from '@/constants/config'
import { useToast } from '@/components/ui/use-toast'
import type { FaceDetectionResult } from '@/types'

interface UseFaceDetectionReturn {
  modelsLoaded: boolean
  isScanning: boolean
  status: string
  faceDetected: boolean
  facePositioned: boolean
  countdown: number | null
  videoRef: React.RefObject<HTMLVideoElement>
  startScanning: () => Promise<void>
  stopScanning: () => void
  detectFace: () => Promise<FaceDetectionResult | null>
  matchFace: (descriptor: Float32Array, storedEmbeddings: Float32Array[]) => { matched: boolean; distance: number; index: number }
}

export function useFaceDetection(): UseFaceDetectionReturn {
  const { toast } = useToast()
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [status, setStatus] = useState('')
  const [faceDetected, setFaceDetected] = useState(false)
  const [facePositioned, setFacePositioned] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const isScanningRef = useRef(false)
  const streamRef = useRef<MediaStream | null>(null)

  // Load face-api models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus(TOAST_MESSAGES.FACE.MODEL_LOADING)
        
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(FACE_DETECTION_CONFIG.MODEL_PATH),
          faceapi.nets.faceLandmark68Net.loadFromUri(FACE_DETECTION_CONFIG.MODEL_PATH),
          faceapi.nets.faceRecognitionNet.loadFromUri(FACE_DETECTION_CONFIG.MODEL_PATH),
        ])
        
        setModelsLoaded(true)
        setStatus(TOAST_MESSAGES.FACE.MODEL_LOADED)
        console.log('✅ Face detection models loaded successfully')
      } catch (error) {
        console.error('❌ Failed to load face detection models:', error)
        setStatus(TOAST_MESSAGES.FACE.MODEL_ERROR)
        toast({
          variant: 'destructive',
          title: 'Model Loading Failed',
          description: TOAST_MESSAGES.FACE.MODEL_ERROR,
        })
      }
    }

    loadModels()
  }, [toast])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const stopScanning = useCallback(() => {
    isScanningRef.current = false
    setIsScanning(false)
    setFaceDetected(false)
    setFacePositioned(false)
    setCountdown(null)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startScanning = useCallback(async () => {
    if (!modelsLoaded) {
      toast({
        variant: 'destructive',
        title: 'Not Ready',
        description: TOAST_MESSAGES.FACE.MODEL_LOADING,
      })
      return
    }

    try {
      setIsScanning(true)
      isScanningRef.current = true
      setStatus('Starting camera...')

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      })
      
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setStatus('Camera ready')
      }
    } catch (error) {
      console.error('❌ Camera access error:', error)
      setStatus(TOAST_MESSAGES.FACE.CAMERA_ERROR)
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: TOAST_MESSAGES.FACE.CAMERA_ERROR,
      })
      stopScanning()
    }
  }, [modelsLoaded, toast, stopScanning])

  const detectFace = useCallback(async (): Promise<FaceDetectionResult | null> => {
    console.log('\n🔍 [DETECT FACE] Memulai deteksi wajah...')
    console.log('   Video Ref:', videoRef.current ? 'Available ✅' : 'Not Available ❌')
    console.log('   Is Scanning:', isScanningRef.current ? 'Yes ✅' : 'No ❌')
    
    if (!videoRef.current || !isScanningRef.current) {
      console.error('❌ [DETECT FACE] Video ref atau scanning tidak tersedia!')
      return null
    }

    try {
      console.log('   Calling face-api.detectSingleFace...')
      
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.SsdMobilenetv1Options({ 
            minConfidence: FACE_DETECTION_CONFIG.MIN_CONFIDENCE 
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptor()

      console.log('   Detection result:', detection ? 'Found ✅' : 'Not Found ❌')

      if (!detection) {
        console.warn('⚠️ [DETECT FACE] Tidak ada wajah terdeteksi')
        setFaceDetected(false)
        setFacePositioned(false)
        setStatus(TOAST_MESSAGES.FACE.NO_FACE)
        return null
      }

      const score = detection.detection.score
      console.log('   Detection score:', (score * 100).toFixed(2) + '%')
      console.log('   Min quality score required:', (FACE_DETECTION_CONFIG.MIN_QUALITY_SCORE * 100).toFixed(2) + '%')

      if (score < FACE_DETECTION_CONFIG.MIN_QUALITY_SCORE) {
        console.warn('⚠️ [DETECT FACE] Kualitas wajah terlalu rendah')
        console.warn('   Current:', (score * 100).toFixed(2) + '%')
        console.warn('   Required:', (FACE_DETECTION_CONFIG.MIN_QUALITY_SCORE * 100).toFixed(2) + '%')
        setFaceDetected(true)
        setFacePositioned(false)
        setStatus(TOAST_MESSAGES.FACE.LOW_QUALITY)
        return null
      }

      console.log('✅ [DETECT FACE] Wajah terdeteksi dengan kualitas baik!')
      console.log('   Descriptor length:', detection.descriptor.length)
      console.log('   Box:', {
        x: detection.detection.box.x.toFixed(2),
        y: detection.detection.box.y.toFixed(2),
        width: detection.detection.box.width.toFixed(2),
        height: detection.detection.box.height.toFixed(2),
      })
      
      setFaceDetected(true)
      setFacePositioned(true)

      return {
        descriptor: detection.descriptor,
        score,
        box: {
          x: detection.detection.box.x,
          y: detection.detection.box.y,
          width: detection.detection.box.width,
          height: detection.detection.box.height,
        },
      }
    } catch (error) {
      console.error('💥 [DETECT FACE] Exception:', error)
      return null
    }
  }, [])

  const matchFace = useCallback((
    descriptor: Float32Array,
    storedEmbeddings: Float32Array[]
  ): { matched: boolean; distance: number; index: number } => {
    let bestMatch = {
      matched: false,
      distance: 1.0,
      index: -1,
    }

    storedEmbeddings.forEach((embedding, index) => {
      const distance = faceapi.euclideanDistance(descriptor, embedding)
      
      if (distance < FACE_DETECTION_CONFIG.MATCH_THRESHOLD && distance < bestMatch.distance) {
        bestMatch = {
          matched: true,
          distance,
          index,
        }
      }
    })

    return bestMatch
  }, [])

  return {
    modelsLoaded,
    isScanning,
    status,
    faceDetected,
    facePositioned,
    countdown,
    videoRef,
    startScanning,
    stopScanning,
    detectFace,
    matchFace,
  }
}
