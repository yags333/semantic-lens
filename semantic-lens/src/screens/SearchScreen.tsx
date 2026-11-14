import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SearchBar } from '../components/SearchBar';
import { ImageGrid } from '../components/ImageGrid';
import { FilterModal } from '../components/FilterModal';
import { aiEngine } from '../ai/aiEngine';
import { vectorStore } from '../db/vectorStore';
import { sqliteDb } from '../db/database';
import { generateSeedMediaItems } from '../data/seedMedia';
import { SimilarityMatch, VectorSearchResult } from '../types/vector';
import { FilterOptions } from '../types/search';
import { MediaItem } from '../types/media';

interface SearchScreenProps {
  navigation: any;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SimilarityMatch[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [searchStats, setSearchStats] = useState<{ count: number; timeMs: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    extensions: [],
    minSimilarity: 0.20,
    sortBy: 'relevance'
  });

  // Initialize seed media on first load if DB is empty
  useEffect(() => {
    async function setupDatabase() {
      await sqliteDb.initialize();
      const count = await sqliteDb.count();
      if (count === 0) {
        const seedItems = generateSeedMediaItems();
        await sqliteDb.insertBatch(seedItems);
      }
      const media = await sqliteDb.getAllMediaItems();
      setAllMedia(media);
    }
    setupDatabase();
  }, []);

  // Execute Semantic Search
  const performSearch = useCallback(async (searchQuery: string, currentFilters: FilterOptions) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearchStats(null);
      return;
    }

    setIsSearching(true);
    const startTime = performance.now();

    try {
      // 1. Text Encoder generates 512-dim embedding from natural language query
      const queryVector = await aiEngine.encodeText(searchQuery);

      // 2. Vector Store computes cosine similarity against all indexed photos
      const searchResult: VectorSearchResult = await vectorStore.searchByVector(
        queryVector,
        currentFilters
      );

      setResults(searchResult.matches);
      setSearchStats({
        count: searchResult.matches.length,
        timeMs: Math.round(performance.now() - startTime)
      });
    } catch (err) {
      console.error('[SearchScreen] Search execution failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    performSearch(text, filters);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion, filters);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearchStats(null);
  };

  const handleFilterApply = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    if (query) {
      performSearch(query, newFilters);
    }
  };

  const activeFilterCount =
    filters.extensions.length + (filters.startDate ? 1 : 0) + (filters.sortBy !== 'relevance' ? 1 : 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>SemanticLens</Text>
          <Text style={styles.appSubtitle}>On-Device AI Semantic Search • 100% Offline</Text>
        </View>
        <TouchableOpacity
          style={[styles.filterButton, activeFilterCount > 0 && styles.activeFilterBtn]}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Text style={styles.filterBtnText}>⚙️ Filter</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <SearchBar
        value={query}
        onChangeText={handleQueryChange}
        onClear={handleClear}
        onSelectSuggestion={handleSuggestionSelect}
        placeholder="Type e.g. 'warrior with sword' or 'dog on grass'..."
        isLoading={isSearching}
      />

      {/* Search Latency & Result Stats */}
      {searchStats && (
        <View style={styles.statsBanner}>
          <Text style={styles.statsText}>
            Found <Text style={styles.highlight}>{searchStats.count}</Text> photos in{' '}
            <Text style={styles.highlight}>{searchStats.timeMs}ms</Text>
          </Text>
          <View style={styles.privacyTag}>
            <Text style={styles.privacyTagText}>🔒 Local Vector Index</Text>
          </View>
        </View>
      )}

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#38bdf8" />
          <Text style={styles.loadingText}>Running on-device embedding inference...</Text>
        </View>
      )}

      {/* Results or Gallery Grid */}
      <ImageGrid
        items={query.trim() ? results : allMedia}
        isSearchResult={!!query.trim()}
        onSelectItem={(item: MediaItem) => navigation.navigate('ImageDetail', { mediaId: item.id })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>
              {query.trim() ? 'No Matching Photos Found' : 'No Media Indexed Yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {query.trim()
                ? 'Try broadening your description or lowering the minimum match sensitivity in filters.'
                : 'Tap Indexing Status to scan your device photo library.'}
            </Text>
          </View>
        }
      />

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        currentFilters={filters}
        onApplyFilters={handleFilterApply}
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
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#0f172a'
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5
  },
  appSubtitle: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '600',
    marginTop: 2
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  activeFilterBtn: {
    borderColor: '#38bdf8',
    backgroundColor: '#0369a1'
  },
  filterBtnText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600'
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: '#38bdf8',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1
  },
  filterBadgeText: {
    color: '#0f172a',
    fontSize: 10,
    fontWeight: '800'
  },
  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  statsText: {
    color: '#94a3b8',
    fontSize: 12
  },
  highlight: {
    color: '#38bdf8',
    fontWeight: '700'
  },
  privacyTag: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  privacyTagText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700'
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center'
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  }
});
