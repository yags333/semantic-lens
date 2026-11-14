import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image } from 'react-native';
import { SimilarityMatch } from '../types/vector';
import { MediaItem } from '../types/media';

interface ImageGridProps {
  items: SimilarityMatch[] | MediaItem[];
  isSearchResult?: boolean;
  onSelectItem: (item: MediaItem) => void;
  numColumns?: number;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ImageGrid: React.FC<ImageGridProps> = ({
  items,
  isSearchResult = false,
  onSelectItem,
  numColumns = 2,
  ListHeaderComponent,
  ListEmptyComponent
}) => {
  const cardWidth = (SCREEN_WIDTH - 32 - (numColumns - 1) * 12) / numColumns;

  const renderItem = ({ item }: { item: any }) => {
    const media: MediaItem = isSearchResult ? (item as SimilarityMatch).item : (item as MediaItem);
    const score = isSearchResult ? (item as SimilarityMatch).percentageMatch : null;

    // Color gradient indicator for match percentage
    let badgeColor = '#10b981'; // Green for > 70%
    if (score !== null && score < 50) badgeColor = '#f59e0b'; // Amber for 40-69%
    if (score !== null && score < 30) badgeColor = '#64748b'; // Gray for low

    const dateStr = new Date(media.captureDate).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });

    return (
      <TouchableOpacity
        style={[styles.card, { width: cardWidth }]}
        onPress={() => onSelectItem(media)}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnailContainer}>
          {media.thumbnailUri ? (
            <Image
              source={{ uri: media.thumbnailUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.fallbackThumbnail]}>
              <Text style={styles.fallbackIcon}>🖼️</Text>
            </View>
          )}

          {/* Extension Badge */}
          <View style={styles.extBadge}>
            <Text style={styles.extText}>{media.fileExtension.toUpperCase()}</Text>
          </View>

          {/* Semantic Score Badge */}
          {score !== null && (
            <View style={[styles.scoreBadge, { backgroundColor: badgeColor }]}>
              <Text style={styles.scoreText}>{score}% Match</Text>
            </View>
          )}
        </View>

        <View style={styles.metaContainer}>
          <Text style={styles.fileName} numberOfLines={1}>
            {media.fileName}
          </Text>
          <View style={styles.subMetaRow}>
            <Text style={styles.metaSubText}>{dateStr}</Text>
            <Text style={styles.metaSubText}>{(media.fileSize / (1024 * 1024)).toFixed(1)} MB</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => (isSearchResult ? (item as SimilarityMatch).item.id : (item as MediaItem).id)}
      numColumns={numColumns}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.columnWrapper}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    backgroundColor: '#0f172a'
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155'
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 1.25,
    backgroundColor: '#0f172a',
    position: 'relative'
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  fallbackThumbnail: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b'
  },
  fallbackIcon: {
    fontSize: 32
  },
  extBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  extText: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '700'
  },
  scoreBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  metaContainer: {
    padding: 10
  },
  fileName: {
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4
  },
  subMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metaSubText: {
    color: '#94a3b8',
    fontSize: 11
  }
});
