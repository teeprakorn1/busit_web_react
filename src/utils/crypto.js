import CryptoJS from "crypto-js";

const secretKey = process.env.REACT_APP_SECREAT_KEY_CRYTO;

//Encryption Function
export const encryptValue = (value) => {
    return CryptoJS.AES.encrypt(value, secretKey).toString();
};

//Dncryption Function
export const decryptValue = (encryptedValue) => {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};