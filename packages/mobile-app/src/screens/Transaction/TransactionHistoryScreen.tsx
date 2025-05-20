import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { Transaction } from '../../types/wallet';
import { format } from 'date-fns';

type TransactionHistoryScreenNavigationProp = StackNavigationProp<MainStackParamList, 'TransactionHistory'>;

const TransactionHistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<TransactionHistoryScreenNavigationProp>();
  const { transactions, fetchTransactions, activeAccount } = useWallet();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const currentStyles = styles(theme);

  useEffect(() => {
    loadTransactions();
  }, [activeAccount]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      await fetchTransactions();
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTransactions();
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.direction === 'outgoing';
    if (filter === 'received') return tx.direction === 'incoming';
    return true;
  });

  const groupTransactionsByDate = (txs: Transaction[]) => {
    const grouped: { [date: string]: Transaction[] } = {};
    
    txs.forEach(tx => {
      const date = format(new Date(tx.timestamp), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(tx);
    });
    
    return Object.entries(grouped).map(([date, txs]) => ({
      date,
      transactions: txs,
    }));
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={currentStyles.transactionItem}
      onPress={() => navigation.navigate('TransactionDetail', { txHash: item.hash })}
    >
      <View style={currentStyles.txIconContainer}>
        <Icon
          name={item.direction === 'outgoing' ? 'arrow-up-outline' : 'arrow-down-outline'}
          size={20}
          color={item.direction === 'outgoing' ? colors.error : colors.success}
        />
      </View>
      
      <View style={currentStyles.txInfo}>
        <Text style={currentStyles.txType}>
          {item.direction === 'outgoing' ? t('transaction.sent') : t('transaction.received')}
          {' '}
          {item.asset?.symbol || 'Unknown'}
        </Text>
        
        <Text style={currentStyles.txAddress} numberOfLines={1}>
          {item.direction === 'outgoing' 
            ? `${t('transaction.to')}: ${item.to.substring(0, 8)}...${item.to.substring(item.to.length - 6)}`
            : `${t('transaction.from')}: ${item.from.substring(0, 8)}...${item.from.substring(item.from.length - 6)}`
          }
        </Text>
        
        <Text style={currentStyles.txTime}>
          {format(new Date(item.timestamp), 'HH:mm')}
        </Text>
      </View>
      
      <View style={currentStyles.txAmount}>
        <Text
          style={[
            currentStyles.txAmountText,
            { color: item.direction === 'outgoing' ? colors.error : colors.success }
          ]}
        >
          {item.direction === 'outgoing' ? '-' : '+'}{item.value}
        </Text>
        
        <Text style={currentStyles.txAmountFiat}>
          ${item.valueFiat.toFixed(2)}
        </Text>
        
        <View style={[
          currentStyles.txStatus,
          item.status === 'confirmed' ? currentStyles.txStatusConfirmed : 
          item.status === 'pending' ? currentStyles.txStatusPending : 
          currentStyles.txStatusFailed
        ]}>
          <Text style={currentStyles.txStatusText}>
            {item.status === 'confirmed' ? t('transaction.confirmed') : 
             item.status === 'pending' ? t('transaction.pending') : 
             t('transaction.failed')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDateHeader = ({ item }: { item: { date: string; transactions: Transaction[] } }) => (
    <View style={currentStyles.dateHeader}>
      <Text style={currentStyles.dateText}>
        {format(new Date(item.date), 'EEEE, MMMM d, yyyy')}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={currentStyles.emptyContainer}>
      <Icon 
        name="document-text-outline" 
        size={64} 
        color={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} 
      />
      <Text style={currentStyles.emptyTitle}>{t('transaction.noTransactions')}</Text>
      <Text style={currentStyles.emptyText}>{t('transaction.noTransactionsDesc')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <TouchableOpacity style={currentStyles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
        <Text style={currentStyles.title}>{t('transaction.history')}</Text>
        <TouchableOpacity 
          style={currentStyles.filterButton}
          onPress={() => navigation.navigate('TransactionFilters', {
            currentFilter: filter,
            onFilterChange: (newFilter: 'all' | 'sent' | 'received') => setFilter(newFilter)
          })}
        >
          <Icon name="filter" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
      </View>

      <View style={currentStyles.filterTabs}>
        <TouchableOpacity
          style={[currentStyles.filterTab, filter === 'all' ? currentStyles.activeFilterTab : null]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[currentStyles.filterTabText, filter === 'all' ? currentStyles.activeFilterTabText : null]}
          >
            {t('transaction.all')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[currentStyles.filterTab, filter === 'sent' ? currentStyles.activeFilterTab : null]}
          onPress={() => setFilter('sent')}
        >
          <Text
            style={[currentStyles.filterTabText, filter === 'sent' ? currentStyles.activeFilterTabText : null]}
          >
            {t('transaction.sent')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[currentStyles.filterTab, filter === 'received' ? currentStyles.activeFilterTab : null]}
          onPress={() => setFilter('received')}
        >
          <Text
            style={[currentStyles.filterTabText, filter === 'received' ? currentStyles.activeFilterTabText : null]}
          >
            {t('transaction.received')}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={currentStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={groupedTransactions}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View>
              {renderDateHeader({ item })}
              {item.transactions.map(tx => (
                <View key={tx.hash}>
                  {renderTransactionItem({ item: tx })}
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={filteredTransactions.length === 0 ? { flex: 1 } : { paddingBottom: 16 }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme === 'dark' ? colors.white : colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  filterButton: {
    padding: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeFilterTab: {
    backgroundColor: theme === 'dark' ? colors.primary : colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  activeFilterTabText: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    marginBottom: 1,
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txType: {
    fontSize: 16,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 2,
  },
  txAddress: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 2,
  },
  txTime: {
    fontSize: 12,
    color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
  },
  txAmount: {
    alignItems: 'flex-end',
  },
  txAmountText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  txAmountFiat: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 4,
  },
  txStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  txStatusConfirmed: {
    backgroundColor: theme === 'dark' ? 'rgba(75,181,67,0.2)' : 'rgba(75,181,67,0.1)',
  },
  txStatusPending: {
    backgroundColor: theme === 'dark' ? 'rgba(255,184,0,0.2)' : 'rgba(255,184,0,0.1)',
  },
  txStatusFailed: {
    backgroundColor: theme === 'dark' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
  },
  txStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    textAlign: 'center',
  },
});

export default TransactionHistoryScreen;
