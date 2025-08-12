import CryptoJS from "crypto-js";

const secretKey = process.env.REACT_APP_SECREAT_KEY_CRYTO;

//Encryption Function
export const encryptToken = (token) => {
    return CryptoJS.AES.encrypt(token, secretKey).toString();
};

//Dncryption Function
export const decryptToken = (encryptedToken) => {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};