import os
import uuid
import hashlib
from typing import Tuple
from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../../../data/uploads")

class StorageProvider:
    def __init__(self):
        os.makedirs(UPLOAD_DIR, exist_ok=True)

    async def save_upload_file(self, upload_file: UploadFile) -> Tuple[str, str, int]:
        """
        Saves a FastAPI UploadFile to local disk.
        Returns a tuple of (storage_name, sha256_hash, file_size_bytes)
        """
        file_ext = os.path.splitext(upload_file.filename)[1] if upload_file.filename else ""
        storage_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, storage_name)
        
        sha256_hash = hashlib.sha256()
        file_size = 0
        
        with open(file_path, "wb") as buffer:
            while chunk := await upload_file.read(8192):
                sha256_hash.update(chunk)
                buffer.write(chunk)
                file_size += len(chunk)
                
        await upload_file.seek(0) # Reset pointer just in case
        return storage_name, sha256_hash.hexdigest(), file_size
    
    def get_file_path(self, storage_name: str) -> str:
        return os.path.join(UPLOAD_DIR, storage_name)

    def delete_file(self, storage_name: str) -> bool:
        file_path = self.get_file_path(storage_name)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False

# Dependency singleton
storage_provider = StorageProvider()

def get_storage_provider() -> StorageProvider:
    return storage_provider
