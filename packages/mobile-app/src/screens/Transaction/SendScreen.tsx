import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { Asset } from '../../types/wallet';

type SendScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Send'>;
type SendScreenRouteProp = RouteProp<MainStackParamList, 'Send'>;

const SendScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<SendScreenNavigationProp>();
  const route = useRoute<SendScreenRouteProp>();
  const { balances, sendTransaction, validateAddress, estimateGas } = useWallet();

  const initialAssetId = route.params?.assetId;
  const initialRecipient = route.params?.recipient || '';

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(
    initialAssetId ? balances.find(asset => asset.id === initialAssetId) || null : balances[0] || null
  );
  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState('');
  const [gasPrice, setGasPrice] = useState('');
  const [gasLimit, setGasLimit] = useState('');
  const [memo, setMemo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [gasEstimated, setGasEstimated] = useState(false);

  const currentStyles = styles(theme);

  useEffect(() => {
    if (recipient && amount && selectedAsset && validateAddress(recipient) && !addressError) {
      estimateGasFee();
    }
  }, [recipient, amount, selectedAsset]);

  const estimateGasFee = async () => {
    if (!recipient || !amount || !selectedAsset) return;
    
    try {
      const { estimatedGasLimit, estimatedGasPrice } = await estimateGas({
        from: '', // Will use active account
        to: recipient,
        value: amount,
        assetId: selectedAsset.id
      });
      
      setGasLimit(estimatedGasLimit.toString());
      setGasPrice(estimatedGasPrice.toString());
      setGasEstimated(true);
    } catch (error) {
      console.error('Gas estimation error:', error);
      // Use default values
      setGasLimit('21000');
      setGasPrice('5');
      setGasEstimated(true);
    }
  };

  const validateRecipient = (address: string) => {
    if (!address.trim()) {
      setAddressError(t('transaction.recipientRequired'));
      return false;
    }

    const isValid = validateAddress(address);
    if (!isValid) {
      setAddressError(t('transaction.invalidAddress'));
      return false;
    }

    setAddressError('');
    return true;
  };

  const validateAmount = (value: string) => {
    if (!value.trim()) {
      setAmountError(t('transaction.amountRequired'));
      return false;
    }

    const parsedAmount = parseFloat(value);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError(t('transaction.invalidAmount'));
      return false;
    }

    if (selectedAsset && parsedAmount > selectedAsset.balance) {
      setAmountError(t('transaction.insufficientBalance'));
      return false;
    }

    setAmountError('');
    return true;
  };

  const handleSend = async () => {
    const isRecipientValid = validateRecipient(recipient);
    const isAmountValid = validateAmount(amount);

    if (!isRecipientValid || !isAmountValid || !selectedAsset) {
      return;
    }

    setIsProcessing(true);

    try {
      const txHash = await sendTransaction({
        to: recipient,
        value: amount,
        assetId: selectedAsset.id,
        gasLimit: parseInt(gasLimit, 10),
        gasPrice: parseFloat(gasPrice),
        memo: memo
      });

      setIsProcessing(false);
      
      // Navigate to confirmation screen
      navigation.navigate('TransactionConfirmation', {
        txHash,
        type: 'send',
        amount,
        recipient,
        assetSymbol: selectedAsset.symbol
      });
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        t('transaction.error'),
        error instanceof Error ? error.message : t('transaction.unknownError'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner', {
      onScan: (data: string) => {
        // Parse QR data (could be a plain address or a payment URI)
        // This is a simple example; real implementation would handle more complex URIs
        if (data.startsWith('ethereum:')) {
          const parts = data.split('?');
          const address = parts[0].replace('ethereum:', '');
          setRecipient(address);
          
          // Parse additional parameters if available
          if (parts.length > 1) {
            const params = new URLSearchParams(parts[1]);
            const qrAmount = params.get('amount');
            if (qrAmount) {
              setAmount(qrAmount);
            }
          }
        } else {
          setRecipient(data);
        }
      }
    });
  };

  return (
    <SafeAreaView style={currentStyles.container}>
      <KeyboardAvoidingView
        style={currentStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={currentStyles.header}>
          <TouchableOpacity style={currentStyles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
          </TouchableOpacity>
          <Text style={currentStyles.title}>{t('transaction.send')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={currentStyles.content} contentContainerStyle={{ padding: 16 }}>
          <View style={currentStyles.formCard}>
            {/* Asset Selector */}
            <TouchableOpacity
              style={currentStyles.assetSelector}
              onPress={() => navigation.navigate('AssetSelector', {
                onSelect: (asset) => setSelectedAsset(asset)
              })}
            >
              <Text style={currentStyles.selectorLabel}>{t('transaction.selectAsset')}</Text>
              <View style={currentStyles.selectedAsset}>
                {selectedAsset ? (
                  <>
                    <Text style={currentStyles.assetName}>{selectedAsset.name}</Text>
                    <Text style={currentStyles.assetBalance}>
                      {t('transaction.balance')}: {selectedAsset.balance.toLocaleString('en-US', { maximumFractionDigits: 6 })}
                    </Text>
                  </>
                ) : (
                  <Text style={currentStyles.placeholderText}>{t('transaction.chooseAsset')}</Text>
                )}
                <Icon name="chevron-down" size={20} color={theme === 'dark' ? colors.lightGray : colors.gray} />
              </View>
            </TouchableOpacity>

            {/* Recipient */}
            <View style={currentStyles.inputGroup}>
              <Text style={currentStyles.inputLabel}>{t('transaction.recipient')}</Text>
              <View style={currentStyles.addressInput}>
                <TextInput
                  style={[
                    currentStyles.input,
                    addressError ? currentStyles.inputError : null
                  ]}
                  placeholder={t('transaction.enterAddress')}
                  placeholderTextColor={theme === 'dark' ? colors.lightGray : colors.gray}
                  value={recipient}
                  onChangeText={(text) => {
                    setRecipient(text);
                    if (addressError) validateRecipient(text);
                  }}
                  onBlur={() => validateRecipient(recipient)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={currentStyles.scanButton} onPress={handleScanQR}>
                  <Icon name="qr-code" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
              {addressError ? <Text style={currentStyles.errorText}>{addressError}</Text> : null}
            </View>

            {/* Amount */}
            <View style={currentStyles.inputGroup}>
              <Text style={currentStyles.inputLabel}>{t('transaction.amount')}</Text>
              <TextInput
                style={[
                  currentStyles.input,
                  amountError ? currentStyles.inputError : null
                ]}
                placeholder={t('transaction.enterAmount')}
                placeholderTextColor={theme === 'dark' ? colors.lightGray : colors.gray}
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (amountError) validateAmount(text);
                }}
                onBlur={() => validateAmount(amount)}
                keyboardType="decimal-pad"
              />
              {amountError ? <Text style={currentStyles.errorText}>{amountError}</Text> : null}
              
              {selectedAsset && (
                <View style={currentStyles.amountActions}>
                  <TouchableOpacity
                    style={currentStyles.percentButton}
                    onPress={() => {
                      const halfBalance = (selectedAsset.balance / 2).toString();
                      setAmount(halfBalance);
                      validateAmount(halfBalance);
                    }}
                  >
                    <Text style={currentStyles.percentButtonText}>50%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={currentStyles.percentButton}
                    onPress={() => {
                      const maxBalance = selectedAsset.balance.toString();
                      setAmount(maxBalance);
                      validateAmount(maxBalance);
                    }}
                  >
                    <Text style={currentStyles.percentButtonText}>{t('transaction.max')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Network Fee */}
            <View style={currentStyles.feeContainer}>
              <Text style={currentStyles.feeTitle}>{t('transaction.networkFee')}</Text>
              {gasEstimated ? (
                <View style={currentStyles.feeDetails}>
                  <View style={currentStyles.feeRow}>
                    <Text style={currentStyles.feeLabel}>{t('transaction.gasLimit')}</Text>
                    <Text style={currentStyles.feeValue}>{gasLimit}</Text>
                  </View>
                  <View style={currentStyles.feeRow}>
                    <Text style={currentStyles.feeLabel}>{t('transaction.gasPrice')}</Text>
                    <Text style={currentStyles.feeValue}>{gasPrice} Gwei</Text>
                  </View>
                  <View style={[currentStyles.feeRow, currentStyles.totalFeeRow]}>
                    <Text style={currentStyles.totalFeeLabel}>{t('transaction.estimatedFee')}</Text>
                    <Text style={currentStyles.totalFeeValue}>
                      {(parseInt(gasLimit, 10) * parseFloat(gasPrice) / 1e9).toFixed(8)} {selectedAsset?.symbol || 'ETH'}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={currentStyles.estimatingText}>{t('transaction.estimatingFee')}</Text>
              )}
            </View>

            {/* Memo (Optional) */}
            <View style={currentStyles.inputGroup}>
              <Text style={currentStyles.inputLabel}>{t('transaction.memo')} ({t('common.optional')})</Text>
              <TextInput
                style={currentStyles.input}
                placeholder={t('transaction.enterMemo')}
                placeholderTextColor={theme === 'dark' ? colors.lightGray : colors.gray}
                value={memo}
                onChangeText={setMemo}
                multiline
              />
            </View>
          </View>
        </ScrollView>

        <View style={currentStyles.footer}>
          <TouchableOpacity
            style={[
              currentStyles.sendButton,
              (!selectedAsset || !recipient || !amount || addressError || amountError || isProcessing) && currentStyles.disabledButton
            ]}
            onPress={handleSend}
            disabled={!selectedAsset || !recipient || !amount || !!addressError || !!amountError || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={currentStyles.sendButtonText}>{t('transaction.sendFunds')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  formCard: {
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  assetSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 8,
  },
  selectedAsset: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  assetBalance: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 8,
  },
  input: {
    padding: 12,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    color: theme === 'dark' ? colors.white : colors.black,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  addressInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  amountActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  percentButton: {
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  percentButtonText: {
    color: theme === 'dark' ? colors.white : colors.black,
    fontSize: 12,
    fontWeight: '500',
  },
  feeContainer: {
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  feeTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 8,
  },
  feeDetails: {},
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  feeLabel: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  feeValue: {
    fontSize: 14,
    color: theme === 'dark' ? colors.white : colors.black,
  },
  totalFeeRow: {
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    marginTop: 4,
    paddingTop: 8,
  },
  totalFeeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  totalFeeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  estimatingText: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SendScreen;
