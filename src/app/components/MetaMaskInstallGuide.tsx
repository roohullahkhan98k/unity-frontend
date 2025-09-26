"use client";
import React from 'react';

export default function MetaMaskInstallGuide() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 14a6 6 0 1112 0H8z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            MetaMask Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            To use wallet authentication, you need to install MetaMask extension.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span className="text-gray-700">Visit the official MetaMask website</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span className="text-gray-700">Download and install the browser extension</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span className="text-gray-700">Create or import a wallet</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span className="text-gray-700">Refresh this page and try again</span>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 14a6 6 0 1112 0H8z" />
              </svg>
              Install MetaMask
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 