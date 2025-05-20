import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from '../common/Icon';
import { format } from 'date-fns';
import { TransactionStatus } from '../../types/wallet';

interface ActivityItemProps {
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'contract';
  status: TransactionStatus;
  amount: string;
  symbol: string;
  counterparty: string;
  timestamp: number;
}

/**
 * 활동 항목 컴포넌트 - 홈 화면에서 사용
 */
const ActivityItem: React.FC<ActivityItemProps> = ({
  hash,
  type,
  status,
  amount,
  symbol,
  counterparty,
  timestamp,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  // 주소 문자열 줄이기
  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 트랜잭션 타입에 따른 아이콘 결정
  const getIcon = () => {
    switch (type) {
      case 'send':
        return <Icon name="send" color="#EF4444" size={20} />;
      case 'receive':
        return <Icon name="receive" color="#10B981" size={20} />;
      case 'swap':
        return <Icon name="swap" color={colors.primary} size={20} />;
      case 'contract':
        return <Icon name="settings" color={colors.textSecondary} size={20} />;
      default:
        return <Icon name="activity" color={colors.textSecondary} size={20} />;
    }
  };

  // 트랜잭션 타입에 따른 타이틀 결정
  const getTitle = () => {
    switch (type) {
      case 'send':
        return t('wallet.transactions.sent');
      case 'receive':
        return t('wallet.transactions.received');
      case 'swap':
        return 'Swap';
      case 'contract':
        return 'Contract Interaction';
      default:
        return 'Transaction';
    }
  };

  // 트랜잭션 타입에 따른 금액 접두사 결정
  const getAmountPrefix = () => {
    switch (type) {
      case 'send':
        return '-';
      case 'receive':
        return '+';
      default:
        return '';
    }
  };

  // 상태에 따른 배지 스타일 결정
  const getStatusBadge = () => {
    if (status === 'pending') {
      return (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: colors.warning + '33' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: colors.warning }]}
          >
            {t('wallet.transactions.pending')}
          </Text>
        </View>
      );
    }

    if (status === 'failed') {
      return (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: colors.error + '33' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: colors.error }]}
          >
            {t('wallet.transactions.failed')}
          </Text>
        </View>
      );
    }

    return null;
  };

  // 상세 화면으로 이동
  const handlePress = () => {
    navigation.navigate('TransactionDetail', { hash });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>

      <View style={styles.details}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: colors.text }]}>
            {getTitle()}
          </Text>
          <Text
            style={[
              styles.amount,
              { color: type === 'send' ? '#EF4444' : '#10B981' },
            ]}
          >
            {getAmountPrefix()}
            {amount} {symbol}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.leftInfo}>
            <Text style={[styles.address, { color: colors.textSecondary }]}>
              {shortenAddress(counterparty)}
            </Text>
            <Text style={[styles.time, { color: colors.textTertiary }]}>
              {format(new Date(timestamp), 'MMM d, h:mm a')}
            </Text>
          </View>
          {getStatusBadge()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 12,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default ActivityItem;
