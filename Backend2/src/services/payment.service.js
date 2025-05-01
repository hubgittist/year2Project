const Mpesa = require('mpesa-api').Mpesa;
const africastalking = require('africastalking');

class PaymentService {
  constructor() {
    this.mpesa = new Mpesa({
      consumerKey: process.env.MPESA_CONSUMER_KEY,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      shortCode: process.env.MPESA_SHORTCODE,
      initiatorPassword: process.env.MPESA_INITIATOR_PASSWORD,
      securityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      certificatePath: null
    });

    this.at = africastalking({
      apiKey: process.env.AFRICASTALKING_API_KEY,
      username: process.env.AAFRICASTALKING_USERNAME
    });
  }

  async initiateMpesaPayment(phoneNumber, amount, accountReference) {
    try {
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const response = await this.mpesa.lipaNaMpesaOnline({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64'),
        Timestamp: timestamp,
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.BASE_URL}/api/payments/mpesa/callback`,
        AccountReference: accountReference,
        TransactionDesc: 'SACCO Payment'
      });

      return {
        success: true,
        checkoutRequestId: response.CheckoutRequestID,
        merchantRequestId: response.MerchantRequestID
      };
    } catch (error) {
      throw new Error(`M-Pesa payment initiation failed: ${error.message}`);
    }
  }

//   async processBankTransfer(bankCode, accountNumber, amount, reference) {
//     // This is a placeholder for bank transfer processing
//     // In production, this would integrate with specific bank APIs
//     try {
//       const bankApis = {
//         'cooperative': this.processCooperativeTransfer,
//         'equity': this.processEquityTransfer,
//         'kcb': this.processKCBTransfer
//       };

//       if (!bankApis[bankCode]) {
//         throw new Error('Unsupported bank');
//       }

//       return await bankApis[bankCode](accountNumber, amount, reference);
//     } catch (error) {
//       throw new Error(`Bank transfer failed: ${error.message}`);
//     }
//   }

//   async processCooperativeTransfer(accountNumber, amount, reference) {
//     // Implement Cooperative Bank API integration
//     throw new Error('Cooperative Bank integration not implemented');
//   }

//   async processEquityTransfer(accountNumber, amount, reference) {
//     // Implement Equity Bank API integration
//     throw new Error('Equity Bank integration not implemented');
//   }

//   async processKCBTransfer(accountNumber, amount, reference) {
//     // Implement KCB Bank API integration
//     throw new Error('KCB Bank integration not implemented');
//   }

  async sendPaymentNotification(phoneNumber, message) {
    try {
      const result = await this.at.SMS.send({
        to: phoneNumber,
        message: message
      });

      return {
        success: true,
        messageId: result.SMSMessageData.Recipients[0].messageId
      };
    } catch (error) {
      throw new Error(`SMS notification failed: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
