import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Clipboard,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import { Asset } from '../../types/wallet';

type ReceiveScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Receive'>;

const ReceiveScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<ReceiveScreenNavigationProp>();
  const { activeAccount, balances } = useWallet();

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(balances[0] || null);
  const [qrValue, setQrValue] = useState('');

  const currentStyles = styles(theme);

  useEffect(() => {
    if (activeAccount && selectedAsset) {
      // Generate payment URI for QR code (format: ethereum:[address]?token=[contractAddress]&amount=[amount])
      let uri = `ethereum:${activeAccount.address}`;
      
      // For tokens other than the native token, add the token parameter
      if (selectedAsset.contractAddress && selectedAsset.contractAddress !== '0x0000000000000000000000000000000000000000') {
        uri += `?token=${selectedAsset.contractAddress}`;
      }
      
      setQrValue(uri);
    }
  }, [activeAccount, selectedAsset]);

  const handleCopyAddress = () => {
    if (activeAccount) {
      Clipboard.setString(activeAccount.address);
      Alert.alert(t('receive.copied'), t('receive.addressCopied'));
    }
  };

  const handleShare = async () => {
    if (activeAccount) {
      try {
        await Share.share({
          message: activeAccount.address,
          title: t('receive.myAddress'),
        });
      } catch (error) {
        console.error('Error sharing address:', error);
      }
    }
  };

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <TouchableOpacity style={currentStyles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
        <Text style={currentStyles.title}>{t('receive.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={currentStyles.content} contentContainerStyle={currentStyles.contentContainer}>
        <View style={currentStyles.qrCard}>
          <Text style={currentStyles.qrTitle}>{t('receive.scanQR')}</Text>
          <Text style={currentStyles.assetName}>
            {selectedAsset ? selectedAsset.name : t('receive.selectAsset')}
          </Text>

          <View style={currentStyles.qrContainer}>
            {qrValue ? (
              <QRCode
                value={qrValue}
                size={200}
                color={theme === 'dark' ? colors.white : colors.black}
                backgroundColor={theme === 'dark' ? colors.darkCard : colors.white}
              />
            ) : null}
          </View>

          {activeAccount && (
            <View style={currentStyles.addressContainer}>
              <Text style={currentStyles.addressLabel}>{t('receive.address')}</Text>
              <Text style={currentStyles.addressValue} selectable={true}>
                {activeAccount.address}
              </Text>
              <View style={currentStyles.addressActions}>
                <TouchableOpacity style={currentStyles.actionButton} onPress={handleCopyAddress}>
                  <Icon name="copy-outline" size={20} color={colors.primary} />
                  <Text style={currentStyles.actionButtonText}>{t('receive.copy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={currentStyles.actionButton} onPress={handleShare}>
                  <Icon name="share-outline" size={20} color={colors.primary} />
                  <Text style={currentStyles.actionButtonText}>{t('receive.share')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={currentStyles.assetSelector}>
          <Text style={currentStyles.selectorLabel}>{t('receive.selectAsset')}</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={currentStyles.assetList}
          >
            {balances.map((asset) => (
              <TouchableOpacity
                key={asset.id}
                style={[
                  currentStyles.assetItem,
                  selectedAsset?.id === asset.id ? currentStyles.selectedAssetItem : null,
                ]}
                onPress={() => setSelectedAsset(asset)}
              >
                <Text
                  style={[
                    currentStyles.assetItemText,
                    selectedAsset?.id === asset.id ? currentStyles.selectedAssetItemText : null,
                  ]}
                >
                  {asset.symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={currentStyles.infoCard}>
          <Icon name="information-circle-outline" size={24} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          <Text style={currentStyles.infoText}>{t('receive.info')}</Text>
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
  contentContainer: {
    padding: 16,
  },
  qrCard: {
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 4,
  },
  assetName: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 8,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addressContainer: {
    width: '100%',
  },
  addressLabel: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 8,
  },
  addressValue: {
    fontSize: 14,
    color: theme === 'dark' ? colors.white : colors.black,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    color: colors.primary,
    fontWeight: '500',
  },
  assetSelector: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 12,
  },
  assetList: {
    paddingBottom: 8,
  },
  assetItem: {
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedAssetItem: {
    backgroundColor: colors.primary,
  },
  assetItemText: {
    color: theme === 'dark' ? colors.white : colors.black,
    fontWeight: '500',
  },
  selectedAssetItemText: {
    color: colors.white,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    lineHeight: 20,
  },
});

export default ReceiveScreen;
