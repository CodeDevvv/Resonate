import crypto from "crypto";

export const decrypt = (encryptedText) => {
    if (!encryptedText) return '';

    try {
        const [ivHex, encryptedHex] = encryptedText.split(":");
        if (!ivHex || !encryptedHex) {
            throw new Error("Invalid encrypted text format");
        }

        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');

        const key = crypto.scryptSync(
            process.env.ENCRYPTION_KEY,
            'salt',
            32
        );

        const decipher = crypto.createDecipheriv(process.env.ENCRYPTION_ALGORITHM, key, iv);
        decipher.setAutoPadding(false);

        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        if (decrypted.length === 0) {
            throw new Error("Decrypted data is empty");
        }

        const padLen = decrypted[decrypted.length - 1];

        if (padLen < 1 || padLen > 16) {
            throw new Error(`Invalid padding length: ${padLen}`);
        }

        for (let i = decrypted.length - padLen; i < decrypted.length; i++) {
            if (decrypted[i] !== padLen) {
                throw new Error("Invalid padding bytes");
            }
        }

        const result = decrypted.slice(0, decrypted.length - padLen).toString('utf-8');
        return result;

    } catch (error) {
        console.error('Decryption error:', error);
        return '';
    }
};