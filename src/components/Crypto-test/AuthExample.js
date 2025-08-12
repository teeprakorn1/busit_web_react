import React, { useEffect, useState } from 'react';
import { encryptToken, decryptToken } from '../../utils/crypto';

const AuthExample = () => {
    const [token, setToken] = useState('');
    const [decryptedToken, setDecryptedToken] = useState('');

    useEffect(() => {
        // ตัวอย่าง Token ที่ต้องการเข้ารหัส
        const myToken = "eyJhbGciOi..."; 

        //ตัวอย่าง การเข้ารหัสและเก็บใน localStorage
        const encrypted = encryptToken(myToken);
        localStorage.setItem('secureToken', encrypted);
        console.log("Token ที่เข้ารหัส:", encrypted);

        //ตัวอย่าง การดึงข้อมูลและถอดรหัส
        const storedToken = localStorage.getItem('secureToken');
        const decrypted = decryptToken(storedToken);
        setToken(storedToken);
        setDecryptedToken(decrypted);
    }, []);

    return (
        <div>
            <h2>React Token Encryption Example</h2>
            <p><strong>เข้ารหัสแล้ว:</strong> {token}</p>
            <p><strong>ถอดรหัสแล้ว:</strong> {decryptedToken}</p>
        </div>
    );
};

export default AuthExample;