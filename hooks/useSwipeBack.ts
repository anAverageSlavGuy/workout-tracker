import { useRef, useCallback } from 'react'
import { PanResponder, Platform } from 'react-native'

interface UseSwipeBackOptions {
  onSwipe: () => void
  threshold?: number
}

export function useSwipeBack({ onSwipe, threshold = 80 }: UseSwipeBackOptions) {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dx }) => Math.abs(dx) > 10,
      onPanResponderRelease: (_, { dx, vx }) => {
        // Swipe right to go back (only on native, not web)
        if (Platform.OS !== 'web' && dx > threshold && vx > 0) {
          onSwipe()
        }
      },
    })
  ).current

  return panResponder
}
