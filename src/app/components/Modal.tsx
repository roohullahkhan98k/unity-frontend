import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  size?: 'default' | 'large';
}

export default function Modal({ open, onOpenChange, title, children, size = 'default' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount>
                <motion.div
                  className={`fixed left-1/2 top-1/2 z-50 flex flex-col items-center justify-center w-full p-8 bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-2xl shadow-2xl border border-indigo-100 ${
                    size === 'large' ? 'max-w-5xl max-h-[80vh] overflow-hidden' : 'max-w-md'
                  }`}
                  initial={{ opacity: 0, scale: 0.96, x: '-50%', y: '-50%' }}
                  animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                  exit={{ opacity: 0, scale: 0.96, x: '-50%', y: '-50%' }}
                  transition={{ duration: 0.22, type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <Dialog.Title className="text-2xl font-extrabold mb-4 text-indigo-700 text-center tracking-tight drop-shadow">{title}</Dialog.Title>
                  <div className={`w-full ${size === 'large' ? 'overflow-y-auto max-h-[calc(80vh-120px)]' : ''}`}>
                    {children}
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className="absolute top-3 right-3 text-indigo-400 hover:text-indigo-700 bg-white/70 rounded-full p-2 shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 