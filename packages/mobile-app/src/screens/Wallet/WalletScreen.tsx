import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../contexts/ThemeContext';
import AssetsList from './AssetsList';
import { colors } from '../../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';

type WalletScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Wallet'>;

const WalletScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { accounts, activeAccount, balances, fetchBalances } = useWallet();
  const navigation = useNavigation<WalletScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const currentStyles = styles(theme);

  useEffect(() => {
    fetchBalances();
  }, [activeAccount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBalances();
    setRefreshing(false);
  };

  const totalBalance = balances.reduce((acc, asset) => acc + asset.balanceUSD, 0);

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <Text style={currentStyles.title}>{t('wallet.title')}</Text>
        <TouchableOpacity
          style={currentStyles.iconButton}
          onPress={() => navigation.navigate('WalletSettings')}
        >
          <Icon name="settings-outline" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={currentStyles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme === 'dark' ? colors.white : colors.primary}
          />
        }
      >
        <View style={currentStyles.balanceContainer}>
          <Text style={currentStyles.balanceLabel}>{t('wallet.totalBalance')}</Text>
          <Text style={currentStyles.balanceValue}>
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={currentStyles.accountContainer}>
          <Text style={currentStyles.accountLabel}>{t('wallet.activeAccount')}</Text>
          <Text style={currentStyles.accountAddress}>
            {activeAccount
              ? `${activeAccount.address.substring(0, 6)}...${activeAccount.address.substring(
                  activeAccount.address.length - 4
                )}`
              : t('wallet.noActiveAccount')}
          </Text>
        </View>

        <View style={currentStyles.actionButtons}>
          <TouchableOpacity
            style={currentStyles.actionButton}
            onPress={() => navigation.navigate('Send')}
          >
            <Icon name="arrow-up-outline" size={20} color={colors.white} />
            <Text style={currentStyles.actionButtonText}>{t('wallet.send')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={currentStyles.actionButton}
            onPress={() => navigation.navigate('Receive')}
          >
            <Icon name="arrow-down-outline" size={20} color={colors.white} />
            <Text style={currentStyles.actionButtonText}>{t('wallet.receive')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={currentStyles.actionButton}
            onPress={() => navigation.navigate('Swap')}
          >
            <Icon name="swap-horizontal-outline" size={20} color={colors.white} />
            <Text style={currentStyles.actionButtonText}>{t('wallet.swap')}</Text>
          </TouchableOpacity>
        </View>

        <View style={currentStyles.assetsContainer}>
          <Text style={currentStyles.sectionTitle}>{t('wallet.assets')}</Text>
          <AssetsList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? colors.darkBackground : colors.lightBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  iconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  balanceContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  accountContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accountLabel: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 4,
  },
  accountAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '500',
    marginLeft: 4,
  },
  assetsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 12,
  },
});

export default WalletScreen;
