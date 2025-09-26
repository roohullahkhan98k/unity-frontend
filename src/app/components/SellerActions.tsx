'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { 
  sellToHighestBidder
} from '../../store/bidsSlice';
import useAuthToken from '../hooks/useAuthToken';
import { useToast } from '../hooks/useToast';
import { 
  Crown
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface SellerActionsProps {
  postId: string;
  currentPrice: number;
}

export default function SellerActions({ postId, currentPrice }: SellerActionsProps) {
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellAction, setSellAction] = useState<'highest' | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const token = useAuthToken();
  const showToast = useToast();
  
  const { loading, error } = useSelector((state: RootState) => state.bids);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  const handleSellToHighest = () => {
    setSellAction('highest');
    setShowSellModal(true);
  };

  const confirmSell = async () => {
    try {
      if (sellAction === 'highest') {
        await dispatch(sellToHighestBidder({ postId, token }));
        showToast('Auction sold to highest bidder successfully!', 'success');
      }
      setShowSellModal(false);
      setSellAction(null);
    } catch {
      showToast('Failed to sell auction', 'error');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-600" />
        Seller Actions
      </h3>

             <div className="space-y-4">
         {/* Sell to Highest Bidder */}
         <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
           <div className="flex items-center justify-between">
             <div>
               <h4 className="font-semibold text-green-800">Sell to Highest Bidder</h4>
               <p className="text-sm text-green-600">Automatically sell to the highest bidder</p>
             </div>
             <button
               onClick={handleSellToHighest}
               disabled={loading}
               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
             >
               {loading ? 'Processing...' : 'Sell Now'}
             </button>
           </div>
         </div>
       </div>

             {/* Confirmation Modal */}
       <ConfirmationModal
         open={showSellModal}
         onOpenChange={setShowSellModal}
         title="Sell to Highest Bidder"
         message={`Are you sure you want to sell this auction to the highest bidder for $${currentPrice.toFixed(2)}? This action cannot be undone.`}
         confirmText="Yes, Sell Now"
         cancelText="Cancel"
         type="warning"
         onConfirm={confirmSell}
       />
    </div>
  );
} 