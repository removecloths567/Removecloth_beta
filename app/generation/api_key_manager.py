import json
import asyncio
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from contextlib import asynccontextmanager
import logging

logger = logging.getLogger("uvicorn")


class APIKeyManager:
    """
    Distributed ledger system for managing multiple API keys with:
    - Dynamic key allocation per user/request
    - Automatic credit tracking and updates
    - Key locking mechanism to prevent race conditions
    - Automatic key rotation when credits are exhausted
    - Persistence to JSON file
    """
    
    def __init__(self, config_path: str = "credits.json"):
        self.config_path = config_path
        self.keys: Dict[str, Dict] = {}
        self.locks: Dict[str, asyncio.Lock] = {}
        self.file_lock = asyncio.Lock()
        self.active_allocations: Dict[str, str] = {}  # task_id -> key_name
        self._load_keys()
    
    def _load_keys(self):
        """Load API keys from JSON file"""
        try:
            with open(self.config_path, 'r') as f:
                self.keys = json.load(f)
            
            # Initialize locks for each key
            for key_name in self.keys.keys():
                self.locks[key_name] = asyncio.Lock()
            
            logger.info(f"Loaded {len(self.keys)} API keys from {self.config_path}")
        except FileNotFoundError:
            logger.error(f"Config file {self.config_path} not found")
            raise
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in {self.config_path}")
            raise
    
    async def _save_keys(self):
        """Persist current state to JSON file"""
        async with self.file_lock:
            try:
                # Create backup before writing
                if os.path.exists(self.config_path):
                    backup_path = f"{self.config_path}.backup"
                    with open(self.config_path, 'r') as f:
                        backup_data = f.read()
                    with open(backup_path, 'w') as f:
                        f.write(backup_data)
                
                # Write new data
                with open(self.config_path, 'w') as f:
                    json.dump(self.keys, f, indent=2)
                
                logger.debug(f"Saved API key state to {self.config_path}")
            except Exception as e:
                logger.error(f"Failed to save keys: {str(e)}")
                raise
    
    def get_available_keys(self) -> List[str]:
        """Get list of keys with available credits"""
        return [
            key_name for key_name, data in self.keys.items()
            if data.get("credits", 0) > 0
        ]
    
    def get_total_credits(self) -> int:
        """Get total available credits across all keys"""
        return sum(data.get("credits", 0) for data in self.keys.values())
    
    async def get_key_for_user(self, task_id: str) -> Optional[tuple[str, str]]:
        """
        Allocate an API key for a user request.
        Returns: (key_name, api_key) or (None, None) if no keys available
        """
        available_keys = self.get_available_keys()
        
        if not available_keys:
            logger.warning("No API keys with available credits")
            return None, None
        
        # Sort by credits (descending) to use keys with more credits first
        available_keys.sort(
            key=lambda k: self.keys[k]["credits"],
            reverse=True
        )
        
        # Try to acquire a lock on a key
        for key_name in available_keys:
            lock = self.locks[key_name]
            
            # Try to acquire without blocking
            if lock.locked():
                continue
            
            try:
                # Acquire lock (non-blocking)
                acquired = await asyncio.wait_for(
                    lock.acquire(),
                    timeout=0.1
                )
                
                if acquired:
                    # Double-check credits after acquiring lock
                    if self.keys[key_name]["credits"] > 0:
                        api_key = self.keys[key_name]["api_key"]
                        self.active_allocations[task_id] = key_name
                        logger.info(f"Allocated {key_name} to task {task_id}")
                        return key_name, api_key
                    else:
                        lock.release()
            except asyncio.TimeoutError:
                continue
        
        logger.warning("All keys are currently locked or have no credits")
        return None, None
    
    async def deduct_credit(self, task_id: str, success: bool = True) -> bool:
        """
        Deduct credit from the allocated key and release lock.
        Returns: True if successful, False otherwise
        """
        key_name = self.active_allocations.get(task_id)
        
        if not key_name:
            logger.error(f"No key allocation found for task {task_id}")
            return False
        
        try:
            # Only deduct if generation was successful
            if success:
                self.keys[key_name]["credits"] -= 1
                logger.info(
                    f"Deducted 1 credit from {key_name}. "
                    f"Remaining: {self.keys[key_name]['credits']}"
                )
                
                # Persist changes
                await self._save_keys()
            
            return True
        
        except Exception as e:
            logger.error(f"Failed to deduct credit: {str(e)}")
            return False
        
        finally:
            # Always release lock and clean up allocation
            if key_name in self.locks:
                lock = self.locks[key_name]
                if lock.locked():
                    lock.release()
            
            if task_id in self.active_allocations:
                del self.active_allocations[task_id]
    
    async def release_key(self, task_id: str):
        """Release key without deducting credit (for failures/cancellations)"""
        await self.deduct_credit(task_id, success=False)
    
    def get_key_stats(self) -> Dict:
        """Get statistics about API key usage"""
        stats = {
            "total_keys": len(self.keys),
            "available_keys": len(self.get_available_keys()),
            "total_credits": self.get_total_credits(),
            "locked_keys": len([k for k, lock in self.locks.items() if lock.locked()]),
            "active_allocations": len(self.active_allocations),
            "keys_detail": {}
        }
        
        for key_name, data in self.keys.items():
            stats["keys_detail"][key_name] = {
                "credits": data["credits"],
                "locked": self.locks[key_name].locked(),
                "allocated_to": None
            }
            
            # Find which task this key is allocated to
            for task_id, allocated_key in self.active_allocations.items():
                if allocated_key == key_name:
                    stats["keys_detail"][key_name]["allocated_to"] = task_id
                    break
        
        return stats
    
    @asynccontextmanager
    async def allocate_key(self, task_id: str):
        """
        Context manager for automatic key allocation and release.
        
        Usage:
            async with key_manager.allocate_key(task_id) as api_key:
                if api_key:
                    # Use api_key for generation
                    pass
        """
        key_name, api_key = await self.get_key_for_user(task_id)
        
        try:
            yield api_key
            
            # If we get here, operation was successful
            if api_key:
                await self.deduct_credit(task_id, success=True)
        
        except Exception as e:
            # On any exception, release without deducting
            logger.error(f"Error during key usage: {str(e)}")
            if api_key:
                await self.release_key(task_id)
            raise
        
        else:
            # If no exception but api_key was None, no cleanup needed
            if not api_key:
                logger.warning(f"No API key was allocated for task {task_id}")


# Global instance
key_manager = None


def get_key_manager() -> APIKeyManager:
    """Get or create the global key manager instance"""
    global key_manager
    if key_manager is None:
        key_manager = APIKeyManager()
    return key_manager