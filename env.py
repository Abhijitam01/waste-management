"""
DEPRECATED: This file is deprecated and should not be used.

Please use config.py with environment variables instead.

Migration:
1. Copy .env.example to .env
2. Add your Firebase credentials to .env
3. Use: from config import Config
4. Access: Config.get_firebase_config()

This file is kept for backward compatibility only.
"""

import warnings
from config import Config

warnings.warn(
    "env.py is deprecated. Please use config.py with environment variables instead.",
    DeprecationWarning,
    stacklevel=2
)

# Backward compatibility - use config.py instead
auth_cred = Config.get_firebase_config()