# MetaMask Integration Setup

This guide explains how to set up and use MetaMask authentication in your Unity Social app.

## Features Added

- **MetaMask Wallet Authentication**: Users can sign up and log in using their MetaMask wallet
- **Signature Verification**: Secure authentication using cryptographic signatures
- **Dual Authentication**: Support for both traditional email/password and wallet-based authentication
- **Wallet Status Display**: Shows connected wallet address in the header
- **Installation Guide**: Helpful guide for users without MetaMask

## Backend Requirements

Your backend should have the following endpoints implemented:

### 1. Wallet Authentication Endpoints

```javascript
// Get authentication challenge
POST /api/wallet/challenge
Body: { walletAddress: string }

// Wallet signup
POST /api/wallet/signup
Body: { walletAddress: string, signature: string, nonce: string, username: string }

// Wallet login
POST /api/wallet/login
Body: { walletAddress: string, signature: string, nonce: string }
```

### 2. Required Backend Dependencies

```bash
npm install ethers bcryptjs jsonwebtoken
```

### 3. User Model Updates

Your user model should include a `walletAddress` field:

```javascript
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // can be null for wallet users
  walletAddress: { type: String, unique: true, sparse: true },
  profileImage: String,
});
```

## Frontend Components Added

### 1. MetaMask Hook (`useMetaMask.ts`)
- Manages wallet connection state
- Handles wallet connection/disconnection
- Provides message signing functionality
- Listens for account and chain changes

### 2. MetaMask Authentication Service (`metaMaskAuth.ts`)
- Handles API calls for wallet authentication
- Manages authentication challenges
- Processes signup and login requests

### 3. MetaMask Login Component (`MetaMaskLogin.tsx`)
- Provides UI for wallet connection
- Handles authentication flow
- Shows installation guide for users without MetaMask

### 4. Wallet Status Component (`WalletStatus.tsx`)
- Displays connected wallet address
- Provides disconnect functionality
- Shows in the header when wallet is connected

### 5. Installation Guide Component (`MetaMaskInstallGuide.tsx`)
- Guides users to install MetaMask
- Provides step-by-step instructions
- Links to official MetaMask download

## Usage

### For Users

1. **Install MetaMask**: Visit [metamask.io](https://metamask.io) and install the browser extension
2. **Create/Import Wallet**: Set up your MetaMask wallet
3. **Connect to App**: 
   - Go to login/register page
   - Click "MetaMask" tab
   - Click "Connect MetaMask"
   - Approve the connection in MetaMask
4. **Authenticate**: 
   - For signup: Enter username and click "Create Account with Wallet"
   - For login: Click "Sign In with Wallet"
   - Sign the authentication message in MetaMask

### For Developers

The integration is already set up in your login and register pages. Users can toggle between traditional email/password authentication and MetaMask wallet authentication.

## Security Features

- **Nonce-based Challenges**: Each authentication attempt uses a unique nonce
- **Signature Verification**: Backend verifies cryptographic signatures
- **Address Normalization**: Ensures consistent address format
- **Challenge Expiration**: Authentication challenges expire after use

## Environment Variables

Make sure your frontend has the correct API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Testing

1. Install MetaMask browser extension
2. Create a test wallet or use an existing one
3. Navigate to your app's login/register page
4. Test both signup and login flows with MetaMask
5. Verify wallet status appears in header when connected

## Troubleshooting

### Common Issues

1. **MetaMask not detected**: Ensure MetaMask extension is installed and enabled
2. **Connection failed**: Check if MetaMask is unlocked and on the correct network
3. **Signature failed**: Ensure you're signing the correct message in MetaMask
4. **Backend errors**: Verify all required endpoints are implemented correctly

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify MetaMask is connected to the correct network
3. Ensure backend endpoints are responding correctly
4. Check that the authentication challenge is being generated properly

## Security Considerations

- Always verify signatures on the backend
- Use HTTPS in production
- Implement proper session management
- Consider rate limiting for authentication attempts
- Store challenges securely and expire them appropriately 