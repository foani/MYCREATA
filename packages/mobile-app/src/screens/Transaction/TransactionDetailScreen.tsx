import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { Transaction } from '../../types/wallet';

type TransactionDetailScreenNavigationProp = StackNavigationProp<MainStackParamList, 'TransactionDetail'>;
type TransactionDetailScreenRouteProp = RouteProp<MainStackParamList, 'TransactionDetail'>;

const TransactionDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<TransactionDetailScreenNavigationProp>();
  const route = useRoute<TransactionDetailScreenRouteProp>();
  const { getTransaction, getExplorerUrl } = useWallet();

  const { txHash } = route.params;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const currentStyles = styles(theme);

  useEffect(() => {
    loadTransaction();
  }, [txHash]);

  const loadTransaction = async () => {
    setLoading(true);
    try {
      const tx = await getTransaction(txHash);
      setTransaction(tx);
    } catch (error) {
      console.error('Error loading transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return theme === 'dark' ? colors.lightGray : colors.gray;
    }
  };

  const openExplorer = () => {
    const url = getExplorerUrl(txHash);
    Linking.openURL(url);
  };

  const copyToClipboard = (text: string) => {
    // Use Clipboard API to copy
    if (text) {
      Clipboard.setString(text);
      // Show toast or alert
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={currentStyles.container}>
        <View style={currentStyles.header}>
          <TouchableOpacity style={currentStyles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
          </TouchableOpacity>
          <Text style={currentStyles.title}>{t('transaction.details')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={currentStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={currentStyles.container}>
        <View style={currentStyles.header}>
          <TouchableOpacity style={currentStyles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
          </TouchableOpacity>
          <Text style={currentStyles.title}>{t('transaction.details')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={currentStyles.notFoundContainer}>
          <Icon name="alert-circle-outline" size={64} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          <Text style={currentStyles.notFoundText}>{t('transaction.notFound')}</Text>
          <TouchableOpacity style={currentStyles.refreshButton} onPress={loadTransaction}>
            <Text style={currentStyles.refreshButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <TouchableOpacity style={currentStyles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
        <Text style={currentStyles.title}>{t('transaction.details')}</Text>
        <TouchableOpacity style={currentStyles.shareButton} onPress={openExplorer}>
          <Icon name="open-outline" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={currentStyles.content}>
        <View style={currentStyles.summaryCard}>
          <View style={currentStyles.iconContainer}>
            <Icon
              name={transaction.direction === 'outgoing' ? 'arrow-up-outline' : 'arrow-down-outline'}
              size={28}
              color={transaction.direction === 'outgoing' ? colors.error : colors.success}
            />
          </View>
          
          <Text style={currentStyles.txType}>
            {transaction.direction === 'outgoing' ? t('transaction.sent') : t('transaction.received')}
          </Text>
          
          <Text style={currentStyles.amount}>
            {transaction.direction === 'outgoing' ? '-' : '+'}{transaction.value} {transaction.asset?.symbol || 'ETH'}
          </Text>
          
          <Text style={currentStyles.fiatAmount}>
            ${transaction.valueFiat.toFixed(2)}
          </Text>

          <View style={[
            currentStyles.statusContainer,
            { backgroundColor: `${getStatusColor(transaction.status)}15` }
          ]}>
            <Text style={[
              currentStyles.statusText,
              { color: getStatusColor(transaction.status) }
            ]}>
              {transaction.status === 'confirmed' ? t('transaction.confirmed') : 
               transaction.status === 'pending' ? t('transaction.pending') : 
               t('transaction.failed')}
            </Text>
          </View>
        </View>

        <View style={currentStyles.detailsCard}>
          <Text style={currentStyles.sectionTitle}>{t('transaction.details')}</Text>
          
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.from')}</Text>
            <TouchableOpacity 
              style={currentStyles.addressContainer}
              onPress={() => copyToClipboard(transaction.from)}
            >
              <Text style={currentStyles.detailValue} numberOfLines={1}>
                {transaction.from}
              </Text>
              <Icon name="copy-outline" size={16} color={theme === 'dark' ? colors.lightGray : colors.gray} />
            </TouchableOpacity>
          </View>
          
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.to')}</Text>
            <TouchableOpacity 
              style={currentStyles.addressContainer}
              onPress={() => copyToClipboard(transaction.to)}
            >
              <Text style={currentStyles.detailValue} numberOfLines={1}>
                {transaction.to}
              </Text>
              <Icon name="copy-outline" size={16} color={theme === 'dark' ? colors.lightGray : colors.gray} />
            </TouchableOpacity>
          </View>

          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.token')}</Text>
            <Text style={currentStyles.detailValue}>
              {transaction.asset?.name || 'Unknown'} ({transaction.asset?.symbol || '?'})
            </Text>
          </View>

          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.date')}</Text>
            <Text style={currentStyles.detailValue}>
              {format(new Date(transaction.timestamp), 'PPP pp')}
            </Text>
          </View>

          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.network')}</Text>
            <Text style={currentStyles.detailValue}>
              {transaction.network?.name || 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={currentStyles.detailsCard}>
          <Text style={currentStyles.sectionTitle}>{t('transaction.fees')}</Text>
          
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.gasPrice')}</Text>
            <Text style={currentStyles.detailValue}>
              {transaction.gasPrice} Gwei
            </Text>
          </View>
          
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.gasLimit')}</Text>
            <Text style={currentStyles.detailValue}>
              {transaction.gasLimit}
            </Text>
          </View>
          
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.gasUsed')}</Text>
            <Text style={currentStyles.detailValue}>
              {transaction.gasUsed || '-'}
            </Text>
          </View>
          
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.totalFee')}</Text>
            <Text style={currentStyles.detailValue}>
              {transaction.fee || '-'} {transaction.network?.nativeCurrency || 'ETH'}
            </Text>
          </View>
        </View>

        <View style={currentStyles.detailsCard}>
          <Text style={currentStyles.sectionTitle}>{t('transaction.transactionHash')}</Text>
          
          <TouchableOpacity 
            style={currentStyles.hashContainer}
            onPress={() => copyToClipboard(transaction.hash)}
          >
            <Text style={currentStyles.hash} selectable>
              {transaction.hash}
            </Text>
            <Icon name="copy-outline" size={16} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={currentStyles.viewButton} onPress={openExplorer}>
          <Text style={currentStyles.viewButtonText}>{t('transaction.viewOnExplorer')}</Text>
          <Icon name="open-outline" size={20} color={colors.primary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
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
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  txType: {
    fontSize: 16,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 8,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  fiatAmount: {
    fontSize: 16,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginTop: 4,
    marginBottom: 16,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
    maxWidth: '60%',
    textAlign: 'right',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  hash: {
    flex: 1,
    fontSize: 14,
    color: theme === 'dark' ? colors.white : colors.black,
    marginRight: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 32,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notFoundText: {
    fontSize: 16,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
});

export default TransactionDetailScreen;
