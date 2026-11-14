import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SearchScreen } from './screens/SearchScreen';
import { GalleryScreen } from './screens/GalleryScreen';
import { IndexingStatusScreen } from './screens/IndexingStatusScreen';
import { ImageDetailScreen } from './screens/ImageDetailScreen';

type Tab = 'search' | 'gallery' | 'indexing';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);

  // Navigation mock dispatcher
  const navigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'ImageDetail' && params?.mediaId) {
        setActiveMediaId(params.mediaId);
      } else if (screen === 'GalleryTab') {
        setActiveTab('gallery');
        setActiveMediaId(null);
      } else if (screen === 'SearchTab') {
        setActiveTab('search');
        setActiveMediaId(null);
      }
    },
    push: (screen: string, params?: any) => {
      if (screen === 'ImageDetail' && params?.mediaId) {
        setActiveMediaId(params.mediaId);
      }
    },
    goBack: () => {
      setActiveMediaId(null);
    },
    addListener: (event: string, callback: () => void) => {
      return () => {};
    }
  };

  const renderActiveContent = () => {
    if (activeMediaId) {
      return (
        <ImageDetailScreen
          route={{ params: { mediaId: activeMediaId } }}
          navigation={navigation}
        />
      );
    }

    switch (activeTab) {
      case 'search':
        return <SearchScreen navigation={navigation} />;
      case 'gallery':
        return <GalleryScreen navigation={navigation} />;
      case 'indexing':
        return <IndexingStatusScreen />;
      default:
        return <SearchScreen navigation={navigation} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Main Content View */}
      <View style={styles.contentView}>{renderActiveContent()}</View>

      {/* Bottom Tab Bar (hidden when inspecting ImageDetail) */}
      {!activeMediaId && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'search' && styles.activeTabItem]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={styles.tabIcon}>🔍</Text>
            <Text style={[styles.tabLabel, activeTab === 'search' && styles.activeTabLabel]}>
              Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'gallery' && styles.activeTabItem]}
            onPress={() => setActiveTab('gallery')}
          >
            <Text style={styles.tabIcon}>🖼️</Text>
            <Text style={[styles.tabLabel, activeTab === 'gallery' && styles.activeTabLabel]}>
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'indexing' && styles.activeTabItem]}
            onPress={() => setActiveTab('indexing')}
          >
            <Text style={styles.tabIcon}>⚡</Text>
            <Text style={[styles.tabLabel, activeTab === 'indexing' && styles.activeTabLabel]}>
              Storage & AI
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  contentView: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingBottom: 6,
    paddingTop: 6
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeTabItem: {
    borderTopWidth: 2,
    borderTopColor: '#38bdf8'
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2
  },
  tabLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  activeTabLabel: {
    color: '#38bdf8'
  }
});
