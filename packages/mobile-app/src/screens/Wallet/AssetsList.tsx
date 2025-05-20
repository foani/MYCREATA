import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';
import { Asset } from '../../types/wallet';

type AssetListNavigationProp = StackNavigationProp<MainStackParamList, 'Wallet'>;

const AssetsList: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { balances } = useWallet();
  const navigation = useNavigation<AssetListNavigationProp>();

  const currentStyles = styles(theme);

  // Function to get appropriate icon for a token
  const getTokenIcon = (symbol: string) => {
    try {
      // For production, you'd use dynamic imports or a proper asset management system
      // This is just a placeholder
      return { uri: `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/token-logo-${symbol.toLowerCase()}.png` };
    } catch (error) {
      // Default icon if the specific one is not found
      return require('../../assets/images/default-token.png');
    }
  };

  const renderAssetItem = ({ item }: { item: Asset }) => (
    <TouchableOpacity
      style={currentStyles.assetItem}
      onPress={() => navigation.navigate('AssetDetails', { assetId: item.id })}
    >
      <Image source={getTokenIcon(item.symbol)} style={currentStyles.tokenIcon} />
      <View style={currentStyles.assetInfo}>
        <Text style={currentStyles.assetName}>{item.name}</Text>
        <Text style={currentStyles.assetSymbol}>{item.symbol}</Text>
      </View>
      <View style={currentStyles.assetValues}>
        <Text style={currentStyles.assetBalance}>
          {item.balance.toLocaleString('en-US', { maximumFractionDigits: 6 })}
        </Text>
        <Text style={currentStyles.assetValue}>
          ${item.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={currentStyles.container}>
      {balances.length > 0 ? (
        <FlatList
          data={balances}
          renderItem={renderAssetItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Parent ScrollView handles scrolling
        />
      ) : (
        <View style={currentStyles.emptyContainer}>
          <Text style={currentStyles.emptyText}>{t('wallet.noAssets')}</Text>
          <TouchableOpacity
            style={currentStyles.addTokenButton}
            onPress={() => navigation.navigate('AddToken')}
          >
            <Text style={currentStyles.addTokenButtonText}>{t('wallet.addToken')}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity
        style={currentStyles.addTokenButton}
        onPress={() => navigation.navigate('AddToken')}
      >
        <Text style={currentStyles.addTokenButtonText}>{t('wallet.addToken')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    marginTop: 8,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 2,
  },
  assetSymbol: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  assetBalance: {
    fontSize: 16,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 2,
  },
  assetValue: {
    fontSize: 14,
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
  addTokenButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addTokenButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 16,
  },
});

export default AssetsList;
