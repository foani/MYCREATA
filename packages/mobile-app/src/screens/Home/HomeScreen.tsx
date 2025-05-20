import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useWallet } from '../../contexts/WalletContext';
import { useNetwork } from '../../contexts/NetworkContext';
import AccountCard from '../../components/home/AccountCard';
import AssetCard from '../../components/home/AssetCard';
import ActivityItem from '../../components/home/ActivityItem';
import Icon from '../../components/common/Icon';
import { Token, Transaction } from '../../types/wallet';

/**
 * 홈 화면 컴포넌트
 */
const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { 
    selectedAccount, 
    balance, 
    tokens, 
    transactions,
    refreshBalance,
    refreshTokens,
    refreshTransactions
  } = useWallet();
  const { selectedNetwork } = useNetwork();
  
  const [refreshing, setRefreshing] = useState(false);

  // 화면 진입시 데이터 새로고침
  useEffect(() => {
    refreshData();
  }, [selectedAccount, selectedNetwork]);

  // 당겨서 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // 데이터 새로고침
  const refreshData = async () => {
    if (selectedAccount) {
      try {
        await Promise.all([
          refreshBalance(),
          refreshTokens(),
          refreshTransactions()
        ]);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    }
  };

  // 메인 자산 (예: CTA)과 나머지 토큰으로 분리
  const mainToken = tokens.find(
    (token) => token.address === '0x0000000000000000000000000000000000000000'
  );
  const otherTokens = tokens.filter(
    (token) => token.address !== '0x0000000000000000000000000000000000000000'
  );

  // 최근 트랜잭션 (최대 3개)
  const recentTransactions = transactions.slice(0, 3);

  // 설정 화면으로 이동
  const goToSettings = () => {
    navigation.navigate('Settings');
  };

  // 자산 화면으로 이동
  const goToWallet = () => {
    navigation.navigate('Tabs', { screen: 'Wallet' });
  };

  // 활동 내역 화면으로 이동
  const goToActivity = () => {
    navigation.navigate('Tabs', { screen: 'Activity' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
      />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('common.appName')}
        </Text>
        <TouchableOpacity onPress={goToSettings}>
          <Icon name="settings" color={colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 계정 카드 */}
        {selectedAccount && mainToken && (
          <AccountCard
            address={selectedAccount}
            balance={balance.toString()}
            symbol={mainToken.symbol}
            networkName={selectedNetwork.name}
          />
        )}

        {/* 자산 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('wallet.assets')}
            </Text>
            <TouchableOpacity onPress={goToWallet}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {t('common.seeAll', 'See all')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 토큰 목록 */}
          <View style={styles.assetsContainer}>
            {otherTokens.slice(0, 3).map((token: Token) => (
              <AssetCard
                key={token.address}
                tokenAddress={token.address}
                symbol={token.symbol}
                name={token.name}
                balance={token.balance}
                iconUrl={token.iconUrl}
              />
            ))}
          </View>
        </View>

        {/* 활동 내역 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('wallet.activity')}
            </Text>
            <TouchableOpacity onPress={goToActivity}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {t('common.seeAll', 'See all')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 최근 활동 목록 */}
          <View
            style={[
              styles.activityContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx: Transaction, index: number) => (
                <ActivityItem
                  key={tx.hash}
                  hash={tx.hash}
                  type={tx.from.toLowerCase() === selectedAccount?.toLowerCase() ? 'send' : 'receive'}
                  status={tx.status}
                  amount={tx.value}
                  symbol={tx.tokenAddress === '0x0000000000000000000000000000000000000000' ? selectedNetwork.symbol : (tokens.find(t => t.address === tx.tokenAddress)?.symbol || 'Unknown')}
                  counterparty={tx.from.toLowerCase() === selectedAccount?.toLowerCase() ? tx.to : tx.from}
                  timestamp={tx.timestamp}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('wallet.transactions.noTransactions')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
  },
  assetsContainer: {
    marginBottom: 8,
  },
  activityContainer: {
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  bottomPadding: {
    height: 24,
  },
});

export default HomeScreen;
