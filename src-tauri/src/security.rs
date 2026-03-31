use argon2::{password_hash::SaltString, Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use keyring::Entry;
use rand_core::OsRng;
use serde::Serialize;
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri_plugin_stronghold::{kdf::KeyDerivation, stronghold::Stronghold};

#[derive(Debug, Serialize)]
pub struct AppLockStatus {
    pub has_verifier: bool,
    pub requires_unlock: bool,
    pub can_auto_unlock: bool,
}

#[derive(Debug, Serialize)]
pub struct AppLockError {
    pub code: String,
    pub message: String,
}

impl AppLockError {
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
        }
    }
}

const STRONGHOLD_CLIENT: &str = "tracer";
const STRONGHOLD_STORE_KEY_VERIFIER: &str = "app_password_verifier";

pub(crate) const STRONGHOLD_STORE_KEY_OPENAI_API_KEY: &str = "ai_openai_api_key";
pub(crate) const STRONGHOLD_STORE_KEY_ANTHROPIC_API_KEY: &str = "ai_anthropic_api_key";
pub(crate) const STRONGHOLD_STORE_KEY_GEMINI_API_KEY: &str = "ai_gemini_api_key";
pub(crate) const STRONGHOLD_STORE_KEY_GITHUB_MODELS_TOKEN: &str = "ai_github_models_token";
pub(crate) const STRONGHOLD_STORE_KEY_OPENAI_COMPAT_API_KEY: &str = "ai_openai_compat_api_key";
pub(crate) const STRONGHOLD_STORE_KEY_OPENAI_COMPAT_CONFIG_JSON: &str =
    "ai_openai_compat_config_json";

const KEYRING_SERVICE: &str = "tracer";
const KEYRING_ACCOUNT_APP_PASSWORD: &str = "app_password";

fn bytes_to_hex(bytes: &[u8]) -> String {
    const LUT: &[u8; 16] = b"0123456789abcdef";
    let mut out = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        out.push(LUT[(b >> 4) as usize] as char);
        out.push(LUT[(b & 0x0f) as usize] as char);
    }
    out
}

fn hex_to_bytes(hex: &str) -> Result<Vec<u8>, AppLockError> {
    let s = hex.trim();
    if s.len() % 2 != 0 {
        return Err(AppLockError::new("keychain", "Invalid keychain marker"));
    }
    let mut out = Vec::with_capacity(s.len() / 2);
    let bytes = s.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        let hi = (bytes[i] as char).to_digit(16);
        let lo = (bytes[i + 1] as char).to_digit(16);
        match (hi, lo) {
            (Some(h), Some(l)) => out.push(((h << 4) | l) as u8),
            _ => return Err(AppLockError::new("keychain", "Invalid keychain marker")),
        }
        i += 2;
    }
    Ok(out)
}

pub fn obfuscate_bytes_for_keychain(bytes: &[u8]) -> String {
    bytes_to_hex(bytes)
}

pub fn deobfuscate_bytes_from_keychain(hex: &str) -> Result<Vec<u8>, AppLockError> {
    hex_to_bytes(hex)
}

pub fn vault_path(app: &tauri::AppHandle) -> Result<PathBuf, AppLockError> {
    let dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| AppLockError::new("path", e.to_string()))?;
    Ok(dir.join("vault.hold"))
}

pub fn stronghold_salt_path(app: &tauri::AppHandle) -> Result<PathBuf, AppLockError> {
    let dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| AppLockError::new("path", e.to_string()))?;
    Ok(dir.join("stronghold_salt.txt"))
}

pub fn possible_sqlite_paths(app: &tauri::AppHandle) -> Result<Vec<PathBuf>, AppLockError> {
    let mut out = Vec::new();

    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| AppLockError::new("path", e.to_string()))?;
    out.push(config_dir.join("tracer.db"));

    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| AppLockError::new("path", e.to_string()))?;
    out.push(data_dir.join("tracer.db"));

    let local_data_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| AppLockError::new("path", e.to_string()))?;
    out.push(local_data_dir.join("tracer.db"));

    Ok(out)
}

