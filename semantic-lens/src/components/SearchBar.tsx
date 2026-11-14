import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onSelectSuggestion: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const SAMPLE_QUERIES = [
  'a warrior with a sword',
  'dog running on grass',
  'sunset over mountains',
  'birthday cake with candles',
  'red sports car',
  'coffee mug and book',
  'cyberpunk neon city',
  'sleeping cat in sunlight',
  'snowy alpine peaks',
  'cozy winter cabin'
];

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  onSelectSuggestion,
  placeholder = 'Describe what you are looking for...',
  isLoading = false
}) => {
  const [internalText, setInternalText] = useState(value);

  useEffect(() => {
    setInternalText(value);
  }, [value]);

  const handleChange = (text: string) => {
    setInternalText(text);
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* Search icon */}
        <Text style={styles.icon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={internalText}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {internalText.length > 0 && (
          <TouchableOpacity onPress={() => { setInternalText(''); onClear(); }} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestion Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {SAMPLE_QUERIES.map((query, index) => {
          const isSelected = value.toLowerCase() === query.toLowerCase();
          return (
            <TouchableOpacity
              key={index}
              style={[styles.chip, isSelected && styles.activeChip]}
              onPress={() => onSelectSuggestion(query)}
            >
              <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                {query}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#0f172a'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#334155'
  },
  icon: {
    fontSize: 18,
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#f8fafc',
    paddingVertical: 0
  },
  clearButton: {
    padding: 6
  },
  clearText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold'
  },
  chipsScroll: {
    paddingTop: 10,
    gap: 8,
    flexDirection: 'row'
  },
  chip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  activeChip: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8'
  },
  chipText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500'
  },
  activeChipText: {
    color: '#ffffff',
    fontWeight: '600'
  }
});
