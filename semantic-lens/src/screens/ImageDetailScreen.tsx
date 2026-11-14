import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MetadataBadge } from '../components/MetadataBadge';
import { SimilarPhotosList } from '../components/SimilarPhotosList';
import { sqliteDb } from '../db/database';
import { vectorStore } from '../db/vectorStore';
import { MediaItem } from '../types/media';
import { SimilarityMatch } from '../types/vector';

interface ImageDetailScreenProps {
  route: { params: { mediaId: string } };
  navigation: any;
}

export const ImageDetailScreen: React.FC<ImageDetailScreenProps> = ({ route, navigation }) => {
  const { mediaId } = route.params;
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [similarPhotos, setSimilarPhotos] = useState<SimilarityMatch[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  useEffect(() => {
    async function loadItem() {
      const item = await sqliteDb.getMediaItemById(mediaId);
      if (item) {
        setMedia(item);
        // Load visually similar photos
        setIsLoadingSimilar(true);
        const matches = await vectorStore.findVisuallySimilar(mediaId, 8, 0.30);
        setSimilarPhotos(matches);
        setIsLoadingSimilar(false);
      }
    }
    loadItem();
  }, [mediaId]);

  if (!media) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading photo details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const dateStr = new Date(media.captureDate).toLocaleString();
  const sizeMb = (media.fileSize / (1024 * 1024)).toFixed(2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{media.fileName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Main Photo Display */}
        <View style={styles.imageContainer}>
          {media.thumbnailUri ? (
            <Image
              source={{ uri: media.thumbnailUri }}
              style={styles.mainImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackIcon}>🖼️</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* File Name & Path */}
          <Text style={styles.fileName}>{media.fileName}</Text>
          <Text style={styles.filePath} numberOfLines={1}>📍 {media.filePath}</Text>

          {/* Tags */}
          {media.tags && media.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {media.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagBadge}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Technical & EXIF Metadata Section */}
          <Text style={styles.sectionHeading}>Metadata & EXIF Information</Text>
          <View style={styles.badgesGrid}>
            <MetadataBadge icon="📐" label="Resolution" value={`${media.width} × ${media.height}`} />
            <MetadataBadge icon="💾" label="File Size" value={`${sizeMb} MB`} />
            <MetadataBadge icon="🏷️" label="Format" value={media.fileExtension.toUpperCase()} />
            <MetadataBadge icon="📅" label="Capture Date" value={dateStr} />

            {media.exif && (
              <>
                <MetadataBadge icon="📷" label="Camera" value={`${media.exif.cameraMake} ${media.exif.cameraModel}`} />
                <MetadataBadge icon="🔆" label="Aperture" value={`f/${media.exif.fNumber}`} />
                <MetadataBadge icon="⏱️" label="Shutter" value={media.exif.exposureTime || 'N/A'} />
                <MetadataBadge icon="🎞️" label="ISO" value={media.exif.iso || 'N/A'} />
                <MetadataBadge icon="🔭" label="Focal Length" value={media.exif.focalLength || 'N/A'} />
              </>
            )}
          </View>

          {/* Vector Embedding Representation */}
          <Text style={styles.sectionHeading}>On-Device Vector Embedding</Text>
          <View style={styles.vectorCard}>
            <View style={styles.vectorHeader}>
              <Text style={styles.vectorTitle}>Float32 Latent Embedding</Text>
              <View style={styles.dimTag}>
                <Text style={styles.dimText}>512 Dimensions</Text>
              </View>
            </View>
            <Text style={styles.vectorSubtitle}>
              Normalized unit vector indexed in local SQLite BLOB store.
            </Text>
            <View style={styles.vectorPreviewBox}>
              <Text style={styles.vectorValues} numberOfLines={3}>
                [{media.embedding ? Array.from(media.embedding.slice(0, 16)).map(v => v.toFixed(4)).join(', ') : ''}, ... 496 more dimensions]
              </Text>
            </View>
          </View>

          {/* Visually Similar Photos Section */}
          <Text style={styles.sectionHeading}>Visually & Semantically Similar Photos</Text>
          <Text style={styles.similarSubtitle}>
            Matched via offline cosine distance against local vector database:
          </Text>
          <SimilarPhotosList
            similarMatches={similarPhotos}
            onSelectPhoto={(photo: MediaItem) => navigation.push('ImageDetail', { mediaId: photo.id })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: '#94a3b8'
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  backBtn: {
    padding: 6
  },
  backBtnText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '700'
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
    maxWidth: '70%'
  },
  scroll: {
    flex: 1
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainImage: {
    width: '100%',
    height: '100%'
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  fallbackIcon: {
    fontSize: 64
  },
  content: {
    padding: 16
  },
  fileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4
  },
  filePath: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16
  },
  tagBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  tagText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '500'
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
    marginTop: 18,
    marginBottom: 8
  },
  similarSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 10
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  vectorCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10
  },
  vectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  vectorTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700'
  },
  dimTag: {
    backgroundColor: '#0369a1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  dimText: {
    color: '#e0f2fe',
    fontSize: 11,
    fontWeight: '700'
  },
  vectorSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 10
  },
  vectorPreviewBox: {
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  vectorValues: {
    fontFamily: 'monospace',
    color: '#38bdf8',
    fontSize: 11,
    lineHeight: 16
  }
});
