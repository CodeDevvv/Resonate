import json
import os
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import scrypt
from dotenv import load_dotenv

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
