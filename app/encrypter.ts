// import crypto from 'crypto';

// const algorithm = 'aes-256-cbc';
// const key = crypto
//   .createHash('sha256')
//   .update(String(process.env.ENCRYPTION_SECRET || 'default-secret'))
//   .digest(); // 32-byte key

// const ivLength = 16; // AES block size

// export function encrypt(text: string): string {
//   const iv = crypto.randomBytes(ivLength);
//   const cipher = crypto.createCipheriv(algorithm, key, iv);
//   const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
//   return iv.toString('hex') + ':' + encrypted.toString('hex'); // iv:encrypted
// }

// export function decrypt(encryptedText: string): { success: boolean; value?: string } {
//   try {
//     const [ivHex, encryptedHex] = encryptedText.split(':');
//     if (!ivHex || !encryptedHex) {
//       throw new Error('Invalid format');
//     }

//     const iv = Buffer.from(ivHex, 'hex');
//     const encrypted = Buffer.from(encryptedHex, 'hex');

//     const decipher = crypto.createDecipheriv(algorithm, key, iv);
//     const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

//     return { success: true, value: decrypted.toString('utf8') };
//   } catch (error) {
//     return { success: false };
//   }
// }



import crypto from 'crypto';

// TypeScript interface for stored encryption data
interface EncryptionData {
  data: string;
  length: number;
}

// TypeScript interface for decrypt result
interface DecryptResult {
  success: boolean;
  value?: string;
}

// Global storage type declaration
declare global {
  var encryptionStore: Map<string, EncryptionData> | undefined;
}

// Reversible 6-digit encoding using XOR cipher
export function encrypt(text: string): string {
  const secret: string = process.env.ENCRYPTION_SECRET || 'default-secret';
  const key: Buffer = crypto.createHash('sha256').update(secret).digest();
  
  // Encode text to base64 first to handle special characters
  const base64Text: string = Buffer.from(text, 'utf8').toString('base64');
  
  // Apply XOR encryption
  let encrypted: string = '';
  for (let i = 0; i < base64Text.length; i++) {
    const keyByte: number = key[i % key.length];
    const textByte: number = base64Text.charCodeAt(i);
    encrypted += String.fromCharCode(textByte ^ keyByte);
  }
  
  // Convert to hex and then to 6-digit code
  const encryptedHex: string = Buffer.from(encrypted, 'binary').toString('hex');
  
  // Create a deterministic 6-digit code that includes length info
  const lengthInfo: string = base64Text.length.toString(16).padStart(2, '0');
  const dataHash: string = crypto.createHash('md5').update(encryptedHex).digest('hex');
  
  // Combine length and hash info to create 6-digit code
  const combined: string = lengthInfo + dataHash;
  const decimal: number = parseInt(combined.substring(0, 8), 16);
  const sixDigitCode: string = (decimal % 1000000).toString().padStart(6, '0');
  
  // Store the full encrypted data in a map using the 6-digit code as key
  // In a real application, you'd store this in a database
  if (!global.encryptionStore) {
    global.encryptionStore = new Map<string, EncryptionData>();
  }
  
  global.encryptionStore.set(sixDigitCode, {
    data: encryptedHex,
    length: base64Text.length
  });
  
  return sixDigitCode;
}

export function decrypt(encryptedText: string): DecryptResult {
  console.log(encrypt("3.7.18.154"))
  // 131401
  // 990116
  try {
    console.log(encryptedText);
    const secret: string =  'default-secret';
    const key: Buffer = crypto.createHash('sha256').update(secret).digest();
    
    // Retrieve stored data using the 6-digit code
    if (!global.encryptionStore || !global.encryptionStore.has(encryptedText)) {
      return { success: false };
    }
    
    const storedData: EncryptionData | undefined = global.encryptionStore.get(encryptedText);
    if (!storedData) {
      return { success: false };
    }
    
    const encryptedHex: string = storedData.data;
    const originalLength: number = storedData.length;
    
    // Convert hex back to binary
    const encrypted: string = Buffer.from(encryptedHex, 'hex').toString('binary');
    
    // Apply XOR decryption
    let decrypted: string = '';
    for (let i = 0; i < encrypted.length; i++) {
      const keyByte: number = key[i % key.length];
      const encryptedByte: number = encrypted.charCodeAt(i);
      decrypted += String.fromCharCode(encryptedByte ^ keyByte);
    }
    
    // Verify length matches
    if (decrypted.length !== originalLength) {
      return { success: false };
    }
    
    // Convert from base64 back to original text
    const originalText: string = Buffer.from(decrypted, 'base64').toString('utf8');
    
    return { success: true, value: originalText };
  } catch (error: unknown) {
    return { success: false };
  }
}

// Verification function for checking if text produces specific code
export function verify6DigitCode(text: string, code: string): boolean {
  return encrypt(text) === code;
}

// Optional: Clear the encryption store (useful for testing)
export function clearEncryptionStore(): void {
  if (global.encryptionStore) {
    global.encryptionStore.clear();
  }
}

// Optional: Get all stored codes (useful for debugging)
export function getStoredCodes(): string[] {
  if (!global.encryptionStore) {
    return [];
  }
  return Array.from(global.encryptionStore.keys());
}

// Usage examples:
// const code: string = encrypt("hello world"); // Always returns same 6-digit code like "582639"
// const result: DecryptResult = decrypt(code); // { success: true, value: "hello world" }
// const isValid: boolean = verify6DigitCode("hello world", code); // true