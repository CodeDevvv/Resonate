package com.resonate.service.util;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

import org.bouncycastle.crypto.generators.SCrypt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Slf4j
@Component
public class EncryptionUtil {

    @Value("${encryption.key}")
    private String secretKey;

    @Value("${encryption.algorithm}")
    private String algorithm;

    private SecretKeySpec keySpec;

    @PostConstruct
    public void init() {
        try {
            byte[] derivedKey = SCrypt.generate(
                    secretKey.getBytes(StandardCharsets.UTF_8), // The password
                    "salt".getBytes(StandardCharsets.UTF_8), // The salt
                    16384, // N (Cost)
                    8, // r (Block size)
                    1, // p (Parallelism)
                    32 // dkLen (Key length)
            );

            this.keySpec = new SecretKeySpec(derivedKey, "AES");
            log.info("Encryption Key derived successfully using Scrypt.");
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize Encryption Key", e);
        }
    }

    public String encrypt(String plainText) {
        try {
            Cipher cipher = Cipher.getInstance(algorithm);
            byte[] iv = new byte[16]; // In real use, generate random IV
            IvParameterSpec ivSpec = new IvParameterSpec(iv);

            cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);

            // Manual PKCS7 Padding to match your Node logic
            byte[] bytes = plainText.getBytes(StandardCharsets.UTF_8);
            int paddingLen = 16 - (bytes.length % 16);
            byte[] padded = new byte[bytes.length + paddingLen];
            System.arraycopy(bytes, 0, padded, 0, bytes.length);
            for (int i = bytes.length; i < padded.length; i++) {
                padded[i] = (byte) paddingLen;
            }

            byte[] encrypted = cipher.doFinal(padded);
            return HexFormat.of().formatHex(iv) + ":" + HexFormat.of().formatHex(encrypted);
        } catch (Exception e) {
            log.error("Encryption error", e);
            return "";
        }
    }

    public String decrypt(String encryptedText) {
        if (encryptedText == null || !encryptedText.contains(":"))
            return "";

        try {
            String[] parts = encryptedText.split(":");
            byte[] iv = HexFormat.of().parseHex(parts[0]);
            byte[] encrypted = HexFormat.of().parseHex(parts[1]);

            Cipher cipher = Cipher.getInstance(algorithm); // AES/CBC/NoPadding
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);

            byte[] decrypted = cipher.doFinal(encrypted);

            int padLen = decrypted[decrypted.length - 1];
            int actualDataLength = decrypted.length - padLen;

            return new String(decrypted, 0, actualDataLength, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Decryption failed. This usually means the Key or IV is wrong.");
            throw new RuntimeException("Cryptographic failure", e);
        }
    }
}