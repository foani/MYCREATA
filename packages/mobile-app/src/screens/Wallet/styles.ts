import { StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

export const createStyles = (theme: 'light' | 'dark') => {
  return {
    wallet: StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme === 'dark' ? colors.darkBackground : colors.lightBackground,
      },
      contentContainer: {
        padding: 16,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      balanceCard: {
        padding: 16,
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      balanceLabel: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginBottom: 4,
      },
      balanceValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      accountInfo: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginTop: 8,
      },
      actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
      },
      actionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: colors.primary,
        borderRadius: 8,
        marginHorizontal: 4,
      },
      actionButtonText: {
        color: colors.white,
        fontWeight: '500',
        marginTop: 4,
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
        marginTop: 16,
        marginBottom: 8,
      },
      tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightGray,
      },
      tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
      },
      activeTab: {
        backgroundColor: theme === 'dark' ? colors.primary : colors.primary,
      },
      tabText: {
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        fontWeight: '500',
      },
      activeTabText: {
        color: colors.white,
        fontWeight: 'bold',
      },
      emptyState: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderRadius: 12,
        marginBottom: 16,
      },
      emptyStateText: {
        fontSize: 16,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        textAlign: 'center',
        marginBottom: 16,
      },
      button: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
      },
      buttonText: {
        color: colors.white,
        fontWeight: '500',
        fontSize: 16,
      },
    }),
    
    nftGallery: StyleSheet.create({
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
      filterButton: {
        padding: 8,
      },
      content: {
        padding: 16,
      },
      collectionFilter: {
        marginBottom: 16,
      },
      collectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
        marginBottom: 8,
      },
      collectionScroll: {
        flexDirection: 'row',
      },
      collectionItem: {
        padding: 8,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightGray,
      },
      activeCollectionItem: {
        backgroundColor: colors.primary,
      },
      collectionText: {
        color: theme === 'dark' ? colors.lightGray : colors.gray,
      },
      activeCollectionText: {
        color: colors.white,
        fontWeight: 'bold',
      },
      emptyState: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderRadius: 12,
        marginVertical: 16,
      },
      emptyStateText: {
        fontSize: 16,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        textAlign: 'center',
        marginBottom: 16,
      },
    }),

    assetDetail: StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme === 'dark' ? colors.darkBackground : colors.lightBackground,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
      },
      backButton: {
        padding: 8,
        marginRight: 8,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      content: {
        padding: 16,
      },
      card: {
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
      assetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
      },
      assetIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
      },
      assetName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      assetSymbol: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
      },
      balanceRow: {
        marginBottom: 8,
      },
      balanceLabel: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginBottom: 4,
      },
      balanceValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      balanceUsd: {
        fontSize: 16,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
      },
      sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
        marginTop: 16,
        marginBottom: 8,
      },
      infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      },
      infoLabel: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
      },
      infoValue: {
        fontSize: 14,
        color: theme === 'dark' ? colors.white : colors.black,
        fontWeight: '500',
      },
      actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
      },
      actionButton: {
        flex: 1,
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
      },
      actionButtonText: {
        color: colors.white,
        fontWeight: '500',
      },
    }),
  };
};
