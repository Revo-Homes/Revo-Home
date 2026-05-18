import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { billingApi } from '../services/billingApi';

function withQuery(path, params = {}) {
  if (!path) return '/dashboard/settings';
  const url = new URL(path, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return `${url.pathname}${url.search}${url.hash}`;
}

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing your payment...');
  const [countdown, setCountdown] = useState(5);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [redirectTarget, setRedirectTarget] = useState('/dashboard/settings');

  useEffect(() => {
    const verifyPayment = async () => {
      let payuResponse = {};
      let parsedPending = null;
      try {
        // Get all form data from PayU response
        const formData = new URLSearchParams(location.search);
        payuResponse = Object.fromEntries(formData.entries());

        console.log('[PaymentSuccess] PayU response:', payuResponse);

        // Get pending payment info from session storage
        const pendingPayment = sessionStorage.getItem('pendingPayment');
        if (pendingPayment) {
          try {
            parsedPending = JSON.parse(pendingPayment);
            setPlanInfo(parsedPending);
            console.log('[PaymentSuccess] Pending payment info:', parsedPending);
          } catch (e) {
            console.warn('[PaymentSuccess] Failed to parse pending payment:', e);
          }
        }

        const nextRedirect = parsedPending?.checkoutMode === 'listing_documents' && parsedPending?.returnTo
          ? withQuery(parsedPending.returnTo, { documentPaid: '1', downloadDocuments: '1' })
          : parsedPending?.returnTo || '/dashboard/settings';
        setRedirectTarget(nextRedirect);

        if (!payuResponse || Object.keys(payuResponse).length === 0) {
          setStatus('success');
          setMessage('Payment completed successfully! Redirecting to dashboard...');
          return;
        }

        // Store transaction details for display
        setTransactionDetails({
          txnId: payuResponse.txnid || payuResponse.payuMoneyId || 'N/A',
          amount: payuResponse.amount,
          status: payuResponse.status,
          product: payuResponse.productinfo
        });

        if (payuResponse.server_verified !== '1') {
          console.log('[PaymentSuccess] Verifying payment with backend...');
          const result = await billingApi.verifyPayU(payuResponse);
          console.log('[PaymentSuccess] Verification result:', result);
        } else {
          console.log('[PaymentSuccess] Payment already verified by backend callback.');
        }

        // Clear pending payment from session storage
        sessionStorage.removeItem('pendingPayment');

        setStatus('success');
        setMessage('Payment verified successfully! Redirecting to your dashboard...');
        
        // Emit payment success event for other components to listen
        window.dispatchEvent(new CustomEvent('paymentSuccess', {
          detail: {
            status: 'success',
            txnId: payuResponse.txnid,
            amount: payuResponse.amount,
            planName: parsedPending?.planName
          }
        }));
      } catch (error) {
        console.error('[PaymentSuccess] Payment verification error:', error);
        // Check if it's a deadlock or already-processed error - payment might have succeeded
        const errorMsg = error.message || '';
        if (errorMsg.includes('Deadlock') || errorMsg.includes('already') || errorMsg.includes('processed') || errorMsg.includes('Duplicate entry')) {
          console.log('[PaymentSuccess] Payment may have already been processed, treating as success');
          setStatus('success');
          setMessage('Payment processed successfully! Redirecting to your dashboard...');
          
          // Emit payment success event even for duplicate/deadlock cases
          window.dispatchEvent(new CustomEvent('paymentSuccess', {
            detail: {
              status: 'success',
              txnId: payuResponse.txnid,
              amount: payuResponse.amount,
              planName: parsedPending?.planName
            }
          }));
        } else {
          setStatus('error');
          setMessage(error.message || 'Payment verification failed. Please contact support.');
        }
      }
    };

    verifyPayment();
  }, [location]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            navigate(redirectTarget, { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate, redirectTarget]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            {status === 'processing' ? (
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-3xl">❌</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            {status === 'processing' ? 'Processing Payment' : status === 'success' ? 'Payment Successful' : 'Payment Failed'}
          </h1>

          {/* Message */}
          <p className={`text-base mb-6 ${
            status === 'success' ? 'text-gray-600' : status === 'processing' ? 'text-gray-600' : 'text-red-600'
          }`}>
            {message}
          </p>

          {/* Countdown (only for success) */}
          {status === 'success' && (
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Redirecting in <span className="font-black text-green-600">{countdown}</span> seconds...
              </p>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-1000" 
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {status === 'error' && (
              <>
                <button
                  onClick={() => navigate(redirectTarget, { replace: true })}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-black rounded-lg transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/subscription', { replace: true })}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-black rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
            {status === 'success' && (
              <button
                onClick={() => navigate(redirectTarget, { replace: true })}
                className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-black rounded-lg transition-colors"
              >
                Go to Dashboard Now
              </button>
            )}
          </div>

          {/* Transaction Details */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-xs text-gray-500">
            {transactionDetails && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-left">
                <p className="font-bold text-gray-700 mb-2">Transaction Details:</p>
                <div className="space-y-1">
                  <p><span className="text-gray-600">Transaction ID:</span> <code className="font-mono text-gray-900">{transactionDetails.txnId}</code></p>
                  {transactionDetails.amount && (
                    <p><span className="text-gray-600">Amount:</span> <span className="font-medium text-gray-900">₹{transactionDetails.amount}</span></p>
                  )}
                  {planInfo?.planName && (
                    <p><span className="text-gray-600">Plan:</span> <span className="font-medium text-gray-900">{planInfo.planName}</span></p>
                  )}
                </div>
              </div>
            )}
            <p className="mt-2">Need help? <a href="mailto:support@revo.homes" className="text-primary font-bold hover:underline">Contact Support</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
