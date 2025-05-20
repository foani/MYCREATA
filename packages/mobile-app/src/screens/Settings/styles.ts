import { StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

export const createStyles = (theme: 'light' | 'dark') => {
  return {
    settings: StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme === 'dark' ? colors.darkBackground : colors.lightBackground,
      },
      header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      content: {
        flex: 1,
      },
      section: {
        marginBottom: 24,
      },
      sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        paddingHorizontal: 16,
        marginBottom: 8,
      },
      settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      },
      settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      settingText: {
        fontSize: 16,
        color: theme === 'dark' ? colors.white : colors.black,
        marginLeft: 12,
      },
      valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      valueText: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginRight: 4,
      },
      versionContainer: {
        padding: 16,
        alignItems: 'center',
      },
      versionText: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
      },
      logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginBottom: 32,
        paddingVertical: 16,
        backgroundColor: theme === 'dark' ? 'rgba(255,59,48,0.1)' : 'rgba(255,59,48,0.05)',
        borderRadius: 8,
      },
      logoutButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.error,
        marginLeft: 8,
      },
    }),

    securitySettings: StyleSheet.create({
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
      section: {
        marginBottom: 24,
      },
      sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        paddingHorizontal: 16,
        marginBottom: 8,
      },
      settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      },
      settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      settingTextContainer: {
        flex: 1,
        marginLeft: 12,
      },
      settingText: {
        fontSize: 16,
        color: theme === 'dark' ? colors.white : colors.black,
        marginLeft: 12,
      },
      settingDescription: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginTop: 2,
      },
      valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      valueText: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginRight: 4,
      },
      securityTipsContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: theme === 'dark' ? 'rgba(255,204,0,0.1)' : 'rgba(255,204,0,0.05)',
        borderRadius: 12,
        marginBottom: 32,
      },
      securityTipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
      },
      securityTipTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
        marginLeft: 8,
      },
      securityTip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
      },
      tipIcon: {
        marginTop: 2,
        marginRight: 8,
      },
      securityTipText: {
        flex: 1,
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        lineHeight: 20,
      },
    }),

    languageSettings: StyleSheet.create({
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
      languageList: {
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 16,
        overflow: 'hidden',
      },
      languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      },
      languageInfo: {
        flex: 1,
      },
      languageName: {
        fontSize: 16,
        fontWeight: '500',
        color: theme === 'dark' ? colors.white : colors.black,
        marginBottom: 2,
      },
      languageNameTranslated: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
      },
      infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        margin: 16,
      },
      infoText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        lineHeight: 20,
      },
    }),

    networkSettings: StyleSheet.create({
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
      searchContainer: {
        margin: 16,
        flexDirection: 'row',
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 12,
      },
      searchIcon: {
        marginRight: 8,
      },
      searchInput: {
        flex: 1,
        height: 40,
        color: theme === 'dark' ? colors.white : colors.black,
      },
      clearButton: {
        padding: 4,
      },
      section: {
        marginBottom: 24,
      },
      sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        paddingHorizontal: 16,
        marginBottom: 8,
      },
      networkList: {
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderRadius: 8,
        marginHorizontal: 16,
        overflow: 'hidden',
      },
      networkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      },
      networkIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      },
      networkIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
      },
      networkInfo: {
        flex: 1,
      },
      networkName: {
        fontSize: 16,
        fontWeight: '500',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      networkDetails: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
      },
      activeNetworkBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: colors.success,
        borderRadius: 4,
      },
      activeNetworkText: {
        fontSize: 12,
        color: colors.white,
        fontWeight: '500',
      },
      addNetworkButton: {
        margin: 16,
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
      },
      addNetworkButtonText: {
        color: colors.white,
        fontWeight: '500',
        fontSize: 16,
      },
    }),

    aboutScreen: StyleSheet.create({
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
        padding: 16,
      },
      logoContainer: {
        alignItems: 'center',
        marginVertical: 24,
      },
      logo: {
        width: 120,
        height: 120,
        marginBottom: 16,
      },
      appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
        marginBottom: 8,
      },
      version: {
        fontSize: 16,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
      },
      description: {
        fontSize: 16,
        lineHeight: 24,
        color: theme === 'dark' ? colors.white : colors.black,
        textAlign: 'center',
        marginBottom: 24,
      },
      section: {
        marginBottom: 24,
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
        marginBottom: 12,
      },
      linkContainer: {
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
      },
      linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      },
      linkIcon: {
        marginRight: 12,
      },
      linkText: {
        flex: 1,
        fontSize: 16,
        color: theme === 'dark' ? colors.white : colors.black,
      },
      creditsText: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        textAlign: 'center',
        marginBottom: 16,
      },
    }),
  };
};
