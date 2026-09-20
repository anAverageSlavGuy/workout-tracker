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
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 14,
  },
  accent: { width: 40, height: 2, backgroundColor: colors.accent },
  title: { color: colors.text, fontSize: 16, fontWeight: '900', letterSpacing: 4 },
  message: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnDanger: { borderColor: colors.danger, backgroundColor: colors.danger },
  cancelText: { color: colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  confirmText: { color: colors.text, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  confirmTextDanger: { color: colors.text },
})
