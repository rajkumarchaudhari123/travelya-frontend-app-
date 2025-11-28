// services/otpService.js
import { sendOTP, verifyOTP } from '@/firebase/config';

class OTPService {
  constructor() {
    this.confirmationResult = null;
  }

  // OTP bhejne ka function
  async sendOTPToCustomer(phoneNumber, bookingId) {
    try {
      console.log('🚀 Sending OTP for booking:', bookingId);
      
      const result = await sendOTP(phoneNumber);
      
      if (result.success) {
        this.confirmationResult = result.confirmationResult;
        
        // Store in async storage for persistence
        await AsyncStorage.setItem('otp_session', JSON.stringify({
          phoneNumber,
          bookingId,
          timestamp: Date.now()
        }));
        
        return {
          success: true,
          message: 'OTP sent successfully'
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('OTP service error:', error);
      return {
        success: false,
        message: 'Failed to send OTP'
      };
    }
  }

  // OTP verify karne ka function
  async verifyCustomerOTP(otp, bookingId) {
    try {
      if (!this.confirmationResult) {
        // Try to get from storage
        const storedSession = await AsyncStorage.getItem('otp_session');
        if (!storedSession) {
          return {
            success: false,
            message: 'OTP session expired. Please resend OTP.'
          };
        }
        
        // Agar confirmationResult nahi hai to error
        return {
          success: false,
          message: 'OTP session expired. Please resend OTP.'
        };
      }

      const result = await verifyOTP(this.confirmationResult, otp);
      
      if (result.success) {
        // Clear storage after successful verification
        await AsyncStorage.removeItem('otp_session');
        
        // Update booking status in your backend
        await this.updateBookingStatus(bookingId, 'otp_verified');
        
        return {
          success: true,
          message: 'OTP verified successfully'
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'OTP verification failed'
      };
    }
  }

  // Booking status update
  async updateBookingStatus(bookingId, status) {
    try {
      // Yahan aapki API call hogi
      const response = await fetch(`https://your-api.com/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          otpVerified: true,
          verifiedAt: new Date().toISOString()
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  }

  // Resend OTP
  async resendOTP() {
    try {
      const storedSession = await AsyncStorage.getItem('otp_session');
      if (storedSession) {
        const { phoneNumber, bookingId } = JSON.parse(storedSession);
        return await this.sendOTPToCustomer(phoneNumber, bookingId);
      }
      return {
        success: false,
        message: 'No active OTP session'
      };
    } catch (error) {
      console.error('Resend OTP error:', error);
      return {
        success: false,
        message: 'Failed to resend OTP'
      };
    }
  }
}

export default new OTPService();