import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Card from '../common/Card';
import Icon from '../common/Icon';
import Button from '../common/Button';

interface AccountCardProps {
  address: string;
  balance: string;
  symbol: string;
  networkName: string;
}

/**
 * 계정 카드 컴포넌트 - 홈 화면에서 사용
 */
const AccountCard: React.FC<AccountCardProps> = ({
  address,
  balance,
  symbol,
  networkName,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  // 주소 문자열 줄이기
  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 주소 복사하기
  const copyAddress = () => {
    // 클립보드에 복사 구현
    // TODO: 실제 구현 필요
    console.log('Address copied:', address);
  };

  return (
    <Card style={styles.container} elevation={2}>
      <View style={styles.header}>
        <View style={styles.networkContainer}>
          <View
            style={[styles.networkDot, { backgroundColor: colors.primary }]}
          />
          <Text style={[styles.networkName, { color: colors.text }]}>
            {networkName}
          </Text>
        </View>
        <TouchableOpacity onPress={copyAddress} style={styles.addressContainer}>
          <Text style={[styles.address, { color: colors.textSecondary }]}>
            {shortenAddress(address)}
          </Text>
          <Icon name="copy" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
          {t('wallet.total')}
        </Text>
        <Text style={[styles.balance, { color: colors.text }]}>
          {balance} {symbol}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title={t('wallet.send')}
          variant="outline"
          size="small"
          iconLeft={<Icon name="send" size={14} color={colors.primary} />}
          style={styles.actionButton}
          onPress={() => navigation.navigate('SendScreen')}
        />
        <Button
          title={t('wallet.receive')}
          variant="outline"
          size="small"
          iconLeft={<Icon name="receive" size={14} color={colors.primary} />}
          style={styles.actionButton}
          onPress={() => navigation.navigate('ReceiveScreen')}
        />
        <Button
          title={t('wallet.swap')}
          variant="outline"
          size="small"
          iconLeft={<Icon name="swap" size={14} color={colors.primary} />}
          style={styles.actionButton}
          onPress={() => console.log('Swap')}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  networkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  networkName: {
    fontSize: 14,
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 12,
    marginRight: 4,
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default AccountCard;
