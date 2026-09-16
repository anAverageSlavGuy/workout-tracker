import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../constants/colors'

export type ToastTone = 'success' | 'error' | 'warning' | 'info'

export type ToastState = {
  message: string
  tone: ToastTone
}

export function useToast(defaultDuration = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    if (!toast) return
    const timeout = setTimeout(() => setToast(null), defaultDuration)
    return () => clearTimeout(timeout)
  }, [toast, defaultDuration])

  function showToast(message: string, tone: ToastTone = 'info') {
    setToast({ message, tone })
  }

  function hideToast() {
    setToast(null)
  }

  return { toast, showToast, hideToast }
}

export function ToastHost({ toast, bottom = 40 }: { toast: ToastState | null; bottom?: number }) {
  if (!toast) return null

  const toneStyle = toast.tone === 'success'
    ? styles.toastSuccess
    : toast.tone === 'error'
      ? styles.toastError
      : toast.tone === 'warning'
        ? styles.toastWarning
        : styles.toastInfo

  return (
    <View style={[styles.toast, toneStyle, { bottom }]}>
      <Text style={styles.toastText}>{toast.message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toastSuccess: { backgroundColor: '#12301f', borderColor: '#2f8f5b' },
  toastError: { backgroundColor: '#35121a', borderColor: colors.danger },
  toastWarning: { backgroundColor: '#362607', borderColor: colors.warning },
  toastInfo: { backgroundColor: colors.surfaceHigh, borderColor: colors.border },
  toastText: { color: colors.surface, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },
})
