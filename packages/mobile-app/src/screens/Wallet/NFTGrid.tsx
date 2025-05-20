import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';
import { NFT } from '../../types/wallet';

type NFTGridNavigationProp = StackNavigationProp<MainStackParamList, 'NFTGallery'>;

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 40 - 8) / 2; // 40 for horizontal padding, 8 for gap

const NFTGrid: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { nfts } = useWallet();
  const navigation = useNavigation<NFTGridNavigationProp>();

  const currentStyles = styles(theme);

  const renderNFTItem = ({ item }: { item: NFT }) => (
    <TouchableOpacity
      style={currentStyles.nftItem}
      onPress={() => navigation.navigate('NFTDetails', { nftId: item.id })}
    >
      <Image source={{ uri: item.imageUrl }} style={currentStyles.nftImage} />
      <View style={currentStyles.nftInfo}>
        <Text style={currentStyles.nftName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={currentStyles.nftCollection} numberOfLines={1}>
          {item.collection}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={currentStyles.container}>
      {nfts.length > 0 ? (
        <FlatList
          data={nfts}
          renderItem={renderNFTItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={currentStyles.columnWrapper}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Parent ScrollView handles scrolling
        />
      ) : (
        <View style={currentStyles.emptyContainer}>
          <Text style={currentStyles.emptyText}>{t('wallet.noNFTs')}</Text>
          <TouchableOpacity
            style={currentStyles.exploreButton}
            onPress={() => navigation.navigate('DAppBrowser', { url: 'https://opensea.io' })}
          >
            <Text style={currentStyles.exploreButtonText}>{t('wallet.exploreNFTs')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    marginTop: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  nftItem: {
    width: ITEM_WIDTH,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  nftImage: {
    width: '100%',
    height: ITEM_WIDTH,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: theme === 'dark' ? colors.darkBackground : colors.lightGray,
  },
  nftInfo: {
    padding: 8,
  },
  nftName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 2,
  },
  nftCollection: {
    fontSize: 12,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 16,
  },
});

export default NFTGrid;
