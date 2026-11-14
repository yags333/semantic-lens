import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SimilarityMatch } from '../types/vector';
import { MediaItem } from '../types/media';

interface SimilarPhotosListProps {
  similarMatches: SimilarityMatch[];
  onSelectPhoto: (photo: MediaItem) => void;
}

export const SimilarPhotosList: React.FC<SimilarPhotosListProps> = ({
  similarMatches,
  onSelectPhoto
}) => {
  if (similarMatches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No visually similar photos found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {similarMatches.map(match => (
        <TouchableOpacity
          key={match.item.id}
          style={styles.card}
          onPress={() => onSelectPhoto(match.item)}
          activeOpacity={0.8}
        >
          <View style={styles.imageContainer}>
            {match.item.thumbnailUri ? (
              <Image
                source={{ uri: match.item.thumbnailUri }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.fallback}>
                <Text style={styles.fallbackIcon}>🖼️</Text>
              </View>
            )}
            <View style={styles.similarityBadge}>
              <Text style={styles.similarityText}>{match.percentageMatch}%</Text>
            </View>
          </View>
          <Text style={styles.photoName} numberOfLines={1}>
            {match.item.fileName}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 12
  },
  card: {
    width: 120,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155'
  },
  imageContainer: {
    width: '100%',
    height: 90,
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  fallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fallbackIcon: {
    fontSize: 20
  },
  similarityBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10
  },
  similarityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700'
  },
  photoName: {
    color: '#cbd5e1',
    fontSize: 11,
    padding: 6,
    fontWeight: '500'
  },
  emptyContainer: {
    paddingVertical: 14
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    fontStyle: 'italic'
  }
});
