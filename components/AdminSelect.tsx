import { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../constants/colors'

interface Option {
  label: string
  value: string | undefined
}

interface AdminSelectProps {
  label?: string
  options: Option[]
  value: string | undefined
  onChange: (value: string | undefined) => void
  placeholder?: string
}

export function AdminSelect({ label, options, value, onChange, placeholder = '— Seleziona —' }: AdminSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder

  return (
    <>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.trigger} onPress={() => setIsOpen(true)}>
        <Text style={[styles.triggerText, !value && styles.triggerTextPlaceholder]}>
          {selectedLabel}
        </Text>
        <Text style={styles.triggerIcon}>▼</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleziona</Text>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          <FlatList
            data={options}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, item.value === value && styles.optionActive]}
                onPress={() => {
                  onChange(item.value)
                  setIsOpen(false)
                }}
              >
                <View style={styles.optionDot} />
                <Text style={[styles.optionText, item.value === value && styles.optionTextActive]}>
                  {item.label}
                </Text>
                {item.value === value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.list}
          />
        </SafeAreaView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 9, color: colors.textMuted, letterSpacing: 2, marginTop: 12, marginBottom: 8, fontWeight: '700' },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    minHeight: 40,
  },
  triggerText: { fontSize: 14, color: colors.text, flex: 1 },
  triggerTextPlaceholder: { color: colors.textDim },
  triggerIcon: { color: colors.textMuted, fontSize: 10, marginLeft: 8 },
  modal: { flex: 1, backgroundColor: colors.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 13, fontWeight: '900', color: colors.text, letterSpacing: 3 },
  closeBtn: { fontSize: 16, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border },
  list: { paddingVertical: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionActive: { backgroundColor: colors.accentDim },
  optionDot: { width: 3, height: 3, backgroundColor: colors.accent, borderRadius: 1.5 },
  optionText: { fontSize: 13, color: colors.text, flex: 1 },
  optionTextActive: { fontWeight: '600' },
  checkmark: { color: colors.accent, fontSize: 14, fontWeight: '700' },
})
