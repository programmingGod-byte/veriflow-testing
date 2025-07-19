"use client"
import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const EncryptionApp = () => {
  const [inputText, setInputText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('x8V#jKp7@Tq39!yLz2FbWm$R1nCdUv0');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoSupported, setCryptoSupported] = useState(true);
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    // Check if crypto.subtle is available
    setCryptoSupported(
      typeof crypto !== 'undefined' && 
      typeof crypto.subtle !== 'undefined' && 
      crypto.subtle !== null
    );

    // Handle authentication and email verification
    if (status === 'loading') {
      // Still loading, don't do anything yet
      return;
    }

    if (status === 'unauthenticated') {
      // User is not authenticated, redirect to home
      router.replace("/");
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      const allowedEmails = ["verigeektech@gmail.com", "omdaga6@gmail.com"];
      if (!allowedEmails.includes(session.user.email)) {
        router.replace("/");
      }
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not authorized, don't render the component
  if (!isAuthenticated || !session?.user?.email) {
    return null;
  }

  const allowedEmails = ["verigeektech@gmail.com", "omdaga6@gmail.com"];
  if (!allowedEmails.includes(session.user.email)) {
    return null;
  }

  // Fallback SHA-256 implementation
  const sha256Fallback = async (message) => {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    return hashBuffer;
  };

  // Simple XOR-based encryption fallback (for demo purposes only - not secure!)
  const fallbackEncrypt = (text, key) => {
    const keyHash = btoa(key).slice(0, 32).padEnd(32, '0');
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const keyChar = keyHash.charCodeAt(i % keyHash.length);
      const textChar = text.charCodeAt(i);
      result += String.fromCharCode(textChar ^ keyChar);
    }
    const iv = Math.random().toString(36).substring(2, 18);
    return iv + ':' + btoa(result);
  };

  const fallbackDecrypt = (encryptedText, key) => {
    try {
      const [iv, encrypted] = encryptedText.split(':');
      const keyHash = btoa(key).slice(0, 32).padEnd(32, '0');
      const decoded = atob(encrypted);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const keyChar = keyHash.charCodeAt(i % keyHash.length);
        const encChar = decoded.charCodeAt(i);
        result += String.fromCharCode(encChar ^ keyChar);
      }
      return result;
    } catch (error) {
      throw new Error('Invalid encrypted text format');
    }
  };

  // Convert string to ArrayBuffer
  const stringToArrayBuffer = (str) => {
    return new TextEncoder().encode(str);
  };

  // Convert ArrayBuffer to string
  const arrayBufferToString = (buffer) => {
    return new TextDecoder().decode(buffer);
  };

  // Convert ArrayBuffer to hex string
  const arrayBufferToHex = (buffer) => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // Convert hex string to ArrayBuffer
  const hexToArrayBuffer = (hex) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  };

  // Generate key from secret
  const generateKey = async (secret) => {
    if (!cryptoSupported) {
      return secret; // Return secret as-is for fallback
    }
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    return await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-CBC' },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const encrypt = async (text) => {
    try {
      setIsLoading(true);
      
      if (!cryptoSupported) {
        // Use fallback encryption
        return fallbackEncrypt(text, encryptionKey);
      }
      
      const key = await generateKey(encryptionKey);
      const iv = crypto.getRandomValues(new Uint8Array(16));
      const encodedText = stringToArrayBuffer(text);

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        encodedText
      );

      const ivHex = arrayBufferToHex(iv);
      const encryptedHex = arrayBufferToHex(encrypted);
      return ivHex + ':' + encryptedHex;
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const decrypt = async (encryptedText) => {
    try {
      setIsLoading(true);
      const [ivHex, encryptedHex] = encryptedText.split(':');
      if (!ivHex || !encryptedHex) {
        throw new Error('Invalid encrypted text format');
      }

      if (!cryptoSupported) {
        // Use fallback decryption
        return fallbackDecrypt(encryptedText, encryptionKey);
      }

      const key = await generateKey(encryptionKey);
      const iv = new Uint8Array(hexToArrayBuffer(ivHex));
      const encrypted = hexToArrayBuffer(encryptedHex);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        encrypted
      );

      return arrayBufferToString(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEncrypt = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to encrypt');
      return;
    }
    try {
      const encrypted = await encrypt(inputText);
      setEncryptedText(encrypted);
    } catch (error) {
      alert('Encryption failed: ' + error.message);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedText.trim()) {
      alert('Please enter encrypted text to decrypt');
      return;
    }
    try {
      const decrypted = await decrypt(encryptedText);
      setDecryptedText(decrypted);
    } catch (error) {
      alert('Decryption failed: ' + error.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Lock className="w-10 h-10 text-indigo-600" />
            Encryption & Decryption Tool
          </h1>
          <p className="text-gray-600">Secure your text with AES-256-CBC encryption</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Logged in as: <span className="font-medium">{session.user.email}</span></p>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Crypto Support Warning */}
        {!cryptoSupported && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Security Notice:</strong> Your browser doesn't support secure crypto operations. 
                  Using fallback encryption (not suitable for sensitive data). 
                  For full security, use HTTPS or localhost.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Encryption Key Input */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Encryption Key</h2>
          </div>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12 text-black"
              placeholder="Enter your encryption key"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            This key will be used for both encryption and decryption. Keep it secure!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Encryption Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">Encrypt Text</h2>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-black"
              placeholder="Enter text to encrypt..."
            />
            
            <button
              onClick={handleEncrypt}
              disabled={isLoading}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {isLoading ? 'Encrypting...' : 'Encrypt'}
            </button>

            {encryptedText && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encrypted Result:
                </label>
                <div className="relative">
                  <textarea
                    value={encryptedText}
                    readOnly
                    className="w-full h-24 p-3 bg-gray-50 border border-gray-300 rounded-lg resize-none text-sm font-mono text-black"
                  />
                  <button
                    onClick={() => copyToClipboard(encryptedText)}
                    className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Decryption Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Unlock className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Decrypt Text</h2>
            </div>
            
            <textarea
              value={encryptedText}
              onChange={(e) => setEncryptedText(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm font-mono text-black"
              placeholder="Enter encrypted text to decrypt..."
            />
            
            <button
              onClick={handleDecrypt}
              disabled={isLoading}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              {isLoading ? 'Decrypting...' : 'Decrypt'}
            </button>

            {decryptedText && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decrypted Result:
                </label>
                <div className="relative">
                  <textarea
                    value={decryptedText}
                    readOnly
                    className="w-full h-24 p-3 bg-gray-50 border border-gray-300 rounded-lg resize-none text-black"
                  />
                  <button
                    onClick={() => copyToClipboard(decryptedText)}
                    className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">How it works:</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• This tool uses AES-256-CBC encryption when supported by your browser</p>
            <p>• Your encryption key is hashed with SHA-256 to create a 32-byte key</p>
            <p>• Each encryption generates a random IV (Initialization Vector) for security</p>
            <p>• The encrypted output format is: IV:EncryptedData (both in hexadecimal)</p>
            <p>• Use the same key for both encryption and decryption</p>
            {!cryptoSupported && (
              <p className="text-yellow-600">• Currently using fallback mode - for full security, use HTTPS or localhost</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptionApp;