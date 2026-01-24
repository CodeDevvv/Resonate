import json
import os
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import scrypt

def extract_json(text: str):
    """
    Finds and parses the first valid JSON object within a string.
    """
    try:
        start_index = text.find('{')
        end_index = text.rfind('}')
        if start_index != -1 and end_index != -1:
            json_str = text[start_index : end_index + 1]
            return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return None
    return None


def encrypt_text(text: str) -> dict:
    if not text or len(text) <= 0: return 
    encryption_key = os.getenv("ENCRYPTION_KEY")
    salt = b'salt'
    key = scrypt(encryption_key.encode('utf-8'), salt, key_len=32, N=16384, r=8, p=1)
    iv = os.urandom(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    text_bytes = text.encode('utf-8')
    block_size = AES.block_size
    pad_len = block_size - len(text_bytes) % block_size
    padded_text = text_bytes + bytes([pad_len] * pad_len)
    encrypted = cipher.encrypt(padded_text)
    return f"{iv.hex()}:{encrypted.hex()}"

def decrypt_text(encrypted_string: str) -> str:
    if not encrypted_string or len(encrypted_string) <=0: return 
    encryption_key = os.getenv("ENCRYPTION_KEY")
    salt = b'salt' 
    key = scrypt(encryption_key.encode('utf-8'), salt, key_len=32, N=16384, r=8, p=1)
    try:
        iv_hex, ciphertext_hex = encrypted_string.split(":")
        iv = bytes.fromhex(iv_hex)
        ciphertext = bytes.fromhex(ciphertext_hex)
    except ValueError:
        raise ValueError("Invalid format. Expected 'iv_hex:ciphertext_hex'")
    cipher = AES.new(key, AES.MODE_CBC, iv)
    padded_text = cipher.decrypt(ciphertext)
    pad_len = padded_text[-1]
    if pad_len < 1 or pad_len > AES.block_size:
        raise ValueError("Decryption failed: Invalid padding.")
    text = padded_text[:-pad_len]
    return text.decode('utf-8')