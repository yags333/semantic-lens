import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ProgressBarAndroid, Platform } from 'react-native';
import { permissionService, PermissionStatus } from '../services/permissionService';
import { mediaScanner } from '../services/mediaScannerService';
import { indexingQueue } from '../services/indexingQueue';
import { sqliteDb } from '../db/database';
import { vectorStore } from '../db/vectorStore';
import { generateSeedMediaItems } from '../data/seedMedia';
import { IndexingStatus } from '../types/search';
import { VectorStoreStats } from '../types/vector';

export const IndexingStatusScreen: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [indexingStatus, setIndexingStatus] = useState<IndexingStatus>(indexingQueue.getStatus());
  const [vectorStats, setVectorStats] = useState<VectorStoreStats | null>(null);

  useEffect(() => {
    async function checkState() {
      const perm = await permissionService.checkPermission();
      setPermissionStatus(perm.status);
      const stats = await vectorStore.getStats();
      setVectorStats(stats);
    }
    checkState();

    const unsubscribe = indexingQueue.subscribe(status => {
      setIndexingStatus(status);
      vectorStore.getStats().then(setVectorStats);
    });

    return unsubscribe;
  }, []);

  const handleRequestPermission = async () => {
    const res = await permissionService.requestPermission();
    setPermissionStatus(res.status);
  };

  const handleScanDevice = async () => {
    const unindexed = await mediaScanner.scanForUnindexedMedia(100);
    if (unindexed.length > 0) {
      indexingQueue.enqueueAndProcess(unindexed, 10, 80);
    } else {
      alert('All local photos are already up to date and indexed!');
    }
  };

  const handleSeedMockData = async () => {
    const seed = generateSeedMediaItems();
    await sqliteDb.insertBatch(seed);
    const stats = await vectorStore.getStats();
    setVectorStats(stats);
    alert(`Successfully loaded ${seed.length} high-fidelity test photos into local vector store.`);
  };

  const handleClearDb = async () => {
    await sqliteDb.clearAll();
    const stats = await vectorStore.getStats();
    setVectorStats(stats);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Indexing & Storage Engine</Text>
        <Text style={styles.subtitle}>Privacy-First On-Device Vector Pipeline</Text>
      </View>

      <View style={styles.container}>
        {/* Permission Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Device Photo Permissions</Text>
            <View style={[styles.statusBadge, permissionStatus === 'granted' ? styles.badgeGreen : styles.badgeAmber]}>
              <Text style={styles.badgeText}>{permissionStatus.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Android 13+ READ_MEDIA_IMAGES / iOS PHPhotoLibrary. All processing occurs locally with zero network calls.
          </Text>
          {permissionStatus !== 'granted' && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleRequestPermission}>
              <Text style={styles.btnText}>Grant Photo Storage Permission</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Indexing Queue Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Background Vectorizer</Text>
            <View style={[styles.statusBadge, indexingStatus.isIndexing ? styles.badgeBlue : styles.badgeGray]}>
              <Text style={styles.badgeText}>
                {indexingStatus.isIndexing ? 'INDEXING...' : 'IDLE'}
              </Text>
            </View>
          </View>

          {/* Custom Visual Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${indexingStatus.progressPercentage}%` }]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressSubText}>
              {indexingStatus.indexedCount} of {indexingStatus.totalDiscovered} photos processed
            </Text>
            <Text style={styles.progressSubText}>{indexingStatus.progressPercentage}%</Text>
          </View>

          {indexingStatus.currentProcessingFile && (
            <Text style={styles.currentFileText} numberOfLines={1}>
              ⚡ Extracting: {indexingStatus.currentProcessingFile}
            </Text>
          )}

          {/* Battery & Health Stats */}
          <View style={styles.batteryRow}>
            <Text style={styles.batteryText}>
              🔋 Battery Level: {Math.round(indexingStatus.batteryLevel * 100)}%
            </Text>
            <Text style={styles.batteryText}>
              🌡️ Thermal Throttling: Safe (80ms batch delay)
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.scanBtn]}
              onPress={handleScanDevice}
              disabled={indexingStatus.isIndexing}
            >
              <Text style={styles.btnText}>Scan Device Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.seedBtn]}
              onPress={handleSeedMockData}
            >
              <Text style={styles.btnText}>Re-seed Test Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vector DB Stats Card */}
        {vectorStats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Local SQLite Vector Store Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>INDEXED PHOTOS</Text>
                <Text style={styles.statVal}>{vectorStats.totalVectors}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>EMBEDDING DIM</Text>
                <Text style={styles.statVal}>{vectorStats.dimension}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>INDEX SIZE</Text>
                <Text style={styles.statVal}>{(vectorStats.dbSizeBytes / 1024).toFixed(1)} KB</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.clearBtn} onPress={handleClearDb}>
              <Text style={styles.clearBtnText}>Clear Local Vector Store</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
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
    color: '#38bdf8',
    marginTop: 2
  },
  container: {
    padding: 16,
    gap: 16
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700'
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  badgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)'
  },
  badgeAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)'
  },
  badgeBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)'
  },
  badgeGray: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)'
  },
  badgeText: {
    color: '#f8fafc',
    fontSize: 10,
    fontWeight: '700'
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 6
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 4
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  progressSubText: {
    color: '#94a3b8',
    fontSize: 11
  },
  currentFileText: {
    color: '#38bdf8',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 10
  },
  batteryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14
  },
  batteryText: {
    color: '#94a3b8',
    fontSize: 11
  },
  primaryBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  scanBtn: {
    backgroundColor: '#0284c7'
  },
  seedBtn: {
    backgroundColor: '#334155'
  },
  btnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center'
  },
  statLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 4
  },
  statVal: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '800'
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: 6
  },
  clearBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600'
  }
});