fn keyring_entry() -> Result<Entry, AppLockError> {
    Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT_APP_PASSWORD)
        .map_err(|e| AppLockError::new("keychain", e.to_string()))
}

pub trait Keychain {
    fn get_app_password(&self) -> Result<Option<String>, AppLockError>;
    fn set_app_password(&self, password: &str) -> Result<(), AppLockError>;
    fn delete_app_password(&self) -> Result<(), AppLockError>;
}

pub struct OsKeychain;

impl Keychain for OsKeychain {
    fn get_app_password(&self) -> Result<Option<String>, AppLockError> {
        keychain_get_app_password()
    }

    fn set_app_password(&self, password: &str) -> Result<(), AppLockError> {
        keychain_set_app_password(password)
    }

    fn delete_app_password(&self) -> Result<(), AppLockError> {
        keychain_delete_app_password()
    }
}

pub fn hash_password(password: &str) -> Result<String, AppLockError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| AppLockError::new("hash", e.to_string()))?
        .to_string();
    Ok(hash)
}

pub fn verify_password(password: &str, stored: &str) -> Result<bool, AppLockError> {
    let parsed = PasswordHash::new(stored).map_err(|e| AppLockError::new("hash", e.to_string()))?;
    let argon2 = Argon2::default();
    Ok(argon2.verify_password(password.as_bytes(), &parsed).is_ok())
}

pub fn stronghold_store_set(
    stronghold: &tauri_plugin_stronghold::stronghold::Stronghold,
    key: &str,
    value: &str,
) -> Result<(), AppLockError> {
    if value.trim().is_empty() {
        return stronghold_store_delete(stronghold, key);
    }
    let client = stronghold
        .load_client(STRONGHOLD_CLIENT)
        .or_else(|_| stronghold.create_client(STRONGHOLD_CLIENT))
        .map_err(|e| AppLockError::new("stronghold", e.to_string()))?;
    let store = client.store();
    store
        .insert(key.as_bytes().to_vec(), value.as_bytes().to_vec(), None)
        .map_err(|e| AppLockError::new("stronghold", e.to_string()))?;
    stronghold
        .save()
        .map_err(|e| AppLockError::new("stronghold", e.to_string()))?;
    Ok(())
}

pub fn stronghold_store_delete_if_present(
    stronghold: &tauri_plugin_stronghold::stronghold::Stronghold,
    key: &str,
) -> Result<(), AppLockError> {
    stronghold_store_delete(stronghold, key)
}

pub fn stronghold_store_delete(
    stronghold: &tauri_plugin_stronghold::stronghold::Stronghold,
    key: &str,
) -> Result<(), AppLockError> {
    let client = match stronghold.load_client(STRONGHOLD_CLIENT) {
        Ok(c) => c,
        Err(_) => return Ok(()),
    };
    let store = client.store();
    store
        .delete(key.as_bytes())
        .map_err(|e| AppLockError::new("stronghold", e.to_string()))?;
    stronghold
        .save()
        .map_err(|e| AppLockError::new("stronghold", e.to_string()))?;
    Ok(())
}

pub fn stronghold_store_get(
    stronghold: &tauri_plugin_stronghold::stronghold::Stronghold,
    key: &str,
) -> Result<Option<String>, AppLockError> {
    let client = match stronghold.load_client(STRONGHOLD_CLIENT) {
        Ok(c) => c,
        Err(_) => return Ok(None),
    };
    let store = client.store();
    let value = store
        .get(key.as_bytes())
        .map_err(|e| AppLockError::new("stronghold", e.to_string()))?;
    Ok(value.map(|v| String::from_utf8_lossy(&v).to_string()))
}

