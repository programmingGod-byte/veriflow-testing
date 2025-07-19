import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = crypto
  .createHash('sha256')
  .update(String(process.env.ENCRYPTION_SECRET || 'default-secret'))
  .digest(); // 32-byte key

const ivLength = 16; // AES block size

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex'); // iv:encrypted
}

export function decrypt(encryptedText: string): { success: boolean; value?: string } {
  try {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return { success: true, value: decrypted.toString('utf8') };
  } catch (error) {
    return { success: false };
  }
}

