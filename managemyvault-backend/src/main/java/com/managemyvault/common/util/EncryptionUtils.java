package com.managemyvault.common.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

@Component
@Slf4j
public class EncryptionUtils {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128; // in bits
    private static final int IV_LENGTH_BYTES = 12;

    private final String masterEncryptionKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public EncryptionUtils(@Value("${app.vault.master-encryption-key}") String masterEncryptionKey) {
        this.masterEncryptionKey = masterEncryptionKey;
    }

    /**
     * Derives a unique 256-bit Data Encryption Key (DEK) for the given organization.
     */
    private SecretKeySpec deriveKey(UUID organizationId) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String input = masterEncryptionKey + organizationId.toString();
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(hash, "AES");
        } catch (Exception e) {
            log.error("Failed to derive encryption key for org: {}", organizationId, e);
            throw new RuntimeException("Encryption error", e);
        }
    }

    public static class EncryptedData {
        public final String ciphertext;
        public final String iv;

        public EncryptedData(String ciphertext, String iv) {
            this.ciphertext = ciphertext;
            this.iv = iv;
        }
    }

    /**
     * Encrypts plaintext using AES-256-GCM.
     */
    public EncryptedData encrypt(String plaintext, UUID organizationId) {
        try {
            SecretKeySpec secretKey = deriveKey(organizationId);
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] cipherTextBytes = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            String ciphertextBase64 = Base64.getEncoder().encodeToString(cipherTextBytes);
            String ivBase64 = Base64.getEncoder().encodeToString(iv);

            return new EncryptedData(ciphertextBase64, ivBase64);
        } catch (Exception e) {
            log.error("Failed to encrypt data for org: {}", organizationId, e);
            throw new RuntimeException("Encryption error", e);
        }
    }

    /**
     * Decrypts ciphertext using AES-256-GCM.
     */
    public String decrypt(String ciphertextBase64, String ivBase64, UUID organizationId) {
        try {
            SecretKeySpec secretKey = deriveKey(organizationId);
            byte[] iv = Base64.getDecoder().decode(ivBase64);
            byte[] cipherText = Base64.getDecoder().decode(ciphertextBase64);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            byte[] decryptedBytes = cipher.doFinal(cipherText);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to decrypt data for org: {}", organizationId, e);
            throw new RuntimeException("Decryption error", e);
        }
    }
}