pub fn set_password_verifier(
    stronghold: &tauri_plugin_stronghold::stronghold::Stronghold,
    password: &str,
) -> Result<(), AppLockError> {
    let verifier = hash_password(password)?;
    stronghold_store_set(stronghold, STRONGHOLD_STORE_KEY_VERIFIER, &verifier)
}

pub fn get_password_verifier(
    stronghold: &tauri_plugin_stronghold::stronghold::Stronghold,
) -> Result<Option<String>, AppLockError> {
    stronghold_store_get(stronghold, STRONGHOLD_STORE_KEY_VERIFIER)
}

pub fn keychain_get_app_password() -> Result<Option<String>, AppLockError> {
    let entry = keyring_entry()?;
    match entry.get_password() {
        Ok(v) => Ok(Some(v)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(AppLockError::new("keychain", e.to_string())),
    }
}

pub fn keychain_set_app_password(password: &str) -> Result<(), AppLockError> {
    let entry = keyring_entry()?;
    entry
        .set_password(password)
        .map_err(|e| AppLockError::new("keychain", e.to_string()))?;
    Ok(())
}

pub fn keychain_delete_app_password() -> Result<(), AppLockError> {
    let entry = keyring_entry()?;
    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(AppLockError::new("keychain", e.to_string())),
    }
}

pub fn stronghold_key_from_password(password: &str, salt_path: &Path) -> Vec<u8> {
    KeyDerivation::argon2(password, salt_path)
}

pub fn keychain_marker_from_password(password: &str, salt_path: &Path) -> String {
    obfuscate_bytes_for_keychain(&stronghold_key_from_password(password, salt_path))
}

pub fn lock_get_status_with(
    vault_path: &Path,
    keychain: &dyn Keychain,
) -> Result<AppLockStatus, AppLockError> {
    let has_vault = vault_path.exists();
    let can_auto_unlock = keychain.get_app_password()?.is_some();
    Ok(AppLockStatus {
        has_verifier: has_vault,
        requires_unlock: has_vault && !can_auto_unlock,
        can_auto_unlock,
    })
}

pub fn lock_first_run_set_password_with(
    vault_path: &Path,
    salt_path: &Path,
    password: &str,
) -> Result<(), AppLockError> {
    if password.trim().len() < 8 {
        return Err(AppLockError::new(
            "invalid_password",
            "Password must be at least 8 characters",
        ));
    }

    let sh = Stronghold::new(
        vault_path,
        stronghold_key_from_password(password, salt_path),
    )
    .map_err(|e| AppLockError::new("stronghold", e.to_string()))?;
    set_password_verifier(&sh, password)?;
    Ok(())
}

pub fn lock_unlock_with(
    vault_path: &Path,
    salt_path: &Path,
    password: &str,
) -> Result<(), AppLockError> {
    if !vault_path.exists() {
        return Err(AppLockError::new(
            "not_initialized",
            "App lock not initialized",
        ));
    }

    let sh = Stronghold::new(
        vault_path,
        stronghold_key_from_password(password, salt_path),
    )
    .map_err(|_| AppLockError::new("wrong_password", "Wrong password"))?;

    let verifier = get_password_verifier(&sh)?
        .ok_or_else(|| AppLockError::new("not_initialized", "App lock not initialized"))?;

    let ok = verify_password(password, &verifier)?;
    if !ok {
        return Err(AppLockError::new("wrong_password", "Wrong password"));
    }

    Ok(())
}

pub fn lock_set_startup_lock_enabled_with(
    vault_path: &Path,
    salt_path: &Path,
    enabled: bool,
    password: Option<&str>,
    keychain: &dyn Keychain,
) -> Result<(), AppLockError> {
    if enabled {
        keychain.delete_app_password()?;
        return Ok(());
    }

    let pw = password.ok_or_else(|| AppLockError::new("password_required", "Password required"))?;
    lock_unlock_with(vault_path, salt_path, pw)?;
    keychain.set_app_password(&keychain_marker_from_password(pw, salt_path))?;
    Ok(())
}

