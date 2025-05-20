import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  ActivityIndicator,
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
import QRCode from 'react-native-qrcode-svg';

type ConnectDIDScreenNavigationProp = StackNavigationProp<MainStackParamList, 'ConnectDID'>;

enum ConnectionType {
  QR = 'QR',
  MANUAL = 'MANUAL',
  APP = 'APP',
}

const ConnectDIDScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<ConnectDIDScreenNavigationProp>();
  const { connect, did, generateConnectionCode } = useDID();

  const [connectionType, setConnectionType] = useState<ConnectionType>(ConnectionType.QR);
  const [connectionCode, setConnectionCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  const currentStyles = styles(theme);

  useEffect(() => {
    generateConnectionCodeForQR();
  }, []);

  const generateConnectionCodeForQR = async () => {
    if (!did) {
      Alert.alert(t('did.error'), t('did.noDIDForConnection'));
      navigation.navigate('DID');
      return;
    }

    setLoading(true);
    try {
      const code = await generateConnectionCode();
      setConnectionCode(code);
    } catch (error) {
      console.error('Error generating connection code:', error);
      Alert.alert(t('did.error'), t('did.connectionCodeError'));
    } finally {
      setLoading(false);
    }
  };

  const handleManualConnect = async () => {
    if (!manualCode.trim()) {
      Alert.alert(t('did.error'), t('did.enterConnectionCode'));
      return;
    }

    setConnecting(true);
    try {
      await connect(manualCode.trim());
      setConnectionSuccess(true);
      // Auto navigate back after success
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error('Error connecting DID:', error);
      Alert.alert(t('did.error'), t('did.connectionError'));
    } finally {
      setConnecting(false);
    }
  };

  const openCreLinkApp = () => {
    const url = `crelink://connect?code=${connectionCode}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          t('did.appNotInstalled'),
          t('did.appNotInstalledDesc'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('did.installApp'),
              onPress: () => Linking.openURL('https://crelink.io/download'),
            },
          ]
        );
      }
    });
  };

  const renderQRContent = () => (
    <View style={currentStyles.qrContent}>
      <Text style={currentStyles.qrTitle}>{t('did.scanQRToConnect')}</Text>
      <Text style={currentStyles.qrDescription}>{t('did.scanQRDescription')}</Text>

      <View style={currentStyles.qrContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <QRCode
            value={connectionCode}
            size={200}
            color={theme === 'dark' ? colors.white : colors.black}
            backgroundColor={theme === 'dark' ? colors.darkCard : colors.white}
          />
        )}
      </View>

      <View style={currentStyles.connectionCodeContainer}>
        <Text style={currentStyles.connectionCodeLabel}>{t('did.connectionCode')}</Text>
        <Text style={currentStyles.connectionCode} selectable={true}>
          {connectionCode}
        </Text>
      </View>

      <View style={currentStyles.actionsContainer}>
        <TouchableOpacity style={currentStyles.refreshButton} onPress={generateConnectionCodeForQR}>
          <Icon name="refresh" size={20} color={colors.primary} />
          <Text style={currentStyles.refreshButtonText}>{t('did.refreshCode')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={currentStyles.openAppButton} onPress={openCreLinkApp}>
          <Icon name="open" size={20} color={colors.white} />
          <Text style={currentStyles.openAppButtonText}>{t('did.openApp')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderManualContent = () => (
    <View style={currentStyles.manualContent}>
      <Text style={currentStyles.manualTitle}>{t('did.enterConnectionCode')}</Text>
      <Text style={currentStyles.manualDescription}>{t('did.enterConnectionCodeDesc')}</Text>

      <View style={currentStyles.inputGroup}>
        <TextInput
          style={currentStyles.input}
          placeholder={t('did.connectionCodePlaceholder')}
          placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
          value={manualCode}
          onChangeText={setManualCode}
          autoCapitalize="none"
          multiline
        />
      </View>

      <TouchableOpacity
        style={[currentStyles.connectButton, connecting ? currentStyles.disabledButton : null]}
        onPress={handleManualConnect}
        disabled={connecting || connectionSuccess}
      >
        {connecting ? (
          <ActivityIndicator color={colors.white} />
        ) : connectionSuccess ? (
          <View style={currentStyles.successContainer}>
            <Icon name="checkmark-circle" size={20} color={colors.white} />
            <Text style={currentStyles.connectButtonText}>{t('did.connected')}</Text>
          </View>
        ) : (
          <Text style={currentStyles.connectButtonText}>{t('did.connect')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAppContent = () => (
    <View style={currentStyles.appContent}>
      <Text style={currentStyles.appTitle}>{t('did.connectWithApp')}</Text>
      <Text style={currentStyles.appDescription}>{t('did.connectWithAppDesc')}</Text>

      <View style={currentStyles.appButtonContainer}>
        <TouchableOpacity style={currentStyles.appButton} onPress={openCreLinkApp}>
          <Icon name="phone-portrait" size={64} color={theme === 'dark' ? colors.white : colors.black} />
          <Text style={currentStyles.appButtonText}>{t('did.openApp')}</Text>
        </TouchableOpacity>
      </View>

      <View style={currentStyles.infoCard}>
        <Icon name="information-circle-outline" size={24} color={theme === 'dark' ? colors.lightGray : colors.gray} />
        <Text style={currentStyles.infoText}>
          {t('did.appConnectionNote')}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={currentStyles.container}>
      <View style={currentStyles.header}>
        <TouchableOpacity style={currentStyles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme === 'dark' ? colors.white : colors.black} />
        </TouchableOpacity>
        <Text style={currentStyles.title}>{t('did.connectDID')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={currentStyles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={currentStyles.tabs}>
          <TouchableOpacity
            style={[currentStyles.tab, connectionType === ConnectionType.QR ? currentStyles.activeTab : null]}
            onPress={() => setConnectionType(ConnectionType.QR)}
          >
            <Icon
              name="qr-code"
              size={20}
              color={connectionType === ConnectionType.QR ? colors.white : (theme === 'dark' ? colors.lightGray : colors.gray)}
            />
            <Text
              style={[
                currentStyles.tabText,
                connectionType === ConnectionType.QR ? currentStyles.activeTabText : null,
              ]}
            >
              {t('did.qrCode')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[currentStyles.tab, connectionType === ConnectionType.MANUAL ? currentStyles.activeTab : null]}
            onPress={() => setConnectionType(ConnectionType.MANUAL)}
          >
            <Icon
              name="code-working"
              size={20}
              color={connectionType === ConnectionType.MANUAL ? colors.white : (theme === 'dark' ? colors.lightGray : colors.gray)}
            />
            <Text
              style={[
                currentStyles.tabText,
                connectionType === ConnectionType.MANUAL ? currentStyles.activeTabText : null,
              ]}
            >
              {t('did.manualCode')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[currentStyles.tab, connectionType === ConnectionType.APP ? currentStyles.activeTab : null]}
            onPress={() => setConnectionType(ConnectionType.APP)}
          >
            <Icon
              name="phone-portrait"
              size={20}
              color={connectionType === ConnectionType.APP ? colors.white : (theme === 'dark' ? colors.lightGray : colors.gray)}
            />
            <Text
              style={[
                currentStyles.tabText,
                connectionType === ConnectionType.APP ? currentStyles.activeTabText : null,
              ]}
            >
              {t('did.app')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={currentStyles.content} contentContainerStyle={currentStyles.contentContainer}>
          {connectionType === ConnectionType.QR && renderQRContent()}
          {connectionType === ConnectionType.MANUAL && renderManualContent()}
          {connectionType === ConnectionType.APP && renderAppContent()}
        </ScrollView>
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
  keyboardContainer: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? colors.lightGray : colors.gray,
  },
  activeTabText: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  // QR Content
  qrContent: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 8,
  },
  qrDescription: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    width: 240,
    height: 240,
    padding: 20,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 24,
  },
  connectionCodeContainer: {
    width: '100%',
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  connectionCodeLabel: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 8,
  },
  connectionCode: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: theme === 'dark' ? colors.white : colors.black,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  openAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  openAppButtonText: {
    color: colors.white,
    marginLeft: 4,
    fontWeight: '500',
  },
  // Manual Content
  manualContent: {},
  manualTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 8,
  },
  manualDescription: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme === 'dark' ? colors.white : colors.black,
    height: 120,
    textAlignVertical: 'top',
  },
  connectButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  connectButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 16,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // App Content
  appContent: {},
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? colors.white : colors.black,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: theme === 'dark' ? colors.lightGray : colors.gray,
    marginBottom: 24,
  },
  appButtonContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appButton: {
    width: 160,
    height: 160,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  appButtonText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: theme === 'dark' ? colors.white : colors.black,
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

export default ConnectDIDScreen;
