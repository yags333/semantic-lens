import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FilterOptions, SortOrder } from '../types/search';
import { SupportedExtension } from '../types/media';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

const ALL_EXTENSIONS: SupportedExtension[] = ['jpg', 'png', 'heic', 'webp'];

const DATE_PRESETS: { label: string; days?: number }[] = [
  { label: 'All Time' },
  { label: 'Past 7 Days', days: 7 },
  { label: 'Past 30 Days', days: 30 },
  { label: 'Past 90 Days', days: 90 }
];

const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Newest First', value: 'date_desc' },
  { label: 'Oldest First', value: 'date_asc' },
  { label: 'File Size', value: 'size_desc' }
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  currentFilters,
  onApplyFilters
}) => {
  const [selectedExts, setSelectedExts] = useState<SupportedExtension[]>(currentFilters.extensions);
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('All Time');
  const [selectedSort, setSelectedSort] = useState<SortOrder>(currentFilters.sortBy);
  const [minSimilarity, setMinSimilarity] = useState<number>(currentFilters.minSimilarity);

  const toggleExtension = (ext: SupportedExtension) => {
    if (selectedExts.includes(ext)) {
      setSelectedExts(selectedExts.filter(e => e !== ext));
    } else {
      setSelectedExts([...selectedExts, ext]);
    }
  };

  const handleApply = () => {
    let startDate: number | undefined = undefined;
    const preset = DATE_PRESETS.find(p => p.label === selectedDatePreset);
    if (preset && preset.days) {
      startDate = Date.now() - preset.days * 24 * 60 * 60 * 1000;
    }

    onApplyFilters({
      extensions: selectedExts,
      startDate,
      minSimilarity,
      sortBy: selectedSort
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedExts([]);
    setSelectedDatePreset('All Time');
    setSelectedSort('relevance');
    setMinSimilarity(0.20);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter & Sort Media</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* File Extensions */}
            <Text style={styles.sectionTitle}>File Extensions</Text>
            <View style={styles.pillContainer}>
              {ALL_EXTENSIONS.map(ext => {
                const isActive = selectedExts.includes(ext);
                return (
                  <TouchableOpacity
                    key={ext}
                    style={[styles.pill, isActive && styles.activePill]}
                    onPress={() => toggleExtension(ext)}
                  >
                    <Text style={[styles.pillText, isActive && styles.activePillText]}>
                      .{ext.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date Range Presets */}
            <Text style={styles.sectionTitle}>Capture Date</Text>
            <View style={styles.pillContainer}>
              {DATE_PRESETS.map(preset => {
                const isActive = selectedDatePreset === preset.label;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[styles.pill, isActive && styles.activePill]}
                    onPress={() => setSelectedDatePreset(preset.label)}
                  >
                    <Text style={[styles.pillText, isActive && styles.activePillText]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sort Options */}
            <Text style={styles.sectionTitle}>Sort Results</Text>
            <View style={styles.pillContainer}>
              {SORT_OPTIONS.map(opt => {
                const isActive = selectedSort === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.pill, isActive && styles.activePill]}
                    onPress={() => setSelectedSort(opt.value)}
                  >
                    <Text style={[styles.pillText, isActive && styles.activePillText]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Threshold Filter */}
            <Text style={styles.sectionTitle}>
              Minimum Match Sensitivity: {Math.round(minSimilarity * 100)}%
            </Text>
            <View style={styles.sliderRow}>
              {[0.10, 0.20, 0.35, 0.50].map(val => (
                <TouchableOpacity
                  key={val}
                  style={[styles.thresholdBtn, minSimilarity === val && styles.activeThreshold]}
                  onPress={() => setMinSimilarity(val)}
                >
                  <Text style={[styles.thresholdText, minSimilarity === val && styles.activeThresholdText]}>
                    {Math.round(val * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyText}>Apply Filters</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700'
  },
  closeBtn: {
    padding: 6
  },
  closeText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: 'bold'
  },
  body: {
    marginBottom: 16
  },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 8
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  pill: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  activePill: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8'
  },
  pillText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500'
  },
  activePillText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6
  },
  thresholdBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  activeThreshold: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8'
  },
  thresholdText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  activeThresholdText: {
    color: '#ffffff'
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  resetText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600'
  },
  applyBtn: {
    flex: 2,
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  applyText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  }
});
