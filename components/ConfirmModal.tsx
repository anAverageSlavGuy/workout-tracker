import { useCallback, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../constants/colors'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (confirmed: boolean) => void
}

export function useConfirmModal() {
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      setPendingConfirm({ ...options, resolve })
    })
  }, [])

  const close = useCallback((confirmed: boolean) => {
    setPendingConfirm(current => {
      current?.resolve(confirmed)
      return null
    })
  }, [])

  const confirmModal = (
    <ConfirmModal
      visible={!!pendingConfirm}
      title={pendingConfirm?.title ?? ''}
      message={pendingConfirm?.message ?? ''}
      confirmLabel={pendingConfirm?.confirmLabel}
      cancelLabel={pendingConfirm?.cancelLabel}
      danger={pendingConfirm?.danger}
      onCancel={() => close(false)}
      onConfirm={() => close(true)}
    />
  )

  return { confirm, confirmModal }
}

interface ConfirmModalProps extends ConfirmOptions {
  visible: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'CONFERMA',
  cancelLabel = 'ANNULLA',
  danger = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.dialog}>
          <View style={styles.accent} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, danger && styles.confirmBtnDanger]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, danger && styles.confirmTextDanger]}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 14,
    borderRadius: 26,
    shadowColor: '#171614',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  accent: { width: 34, height: 5, borderRadius: 3, backgroundColor: colors.accent },
  title: { color: colors.text, fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  message: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnDanger: { backgroundColor: '#d96a66' },
  cancelText: { color: colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  confirmText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  confirmTextDanger: { color: colors.bg },
})
