import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { ImageGrid } from '../components/ImageGrid';
import { FilterModal } from '../components/FilterModal';
import { sqliteDb } from '../db/database';
import { MediaItem } from '../types/media';
import { FilterOptions } from '../types/search';

interface GalleryScreenProps {
  navigation: any;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({ navigation }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    extensions: [],
    minSimilarity: 0.20,
    sortBy: 'date_desc'
  });

  const loadMedia = async () => {
    const items = await sqliteDb.getAllMediaItems();
    setMediaItems(items);
    applyFilterList(items, filters);
  };

  useEffect(() => {
    loadMedia();
    const unsubscribe = navigation.addListener('focus', loadMedia);
    return unsubscribe;
  }, [navigation]);

  const applyFilterList = (items: MediaItem[], filterOpts: FilterOptions) => {
    let result = [...items];

    // Extensions
    if (filterOpts.extensions.length > 0) {
      result = result.filter(item =>
        filterOpts.extensions.some(ext => ext.toLowerCase() === item.fileExtension.toLowerCase())
      );
    }

    // Date
    if (filterOpts.startDate) {
      result = result.filter(item => item.captureDate >= filterOpts.startDate!);
    }

    // Sort
    if (filterOpts.sortBy === 'date_desc') {
      result.sort((a, b) => b.captureDate - a.captureDate);
    } else if (filterOpts.sortBy === 'date_asc') {
      result.sort((a, b) => a.captureDate - b.captureDate);
    } else if (filterOpts.sortBy === 'size_desc') {
      result.sort((a, b) => b.fileSize - a.fileSize);
    }

    setFilteredItems(result);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    applyFilterList(mediaItems, newFilters);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Local Gallery</Text>
          <Text style={styles.subtitle}>{filteredItems.length} photos indexed locally</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setIsFilterVisible(true)}>
          <Text style={styles.filterBtnText}>⚙️ Filter</Text>
        </TouchableOpacity>
      </View>

      <ImageGrid
        items={filteredItems}
        isSearchResult={false}
        onSelectItem={(item: MediaItem) => navigation.navigate('ImageDetail', { mediaId: item.id })}
      />

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        currentFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc'
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  filterBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  filterBtnText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600'
  }
});
