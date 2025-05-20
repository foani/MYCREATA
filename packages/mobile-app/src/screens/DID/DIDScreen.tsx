import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { useDID } from '../../hooks/useDID';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { DID, DIDConnection } from '../../types/did';

type DIDScreenNavigationProp = StackNavigationProp<MainStackParamList, 'DID'>;

const DIDScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<DIDScreenNavigationProp>();
  const { did, connections, fetchDID, fetchConnections, disconnect } = useDID();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentStyles = styles(theme);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchDID(), fetchConnections()]);
    } catch (error) {
      console.error('Error loading DID data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchDID(), fetchConnections()]);
    } catch (error) {
      console.error('Error refreshing DID data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnect = (connection: DIDConnection) => {
    Alert.alert(
      t('did.disconnectTitle'),
      t('did.disconnectConfirm', { name: connection.name }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.disconnect'),
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnect(connection.id);
              fetchConnections();
            } catch (error) {
              console.error('Error disconnecting:', error);
              Alert.alert(t('common.error'), t('did.disconnectError'));
            }
          },
        },
      ]
    );
  };

  const handleCreateDID = () => {
    navigation.navigate('CreateDID');
  };

  const handleConnectDID = () => {
    navigation.navigate('ConnectDID');
  };

  const renderDIDSection = () => {
    if (!did) {
      return (
        <View style={currentStyles.emptyCard}>
          <Text style={currentStyles.emptyTitle}>{t('did.noDID')}</Text>
          <Text style={currentStyles.emptyText}>{t('did.noDIDDesc')}</Text>
          <TouchableOpacity style={currentStyles.createButton} onPress={handleCreateDID}>
            <Text style={currentStyles.createButtonText}>{t('did.create')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={currentStyles.didCard}>
        <View style={currentStyles.didHeader}>
          <View style={currentStyles.didAvatarContainer}>
            {did.avatar ? (
              <Image source={{ uri: did.avatar }} style={currentStyles.didAvatar} />
            ) : (
              <View style={[currentStyles.didAvatar, currentStyles.didAvatarPlaceholder]}>
                <Text style={currentStyles.didAvatarText}>
                  {did.name ? did.name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
          </View>
          <View style={currentStyles.didInfo}>
            <Text style={currentStyles.didName}>{did.name || t('did.unnamed')}</Text>
            <Text style={currentStyles.didIdentifier}>{did.identifier}</Text>
          </View>
          <TouchableOpacity
            style={currentStyles.didEditButton}
            onPress={() => navigation.navigate('EditDID', { did })}
          >
            <Icon name="pencil" size={20} color={theme === 'dark' ? colors.white : colors.black} />
          </TouchableOpacity>
        </View>

        <View style={currentStyles.didDetails}>
          <View style={currentStyles.didDetailRow}>
            <Text style={currentStyles.didDetailLabel}>{t('did.type')}</Text>
            <Text style={currentStyles.didDetailValue}>{did.type}</Text>
          </View>
          <View style={currentStyles.didDetailRow}>
            <Text style={currentStyles.didDetailLabel}>{t('did.createdAt')}</Text>
            <Text style={currentStyles.didDetailValue}>
              {new Date(did.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={currentStyles.didDetailRow}>
            <Text style={currentStyles.didDetailLabel}>{t('did.connections')}</Text>
            <Text style={currentStyles.didDetailValue}>{connections.length}</Text>
          </View>
        </View>

        <View style={currentStyles.didActions}>
          <TouchableOpacity
            style={currentStyles.didAction}
            onPress={() => navigation.navigate('DIDBackup')}
          >
            <Icon name="cloud-upload-outline" size={24} color={colors.primary} />
            <Text style={currentStyles.didActionText}>{t('did.backup')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={currentStyles.didAction}
            onPress={() => navigation.navigate('DIDRecover')}
          >
            <Icon name="cloud-download-outline" size={24} color={colors.primary} />
            <Text style={currentStyles.didActionText}>{t('did.recover')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={currentStyles.didAction}
            onPress={() => {
              Alert.alert(
                t('did.shareDID'),
                t('did.shareDIDDesc'),
                [
                  {
                    text: t('common.cancel'),
                    style: 'cancel',
                  },
                  {
                    text: t('common.share'),
                    onPress: () => {
                      // Share DID
                      if (did?.identifier) {
                        // You'd use Share API here
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Icon name="share-social-outline" size={24} color={colors.primary} />
            <Text style={currentStyles.didActionText}>{t('did.share')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderConnectionsSection = () => {
    if (connections.length === 0) {
      return (
        <View style={currentStyles.emptyConnections}>
          <Text style={currentStyles.emptyConnectionsTitle}>{t('did.noConnections')}</Text>
          <Text style={currentStyles.emptyConnectionsText}>{t('did.noConnectionsDesc')}</Text>
          <TouchableOpacity style={currentStyles.connectButton} onPress={handleConnectDID}>
            <Text style={currentStyles.connectButtonText}>{t('did.connect')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={currentStyles.connectionsContainer}>
        <View style={currentStyles.connectionsHeader}>
          <Text style={currentStyles.connectionsTitle}>{t('did.connections')}</Text>
          <TouchableOpacity
            style={currentStyles.addConnectionButton}
            onPress={handleConnectDID}
          >
            <Icon name="add" size={20} color={colors.primary} />
            <Text style={currentStyles.addConnectionButtonText}>{t('did.add')}</Text>
          </TouchableOpacity>
        </View>

        {connections.map((connection) => (
          <View key={connection.id} style={currentStyles.connectionItem}>
            <View style={currentStyles.connectionIconContainer}>
              {connection.icon ? (
                <Image source={{ uri: connection.icon }} style={currentStyles.connectionIcon} />
              ) : (
                <View style={[currentStyles.connectionIcon, currentStyles.connectionIconPlaceholder]}>
                  <Text style={currentStyles.connectionIconText}>
                    {connection.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={currentStyles.connectionInfo}>
              <Text style={currentStyles.connectionName}>{connection.name}</Text>
              <Text style={currentStyles.connectionDate}>
                {t('did.connectedOn', { date: new Date(connection.connectedAt).toLocaleDateString() })}
              </Text>
            </View>
            <TouchableOpacity
              style={currentStyles.connectionAction}
              onPress={() => handleDisconnect(connection)}
            >
              <Icon name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={currentStyles.container}>
        <View style={currentStyles.header}>
          <Text style={currentStyles.title}>{t('did.title')}</Text>
          <TouchableOpacity
            style={currentStyles.infoButton}
            onPress={() => Linking.openURL('https://docs.creatachain.com/did')}
          >
            <Icon name="information-circle-outline" size={24} color={theme === 'dark' ? colors.white : colors.black} />
          </TouchableOpacity>
        </View>
        <View style={currentStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <Text style={currentStyles.title}>{t('did.title')}</Text>
        <TouchableOpacity
          style={currentStyles.infoButton}
          onPress={() => Linking.openURL('https://docs.creatachain.com/did')}
        >
          <Icon name="information-circle-outline" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={currentStyles.content}
        contentContainerStyle={currentStyles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme === 'dark' ? colors.white : colors.primary}
          />
        }
      >
        {renderDIDSection()}
        {renderConnectionsSection()}

        <View style={currentStyles.infoCard}>
          <Icon name="shield-checkmark-outline" size={24} color={theme === 'dark' ? colors.lightGray : colors.gray} />
          <Text style={currentStyles.infoText}>{t('did.securityNote')}</Text>
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
  infoButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // DID Card
  didCard: {
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  didHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  didAvatarContainer: {
    marginRight: 12,
  },
  didAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  didAvatarPlaceholder: {
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  didAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  didInfo: {
    flex: 1,
  },
  didName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 4,
  },
  didIdentifier: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  didEditButton: {
    padding: 8,
  },
  didDetails: {
    marginBottom: 16,
  },
  didDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  didDetailLabel: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  didDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  didActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  didAction: {
    alignItems: 'center',
    padding: 8,
  },
  didActionText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.primary,
  },
  // Empty DID state
  emptyCard: {
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 16,
  },
  // Connections section
  connectionsContainer: {
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  connectionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  addConnectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addConnectionButtonText: {
    marginLeft: 4,
    color: colors.primary,
    fontWeight: '500',
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  connectionIconContainer: {
    marginRight: 12,
  },
  connectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  connectionIconPlaceholder: {
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 2,
  },
  connectionDate: {
    fontSize: 12,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  connectionAction: {
    padding: 8,
  },
  // Empty connections state
  emptyConnections: {
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
  emptyConnectionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 8,
  },
  emptyConnectionsText: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  connectButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 16,
  },
  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    lineHeight: 20,
  },
});

export default DIDScreen;
