import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

export const createStyles = (theme: 'light' | 'dark') => {
  return {
    send: StyleSheet.create({
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
      backButton: {
        padding: 8,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      scrollView: {
        flex: 1,
      },
      content: {
        padding: 16,
      },
      card: {
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      label: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginBottom: 8,
      },
      inputContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        marginBottom: 16,
      },
      input: {
        padding: 12,
        fontSize: 16,
        color: theme === 'dark' ? colors.white : colors.black,
      },
      errorInput: {
        borderColor: colors.error,
      },
      errorText: {
        color: colors.error,
        fontSize: 12,
        marginTop: -12,
        marginBottom: 16,
      },
      button: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
      },
      buttonDisabled: {
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      },
      buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      addressInput: {
        flex: 1,
      },
      scanButton: {
        padding: 12,
        backgroundColor: colors.primary,
        borderRadius: 8,
        marginLeft: 8,
      },
      assetSelector: {
        marginBottom: 16,
      },
      selectedAsset: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        padding: 12,
      },
      assetInfo: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      assetIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
      },
      assetName: {
        fontSize: 16,
        fontWeight: '500',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      assetSymbol: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginLeft: 8,
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
      percentButtons: {
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
      footer: {
        padding: 16,
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderTopWidth: 1,
        borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      },
    }),

    receive: StyleSheet.create({
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
        marginBottom: 8,
      },
      qrContainer: {
        padding: 16,
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderRadius: 8,
        marginVertical: 24,
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
        marginBottom: 16,
      },
      addressActions: {
        flexDirection: 'row',
        justifyContent: 'center',
      },
      actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        marginHorizontal: 8,
      },
      actionButtonText: {
        color: colors.primary,
        marginLeft: 4,
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
        paddingRight: 16,
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
      },
      selectedAssetItemText: {
        color: colors.white,
      },
      infoCard: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        alignItems: 'flex-start',
      },
      infoText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        lineHeight: 20,
      },
    }),

    transactionHistory: StyleSheet.create({
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
      backButton: {
        padding: 8,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      filterButton: {
        padding: 8,
      },
      filterTabs: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        padding: 4,
      },
      filterTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
      },
      activeFilterTab: {
        backgroundColor: colors.primary,
      },
      filterTabText: {
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        fontWeight: '500',
      },
      activeFilterTabText: {
        color: colors.white,
      },
      dateHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      },
      dateText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme === 'dark' ? colors.lightGray : colors.gray,
      },
      transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        marginBottom: 1,
      },
      txIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      },
      txInfo: {
        flex: 1,
      },
      txType: {
        fontSize: 16,
        fontWeight: '500',
        color: theme === 'dark' ? colors.white : colors.black,
        marginBottom: 2,
      },
      txAddress: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginBottom: 2,
      },
      txTime: {
        fontSize: 12,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
      },
      txAmount: {
        alignItems: 'flex-end',
      },
      txAmountText: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
      },
      txAmountFiat: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginBottom: 4,
      },
      txStatus: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
      },
      txStatusConfirmed: {
        backgroundColor: 'rgba(75,181,67,0.2)',
      },
      txStatusPending: {
        backgroundColor: 'rgba(255,184,0,0.2)',
      },
      txStatusFailed: {
        backgroundColor: 'rgba(239,68,68,0.2)',
      },
      txStatusText: {
        fontSize: 12,
        fontWeight: '500',
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      },
      emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
        marginTop: 16,
        marginBottom: 8,
      },
      emptyText: {
        fontSize: 14,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        textAlign: 'center',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),

    transactionDetail: StyleSheet.create({
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
      backButton: {
        padding: 8,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      shareButton: {
        padding: 8,
      },
      content: {
        flex: 1,
        padding: 16,
      },
      summaryCard: {
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      },
      txType: {
        fontSize: 16,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginBottom: 8,
      },
      amount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
      },
      fiatAmount: {
        fontSize: 16,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        marginTop: 4,
        marginBottom: 16,
      },
      statusContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
      },
      statusText: {
        fontSize: 14,
        fontWeight: '500',
      },
      detailsCard: {
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
      sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme === 'dark' ? colors.white : colors.black,
        marginBottom: 16,
      },
      detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
      addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      hashContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        borderRadius: 8,
      },
      hash: {
        flex: 1,
        fontSize: 14,
        color: theme === 'dark' ? colors.white : colors.black,
        marginRight: 8,
      },
      viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 32,
      },
      viewButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      notFoundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      },
      notFoundText: {
        fontSize: 16,
        color: theme === 'dark' ? colors.lightGray : colors.gray,
        textAlign: 'center',
        marginVertical: 16,
      },
      refreshButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: colors.primary,
        borderRadius: 8,
      },
      refreshButtonText: {
        color: colors.white,
        fontWeight: '500',
      },
    }),

    transactionConfirmation: StyleSheet.create({
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    }),
  };
};
