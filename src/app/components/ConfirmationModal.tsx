"use client";
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger"
}: ConfirmationModalProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-500" />,
          confirmButton: "bg-red-500 hover:bg-red-600 text-white",
          iconBg: "bg-red-100"
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
          confirmButton: "bg-orange-500 hover:bg-orange-600 text-white",
          iconBg: "bg-orange-100"
        };
      case 'info':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-500" />,
          confirmButton: "bg-blue-500 hover:bg-blue-600 text-white",
          iconBg: "bg-blue-100"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md z-50">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {title}
            </Dialog.Title>
          </div>
          
          <Dialog.Description className="text-gray-600 mb-6">
            {message}
          </Dialog.Description>
          
          <div className="flex gap-3 justify-end">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">
                {cancelText}
              </button>
            </Dialog.Close>
            <button
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${styles.confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 