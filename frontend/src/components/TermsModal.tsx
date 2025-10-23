import React from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {type === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {type === 'terms' ? (
            <div>
              <p className="mb-2">By using HotelEase, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate information during registration</li>
                <li>Use the platform for legitimate hotel bookings only</li>
                <li>Respect other users and hotel properties</li>
                <li>Pay for confirmed bookings as agreed</li>
              </ul>
            </div>
          ) : (
            <div>
              <p className="mb-2">We protect your privacy by:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Encrypting all personal data</li>
                <li>Not sharing information with third parties</li>
                <li>Securing payment information</li>
                <li>Allowing data deletion upon request</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsModal;