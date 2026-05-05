import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, AlertCircle } from 'lucide-react';

function PaymentFailure() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorDetails, setErrorDetails] = useState({});
  const [planInfo, setPlanInfo] = useState(null);

  useEffect(() => {
    // Extract error details from URL parameters
    const params = new URLSearchParams(location.search);
    const details = Object.fromEntries(params.entries());

    console.log('[PaymentFailure] PayU error response:', details);

    // Get pending payment info from session storage
    const pendingPayment = sessionStorage.getItem('pendingPayment');
    if (pendingPayment) {
      try {
        const parsed = JSON.parse(pendingPayment);
        setPlanInfo(parsed);
        console.log('[PaymentFailure] Pending payment info:', parsed);
      } catch (e) {
        console.warn('[PaymentFailure] Failed to parse pending payment:', e);
      }
    }

    // Clear pending payment from session storage on failure
    sessionStorage.removeItem('pendingPayment');

    setErrorDetails({
      reason: details.error_Message || details.field9 || details.error || 'Payment was declined by your bank',
      txnId: details.txnid || details.payuMoneyId || 'N/A',
      amount: details.amount || planInfo?.amount || 'N/A',
      status: details.status || 'failed',
      mode: details.mode || 'N/A'
    });
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Unfortunately, your payment could not be processed
          </p>

          {/* Error Details Box */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5 mb-6 text-left">
            <div className="flex gap-2 items-start mb-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-black text-red-900 text-sm">Reason</p>
                <p className="text-red-700 text-sm">{errorDetails.reason}</p>
              </div>
            </div>
            
            {errorDetails.txnId !== 'N/A' && (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-600">Transaction ID: </span>
                  <code className="font-mono bg-white px-2 py-1 rounded text-gray-900">{errorDetails.txnId}</code>
                </div>
                {(errorDetails.amount !== 'N/A' || planInfo?.amount) && (
                  <div>
                    <span className="text-gray-600">Amount: </span>
                    <span className="font-bold text-gray-900">₹{errorDetails.amount || planInfo?.amount}</span>
                  </div>
                )}
                {planInfo?.planName && (
                  <div>
                    <span className="text-gray-600">Plan: </span>
                    <span className="font-bold text-gray-900">{planInfo.planName}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Troubleshooting Tips */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <p className="font-black text-blue-900 text-sm mb-3">Common reasons:</p>
            <ul className="text-xs text-blue-900 space-y-2">
              <li>• Insufficient funds in your account</li>
              <li>• Card details were entered incorrectly</li>
              <li>• Transaction limit exceeded</li>
              <li>• Payment gateway temporary issue</li>
              <li>• Card blocked by your bank</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/checkout', { replace: true })}
              className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white font-black rounded-lg transition-colors"
            >
              Try Payment Again
            </button>
            <button
              onClick={() => navigate('/subscription', { replace: true })}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-black rounded-lg transition-colors"
            >
              Choose Different Plan
            </button>
            <button
              onClick={() => navigate('/dashboard', { replace: true })}
              className="w-full px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-xs text-gray-500">
            <p className="mb-2">Still having issues?</p>
            <a 
              href="mailto:support@revo.homes" 
              className="text-primary font-bold hover:underline"
            >
              Contact Our Support Team
            </a>
            <p className="mt-3 text-gray-400">
              We're here to help 24/7 via email or in-app chat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailure;
