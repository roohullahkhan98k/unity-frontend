"use client";
import { useState } from "react";
import * as Dialog from '@radix-ui/react-dialog';
import { RotateCcw, Clock } from 'lucide-react';

interface ReactivateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (auctionDuration: number) => void;
  postTitle: string;
}

export default function ReactivateModal({
  open,
  onOpenChange,
  onConfirm,
  postTitle
}: ReactivateModalProps) {
  const [auctionDuration, setAuctionDuration] = useState("24");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(parseInt(auctionDuration));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md z-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-green-100">
              <RotateCcw className="w-6 h-6 text-green-500" />
            </div>
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Reactivate Auction
            </Dialog.Title>
          </div>
          
          <Dialog.Description className="text-gray-600 mb-4">
            Reactivate &quot;{postTitle}&quot; with a new auction duration. The auction will start fresh from now.
          </Dialog.Description>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auction Duration
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={auctionDuration}
                onChange={(e) => setAuctionDuration(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="1">1 hour</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The auction will end {auctionDuration} hour{parseInt(auctionDuration) > 1 ? 's' : ''} from now
            </p>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Reactivating...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Reactivate
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 