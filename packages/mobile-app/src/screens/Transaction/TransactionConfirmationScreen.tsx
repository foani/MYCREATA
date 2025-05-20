import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';

type TransactionConfirmationNavigationProp = StackNavigationProp<MainStackParamList, 'TransactionConfirmation'>;
type TransactionConfirmationRouteProp = RouteProp<MainStackParamList, 'TransactionConfirmation'>;

const TransactionConfirmationScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<TransactionConfirmationNavigationProp>();
  const route = useRoute<TransactionConfirmationRouteProp>();
  const { getTransactionStatus, getExplorerUrl, activeNetwork } = useWallet();

  const { txHash, type, amount, recipient, assetSymbol } = route.params;
  
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [checkCount, setCheckCount] = useState(0);

  const currentStyles = styles(theme);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const txStatus = await getTransactionStatus(txHash);
        
        if (txStatus === 'confirmed') {
          setStatus('confirmed');
          return; // Stop checking once confirmed
        } else if (txStatus === 'failed') {
          setStatus('failed');
          return; // Stop checking once failed
        }
        
        // Continue checking if still pending
        setCheckCount(prev => prev + 1);
        
        // If we've checked many times and still pending, stop checking
        if (checkCount < 20) {
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
        
        // Keep checking despite errors
        if (checkCount < 20) {
          setTimeout(checkStatus, 5000);
          setCheckCount(prev => prev + 1);
        }
      }
    };

    checkStatus();
  }, [txHash, checkCount]);

  const getStatusIcon = () => {
    if (status === 'pending') {
      return (
        <View style={currentStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    } else if (status === 'confirmed') {
      return (
        <View style={currentStyles.iconContainer}>
          <LottieView
            source={require('../../assets/animations/success.json')}
            autoPlay
            loop={false}
            style={currentStyles.animation}
          />
        </View>
      );
    } else {
      return (
        <View style={currentStyles.iconContainer}>
          <Icon name="close-circle" size={80} color={colors.error} />
        </View>
      );
    }
  };

  const getStatusText = () => {
    if (status === 'pending') {
      return t('transaction.pending');
    } else if (status === 'confirmed') {
      return t('transaction.confirmed');
    } else {
      return t('transaction.failed');
    }
  };

  const getDescription = () => {
    if (status === 'pending') {
      return t('transaction.pendingDescription');
    } else if (status === 'confirmed') {
      if (type === 'send') {
        return t('transaction.sentDescription', { amount, symbol: assetSymbol });
      } else {
        return t('transaction.receivedDescription', { amount, symbol: assetSymbol });
      }
    } else {
      return t('transaction.failedDescription');
    }
  };

  const openExplorer = () => {
    const url = getExplorerUrl(txHash);
    Linking.openURL(url);
  };

  const handleDone = () => {
    // Go back to the wallet screen
    navigation.navigate('Wallet');
  };

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <TouchableOpacity style={currentStyles.closeButton} onPress={handleDone}>
          <Icon name="close" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
        <Text style={currentStyles.title}>{t('transaction.status')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={currentStyles.content} contentContainerStyle={currentStyles.contentContainer}>
        {getStatusIcon()}
        
        <Text style={currentStyles.statusText}>{getStatusText()}</Text>
        <Text style={currentStyles.description}>{getDescription()}</Text>
        
        <View style={currentStyles.detailsCard}>
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.type')}</Text>
            <Text style={currentStyles.detailValue}>
              {type === 'send' ? t('transaction.send') : t('transaction.receive')}
            </Text>
          </View>
          
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.amount')}</Text>
            <Text style={currentStyles.detailValue}>
              {amount} {assetSymbol}
            </Text>
          </View>
          
          {recipient && (
            <View style={currentStyles.detailRow}>
              <Text style={currentStyles.detailLabel}>{t('transaction.recipient')}</Text>
              <Text style={currentStyles.detailValue} numberOfLines={1}>
                {recipient.substring(0, 8)}...{recipient.substring(recipient.length - 6)}
              </Text>
            </View>
          )}
          
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.network')}</Text>
            <Text style={currentStyles.detailValue}>{activeNetwork?.name || 'Unknown'}</Text>
          </View>
          
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.detailLabel}>{t('transaction.txHash')}</Text>
            <Text style={currentStyles.detailValue} numberOfLines={1}>
              {txHash.substring(0, 8)}...{txHash.substring(txHash.length - 6)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={currentStyles.viewButton} onPress={openExplorer}>
          <Text style={currentStyles.viewButtonText}>{t('transaction.viewOnExplorer')}</Text>
          <Icon name="open-outline" size={18} color={colors.primary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </ScrollView>

      <View style={currentStyles.footer}>
        <TouchableOpacity style={currentStyles.doneButton} onPress={handleDone}>
          <Text style={currentStyles.doneButtonText}>{t('common.done')}</Text>
        </TouchableOpacity>
      </View>
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
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  animation: {
    width: 120,
    height: 120,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  viewButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionConfirmationScreen;