pub fn lock_reset_tracer_with(
    vault_path: &Path,
    sqlite_paths: &[PathBuf],
    keychain: &dyn Keychain,
) -> Result<(), AppLockError> {
    keychain.delete_app_password()?;
    remove_vault_file(vault_path)?;

    for db_path in sqlite_paths {
        if db_path.exists() {
            std::fs::remove_file(db_path).map_err(|e| AppLockError::new("io", e.to_string()))?;
        }
    }
    Ok(())
}

pub fn remove_vault_file(path: &Path) -> Result<(), AppLockError> {
    if path.exists() {
        std::fs::remove_file(path).map_err(|e| AppLockError::new("io", e.to_string()))?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::{Mutex, MutexGuard};

    struct InMemoryKeychain {
        value: Mutex<Option<String>>,
    }

    impl InMemoryKeychain {
        fn new() -> Self {
            Self {
                value: Mutex::new(None),
            }
        }

        fn lock(&self) -> MutexGuard<'_, Option<String>> {
            self.value.lock().expect("mutex poisoned")
        }
    }

    impl Keychain for InMemoryKeychain {
        fn get_app_password(&self) -> Result<Option<String>, AppLockError> {
            Ok(self.lock().clone())
        }

        fn set_app_password(&self, password: &str) -> Result<(), AppLockError> {
            *self.lock() = Some(password.to_string());
            Ok(())
        }

        fn delete_app_password(&self) -> Result<(), AppLockError> {
            *self.lock() = None;
            Ok(())
        }
    }

    fn assert_err_code(err: AppLockError, expected: &str) {
        assert_eq!(err.code, expected, "unexpected error: {err:?}");
    }

    #[test]
    fn lock_flow_end_to_end_without_os_keychain() {
        let dir = tempfile::tempdir().expect("tempdir");
        let vault_path = dir.path().join("vault.hold");
        let salt_path = dir.path().join("stronghold_salt.txt");
        let sqlite_path = dir.path().join("tracer.db");
        let kc = InMemoryKeychain::new();

        let pw = "correct horse battery staple";
        lock_first_run_set_password_with(&vault_path, &salt_path, pw).expect("first run set pw");

        let sh = Stronghold::new(&vault_path, stronghold_key_from_password(pw, &salt_path))
            .expect("open stronghold");
        let verifier = get_password_verifier(&sh)
            .expect("read verifier")
            .expect("verifier missing");
        assert!(verify_password(pw, &verifier).expect("verify hash"));

        let err = lock_unlock_with(&vault_path, &salt_path, "wrong password").unwrap_err();
        assert_err_code(err, "wrong_password");
        lock_unlock_with(&vault_path, &salt_path, pw).expect("unlock ok");

        lock_set_startup_lock_enabled_with(&vault_path, &salt_path, false, Some(pw), &kc)
            .expect("disable startup lock");
        let expected_marker = keychain_marker_from_password(pw, &salt_path);
        assert_eq!(
            kc.get_app_password().unwrap().as_deref(),
            Some(expected_marker.as_str())
        );
        let status = lock_get_status_with(&vault_path, &kc).expect("status");
        assert!(status.can_auto_unlock);
        assert!(!status.requires_unlock);

        lock_set_startup_lock_enabled_with(&vault_path, &salt_path, true, None, &kc)
            .expect("enable startup lock");
        assert!(kc.get_app_password().unwrap().is_none());
        let status = lock_get_status_with(&vault_path, &kc).expect("status after enable");
        assert!(status.requires_unlock);

        std::fs::write(&sqlite_path, b"not a real sqlite db").expect("write sqlite");
        assert!(vault_path.exists());
        assert!(sqlite_path.exists());
        kc.set_app_password("marker").unwrap();

        lock_reset_tracer_with(&vault_path, &[sqlite_path.clone()], &kc).expect("reset tracer");
        assert!(!vault_path.exists());
        assert!(!sqlite_path.exists());
        assert!(kc.get_app_password().unwrap().is_none());
    }
}
