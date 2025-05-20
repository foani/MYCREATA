import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Card from '../common/Card';

interface AssetCardProps {
  tokenAddress: string;
  symbol: string;
  name: string;
  balance: string;
  value?: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  iconUrl?: string | null;
}

/**
 * 자산 카드 컴포넌트 - 홈 화면에서 사용
 */
const AssetCard: React.FC<AssetCardProps> = ({
  tokenAddress,
  symbol,
  name,
  balance,
  value,
  change,
  iconUrl,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  // 금액 변동에 따른 색상 결정
  const getChangeColor = () => {
    if (!change) return colors.textSecondary;
    return change.isPositive ? '#10B981' : '#EF4444';
  };

  // 토큰 상세 화면으로 이동
  const handlePress = () => {
    navigation.navigate('TokenDetail', { tokenAddress });
  };

  return (
    <Card onPress={handlePress} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.left}>
          {iconUrl ? (
            <Image source={{ uri: iconUrl }} style={styles.icon} />
          ) : (
            <View
              style={[styles.placeholder, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.placeholderText}>{symbol.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.nameContainer}>
            <Text style={[styles.symbol, { color: colors.text }]}>
              {symbol}
            </Text>
            <Text style={[styles.name, { color: colors.textSecondary }]}>
              {name}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={[styles.balance, { color: colors.text }]}>
            {balance}
          </Text>
          {value && (
            <View style={styles.valueContainer}>
              <Text style={[styles.value, { color: colors.textSecondary }]}>
                {value}
              </Text>
              {change && (
                <Text
                  style={[
                    styles.change,
                    { color: getChangeColor() },
                  ]}
                >
                  {change.isPositive ? '+' : ''}
                  {change.value}%
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  placeholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameContainer: {
    marginLeft: 12,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  name: {
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 12,
    marginRight: 4,
  },
  change: {
    fontSize: 12,
  },
});

export default AssetCard;
