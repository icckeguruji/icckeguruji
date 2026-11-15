// IDEAL COACHING CENTRE — INTERACTIVE DATE & TIME PICKER MODAL
// Touch-based date and time selection (No manual text typing required)

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar, Clock, X, Check, ChevronRight } from 'lucide-react-native';

interface DateTimePickerModalProps {
  visible: boolean;
  mode?: 'date' | 'datetime';
  initialDate?: Date;
  title?: string;
  onClose: () => void;
  onSelect: (selectedDate: Date, formattedString: string) => void;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const YEARS = [2026, 2027, 2028];

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = ['00', '15', '30', '45'];

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  mode = 'date',
  initialDate = new Date(),
  title = 'Select Date',
  onClose,
  onSelect,
}) => {
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear() || 2026);
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth() || 0);
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate() || 1);

  // Time state
  const [selectedHour, setSelectedHour] = useState(6);
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  // Days in selected month calculation
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleConfirm = () => {
    let hour24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour < 12) hour24 += 12;
    if (selectedPeriod === 'AM' && selectedHour === 12) hour24 = 0;

    const finalDate = new Date(
      selectedYear,
      selectedMonth,
      selectedDay,
      mode === 'datetime' ? hour24 : 0,
      mode === 'datetime' ? parseInt(selectedMinute) : 0
    );

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const dateFormatted = `${selectedYear}-${pad(selectedMonth + 1)}-${pad(selectedDay)}`;

    let formattedString = dateFormatted;
    if (mode === 'datetime') {
      formattedString = `${dateFormatted} at ${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    }

    onSelect(finalDate, formattedString);
    onClose();
  };

  const handlePreset = (type: 'today' | 'tomorrow' | 'next_week') => {
    const d = new Date();
    if (type === 'tomorrow') d.setDate(d.getDate() + 1);
    if (type === 'next_week') d.setDate(d.getDate() + 7);

    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth());
    setSelectedDay(d.getDate());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {mode === 'datetime' ? (
                <Clock size={20} color="#2563EB" />
              ) : (
                <Calendar size={20} color="#2563EB" />
              )}
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {/* Quick Presets */}
            <View style={styles.presetsRow}>
              <TouchableOpacity style={styles.presetBtn} onPress={() => handlePreset('today')}>
                <Text style={styles.presetBtnText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetBtn} onPress={() => handlePreset('tomorrow')}>
                <Text style={styles.presetBtnText}>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetBtn} onPress={() => handlePreset('next_week')}>
                <Text style={styles.presetBtnText}>Next Week</Text>
              </TouchableOpacity>
            </View>

            {/* Year Selector */}
            <Text style={styles.sectionLabel}>Year</Text>
            <View style={styles.chipRow}>
              {YEARS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.chip, selectedYear === y && styles.chipActive]}
                  onPress={() => setSelectedYear(y)}
                >
                  <Text style={[styles.chipText, selectedYear === y && styles.chipTextActive]}>
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Month Selector */}
            <Text style={styles.sectionLabel}>Month</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
              {MONTHS.map((m, idx) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.monthChip, selectedMonth === idx && styles.monthChipActive]}
                  onPress={() => setSelectedMonth(idx)}
                >
                  <Text
                    style={[
                      styles.monthChipText,
                      selectedMonth === idx && styles.monthChipTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Day Selector */}
            <Text style={styles.sectionLabel}>
              Day of Month ({MONTHS[selectedMonth]} {selectedYear})
            </Text>
            <View style={styles.daysGrid}>
              {daysArray.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayCell, selectedDay === d && styles.dayCellActive]}
                  onPress={() => setSelectedDay(d)}
                >
                  <Text style={[styles.dayText, selectedDay === d && styles.dayTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time Selector (If mode is 'datetime') */}
            {mode === 'datetime' && (
              <View style={styles.timeSection}>
                <Text style={styles.sectionLabel}>Time of Stream</Text>

                <View style={styles.timeRow}>
                  {/* Hours */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subLabel}>Hour</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {HOURS.map((h) => (
                          <TouchableOpacity
                            key={h}
                            style={[styles.timeChip, selectedHour === h && styles.timeChipActive]}
                            onPress={() => setSelectedHour(h)}
                          >
                            <Text
                              style={[
                                styles.timeChipText,
                                selectedHour === h && styles.timeChipTextActive,
                              ]}
                            >
                              {h}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Minutes */}
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.subLabel}>Minute</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {MINUTES.map((min) => (
                        <TouchableOpacity
                          key={min}
                          style={[
                            styles.timeChip,
                            selectedMinute === min && styles.timeChipActive,
                          ]}
                          onPress={() => setSelectedMinute(min)}
                        >
                          <Text
                            style={[
                              styles.timeChipText,
                              selectedMinute === min && styles.timeChipTextActive,
                            ]}
                          >
                            :{min}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* AM / PM */}
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.subLabel}>Period</Text>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {(['AM', 'PM'] as const).map((p) => (
                        <TouchableOpacity
                          key={p}
                          style={[
                            styles.periodBtn,
                            selectedPeriod === p && styles.periodBtnActive,
                          ]}
                          onPress={() => setSelectedPeriod(p)}
                        >
                          <Text
                            style={[
                              styles.periodBtnText,
                              selectedPeriod === p && styles.periodBtnTextActive,
                            ]}
                          >
                            {p}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Selected Summary Pill */}
            <View style={styles.summaryPill}>
              <Text style={styles.summaryLabel}>Selected:</Text>
              <Text style={styles.summaryValue}>
                {selectedDay} {MONTHS[selectedMonth]} {selectedYear}
                {mode === 'datetime' ? ` at ${selectedHour}:${selectedMinute} ${selectedPeriod}` : ''}
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Set Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  body: {
    padding: 16,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  scrollRow: {
    marginBottom: 8,
  },
  monthChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  monthChipActive: {
    backgroundColor: '#2563EB',
  },
  monthChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  monthChipTextActive: {
    color: '#FFFFFF',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  timeSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  timeChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  timeChipActive: {
    backgroundColor: '#2563EB',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  timeChipTextActive: {
    color: '#FFFFFF',
  },
  periodBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  periodBtnActive: {
    backgroundColor: '#059669',
  },
  periodBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  periodBtnTextActive: {
    color: '#FFFFFF',
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
