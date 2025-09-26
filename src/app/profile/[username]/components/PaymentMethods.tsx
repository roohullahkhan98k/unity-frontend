"use client";
import { useState } from "react";
import { CreditCard, PlusCircle, MinusCircle } from "lucide-react";
import * as Dialog from '@radix-ui/react-dialog';

type PaymentMethod = {
  id: number;
  type: string;
  last4: string;
  exp: string;
};

type Props = {
  initialPaymentMethods: PaymentMethod[];
};

export default function PaymentMethods({ initialPaymentMethods }: Props) {
  const [open, setOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between h-full">
        <div>
          <div className="text-sm text-gray-500 mb-1">Account Balance</div>
          <div className="text-2xl font-bold text-indigo-600 mb-1">2.45 ETH</div>
          <div className="text-xs text-gray-400">(Ethereum Mainnet)</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500 font-semibold">Payment Methods</div>
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                  <PlusCircle className="w-4 h-4" /> Add
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                  <Dialog.Title className="text-lg font-bold mb-4">Add Payment Method</Dialog.Title>
                  <form className="flex flex-col gap-4">
                    <input className="border rounded px-3 py-2" placeholder="Card Number" />
                    <div className="flex gap-2">
                      <input className="border rounded px-3 py-2 w-1/2" placeholder="MM/YY" />
                      <input className="border rounded px-3 py-2 w-1/2" placeholder="CVC" />
                    </div>
                    <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">Add Card</button>
                  </form>
                  <Dialog.Close asChild>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">✕</button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
          <ul className="space-y-1">
            {paymentMethods.map(pm => (
              <li key={pm.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                <button
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  onClick={() => setPaymentMethods(paymentMethods.filter(m => m.id !== pm.id))}
                  aria-label="Remove payment method"
                  tabIndex={0}
                >
                  <MinusCircle className="w-4 h-4" />
                </button>
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span className="font-medium text-sm">{pm.type} **** {pm.last4}</span>
                <span className="ml-auto text-xs text-gray-500">Exp {pm.exp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 