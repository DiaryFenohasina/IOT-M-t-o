import CryptoJS from 'crypto-js';

const ENCRYPTION_SECRET = 'iot-meteo-local-weather-cache-v1';
const ENCRYPTION_KEY = CryptoJS.SHA256(ENCRYPTION_SECRET);
const ENCRYPTION_IV = CryptoJS.enc.Hex.parse('4a6f75726e616c4d6574656f30313233');

export const encryptJson = (value: unknown) =>
  CryptoJS.AES.encrypt(JSON.stringify(value), ENCRYPTION_KEY, {
    iv: ENCRYPTION_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();

export const decryptJson = <T>(encryptedValue: string): T => {
  const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY, {
    iv: ENCRYPTION_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);

  if (!decryptedValue) {
    throw new Error('Donnee chiffree invalide.');
  }

  return JSON.parse(decryptedValue) as T;
};
