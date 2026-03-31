mod security;

use crate::security::Keychain;
use rand_core::RngCore;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri_plugin_opener::OpenerExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use tauri::Manager;
    use tauri_plugin_sql::{Migration, MigrationKind};
    
    let migrations = vec![Migration {
        version: 1,
        description: "create_core_tables",
        sql: include_str!("../migrations/001_core.sql"),
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .setup(|app| {
            let salt_path = app
                .path()
                .app_local_data_dir()
                .expect("could not resolve app local data path")
                .join("stronghold_salt.txt");
            app.handle()
                .plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;

            app.manage(VaultKeyState(Mutex::new(None)));
            app.manage(GithubPkceState(Mutex::new(HashMap::new())));
            Ok(())
        })
        .plugin(tauri_plugin_http::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:tracer.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            lock_get_status,
            lock_first_run_set_password,
            lock_unlock,
            lock_set_startup_lock_enabled,
            lock_reset_tracer,
            ai_secrets_get,
            ai_secrets_set,
            ai_secrets_delete,
            ai_openai_compat_get_config,
            ai_openai_compat_set_config,
            open_external,
            github_oauth_pkce_start,
            github_oauth_pkce_finish,
            github_oauth_pkce_cancel
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}

#[derive(Debug)]
struct VaultKeyState(std::sync::Mutex<Option<Vec<u8>>>);

#[derive(Debug)]
struct GithubPkceState(Mutex<HashMap<String, GithubPkceListener>>);

#[derive(Debug)]
struct GithubPkceListener {
    receiver: tokio::sync::oneshot::Receiver<GithubPkceCallback>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
struct GithubPkceCallback {
    code: String,
    state: String,
}

#[derive(Debug, serde::Serialize)]
struct GithubPkceStartResult {
    id: String,
    port: u16,
}

fn set_vault_key(state: &tauri::State<'_, VaultKeyState>, key: Vec<u8>) {
    *state.0.lock().expect("vault key mutex") = Some(key);
}

fn clear_vault_key(state: &tauri::State<'_, VaultKeyState>) {
    *state.0.lock().expect("vault key mutex") = None;
}

fn get_vault_key_from_state(state: &tauri::State<'_, VaultKeyState>) -> Option<Vec<u8>> {
    state.0.lock().expect("vault key mutex").clone()
}

fn open_unlocked_stronghold(
    app: &tauri::AppHandle,
    key_state: &tauri::State<'_, VaultKeyState>,
) -> Result<tauri_plugin_stronghold::stronghold::Stronghold, security::AppLockError> {
    let vault_path = security::vault_path(app)?;
    if !vault_path.exists() {
        return Err(security::AppLockError::new(
            "not_initialized",
            "App lock not initialized",
        ));
    }

    let key = if let Some(k) = get_vault_key_from_state(key_state) {
        k
    } else {
        let marker = security::OsKeychain
            .get_app_password()?
            .ok_or_else(|| security::AppLockError::new("vault_locked", "Your vault is locked"))?;
        security::deobfuscate_bytes_from_keychain(&marker)?
    };

    tauri_plugin_stronghold::stronghold::Stronghold::new(&vault_path, key)
        .map_err(|e| security::AppLockError::new("stronghold", e.to_string()))
}

fn random_id_hex(bytes: usize) -> String {
    let mut buf = vec![0u8; bytes];
    rand_core::OsRng.fill_bytes(&mut buf);
    const LUT: &[u8; 16] = b"0123456789abcdef";
    let mut out = String::with_capacity(bytes * 2);
    for b in buf {
        out.push(LUT[(b >> 4) as usize] as char);
        out.push(LUT[(b & 0x0f) as usize] as char);
    }
    out
}

fn parse_query_param(query: &str, key: &str) -> Option<String> {
    for pair in query.split('&') {
        let mut it = pair.splitn(2, '=');
        let k = it.next()?;
        let v = it.next().unwrap_or("");
        if k == key {
            return Some(urlencoding::decode(v).ok()?.to_string());
        }
    }
    None
}

async fn handle_pkce_http_once(
    listener: tokio::net::TcpListener,
    sender: tokio::sync::oneshot::Sender<GithubPkceCallback>,
) {
    let accept = listener.accept().await;
    if accept.is_err() {
        return;
    }
    let (stream, _) = accept.expect("accepted");

    let mut buf = vec![0u8; 8192];
    let n = match stream.try_read(&mut buf) {
        Ok(n) => n,
        Err(_) => 0,
    };
    let req = String::from_utf8_lossy(&buf[..n]).to_string();
    let line = req.lines().next().unwrap_or("");

    let mut code: Option<String> = None;
    let mut state: Option<String> = None;
    if let Some(path) = line.split_whitespace().nth(1) {
        if let Some((p, q)) = path.split_once('?') {
            if p == "/callback" {
                code = parse_query_param(q, "code");
                state = parse_query_param(q, "state");
            }
        }
    }

    if let (Some(c), Some(s)) = (code, state) {
        let _ = sender.send(GithubPkceCallback { code: c, state: s });
    }

    let body = "<html><body><p>Authentication complete. You can close this window.</p></body></html>";
    let resp = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        body.as_bytes().len(),
        body
    );
    let _ = stream.try_write(resp.as_bytes());
}

#[tauri::command]
async fn open_external(app: tauri::AppHandle, url: String) -> Result<(), security::AppLockError> {
    if url.trim().is_empty() {
        return Err(security::AppLockError::new("invalid_url", "URL is required"));
    }
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|e| security::AppLockError::new("opener", e.to_string()))
}

#[tauri::command]
async fn github_oauth_pkce_start(
    state: tauri::State<'_, GithubPkceState>,
) -> Result<GithubPkceStartResult, security::AppLockError> {
    let id = random_id_hex(16);
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|e| security::AppLockError::new("listen", e.to_string()))?;
    let port = listener
        .local_addr()
        .map_err(|e| security::AppLockError::new("listen", e.to_string()))?
        .port();

    let (tx, rx) = tokio::sync::oneshot::channel();
    {
        let mut map = state.0.lock().expect("pkce state mutex");
        map.insert(
            id.clone(),
            GithubPkceListener {
                receiver: rx,
            },
        );
    }

    tauri::async_runtime::spawn(handle_pkce_http_once(listener, tx));

    Ok(GithubPkceStartResult { id, port })
}

#[derive(Debug, serde::Deserialize)]
struct GithubPkceFinishArgs {
    #[serde(rename = "expectedState")]
    expected_state: String,
    #[serde(rename = "timeoutMs")]
    timeout_ms: Option<u64>,
}

#[tauri::command]
async fn github_oauth_pkce_finish(
    state: tauri::State<'_, GithubPkceState>,
    id: String,
    args: GithubPkceFinishArgs,
) -> Result<GithubPkceCallback, security::AppLockError> {
    let mut listener = {
        let mut map = state.0.lock().expect("pkce state mutex");
        map.remove(&id)
    }
    .ok_or_else(|| security::AppLockError::new("not_found", "PKCE listener not found"))?;

    let timeout = args.timeout_ms.unwrap_or(120_000);
    let result = tokio::time::timeout(
        std::time::Duration::from_millis(timeout),
        &mut listener.receiver,
    )
    .await
    .map_err(|_| security::AppLockError::new("timeout", "OAuth callback timed out"))?;
    let cb = result.map_err(|_| security::AppLockError::new("cancelled", "OAuth callback cancelled"))?;
    if cb.state != args.expected_state {
        return Err(security::AppLockError::new("invalid_state", "OAuth state mismatch"));
    }
    Ok(cb)
}

#[tauri::command]
async fn github_oauth_pkce_cancel(
    state: tauri::State<'_, GithubPkceState>,
    id: String,
) -> Result<(), security::AppLockError> {
    let _ = {
        let mut map = state.0.lock().expect("pkce state mutex");
        map.remove(&id)
    };
    Ok(())
}

use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct AiOpenAiCompatSetArgs {
    #[serde(rename = "configJson")]
    config_json: String,
}

fn map_ai_kind_to_store_key(kind: &str) -> Option<&'static str> {
    match kind {
        "openai_api_key" => Some(security::STRONGHOLD_STORE_KEY_OPENAI_API_KEY),
        "anthropic_api_key" => Some(security::STRONGHOLD_STORE_KEY_ANTHROPIC_API_KEY),
        "gemini_api_key" => Some(security::STRONGHOLD_STORE_KEY_GEMINI_API_KEY),
        "github_models_token" => Some(security::STRONGHOLD_STORE_KEY_GITHUB_MODELS_TOKEN),
        "openai_compat_api_key" => Some(security::STRONGHOLD_STORE_KEY_OPENAI_COMPAT_API_KEY),
        _ => None,
    }
}

#[tauri::command]
async fn ai_secrets_delete(
    app: tauri::AppHandle,
    key_state: tauri::State<'_, VaultKeyState>,
    kind: String,
) -> Result<(), security::AppLockError> {
    let stronghold = open_unlocked_stronghold(&app, &key_state)?;
    let key = map_ai_kind_to_store_key(&kind)
        .ok_or_else(|| security::AppLockError::new("invalid_kind", "Unknown credential kind"))?;
    security::stronghold_store_delete_if_present(&stronghold, key)
}

#[tauri::command]
async fn ai_secrets_get(
    app: tauri::AppHandle,
    key_state: tauri::State<'_, VaultKeyState>,
    kind: String,
) -> Result<Option<String>, security::AppLockError> {
    let stronghold = open_unlocked_stronghold(&app, &key_state)?;
    let key = map_ai_kind_to_store_key(&kind)
        .ok_or_else(|| security::AppLockError::new("invalid_kind", "Unknown credential kind"))?;
    security::stronghold_store_get(&stronghold, key)
}

#[tauri::command]
async fn ai_secrets_set(
    app: tauri::AppHandle,
    key_state: tauri::State<'_, VaultKeyState>,
    kind: String,
    value: String,
) -> Result<(), security::AppLockError> {
    let stronghold = open_unlocked_stronghold(&app, &key_state)?;
    let key = map_ai_kind_to_store_key(&kind)
        .ok_or_else(|| security::AppLockError::new("invalid_kind", "Unknown credential kind"))?;
    security::stronghold_store_set(&stronghold, key, value.trim())
}

#[tauri::command]
async fn ai_openai_compat_get_config(
    app: tauri::AppHandle,
    key_state: tauri::State<'_, VaultKeyState>,
) -> Result<Option<String>, security::AppLockError> {
    let stronghold = open_unlocked_stronghold(&app, &key_state)?;
    security::stronghold_store_get(
        &stronghold,
        security::STRONGHOLD_STORE_KEY_OPENAI_COMPAT_CONFIG_JSON,
    )
}

#[tauri::command]
async fn ai_openai_compat_set_config(
    app: tauri::AppHandle,
    key_state: tauri::State<'_, VaultKeyState>,
    args: AiOpenAiCompatSetArgs,
) -> Result<(), security::AppLockError> {
    let stronghold = open_unlocked_stronghold(&app, &key_state)?;
    security::stronghold_store_set(
        &stronghold,
        security::STRONGHOLD_STORE_KEY_OPENAI_COMPAT_CONFIG_JSON,
        args.config_json.trim(),
    )
}

#[tauri::command]
async fn lock_get_status(app: tauri::AppHandle) -> Result<security::AppLockStatus, security::AppLockError> {
    let vault_path = security::vault_path(&app)?;
    security::lock_get_status_with(&vault_path, &security::OsKeychain)
}

#[tauri::command]
async fn lock_first_run_set_password(
    app: tauri::AppHandle,
    key_state: tauri::State<'_, VaultKeyState>,
    password: String,
) -> Result<(), security::AppLockError> {
    let path = security::vault_path(&app)?;
    let salt_path = security::stronghold_salt_path(&app)?;
    security::lock_first_run_set_password_with(&path, &salt_path, &password)?;
    set_vault_key(&key_state, security::stronghold_key_from_password(&password, &salt_path));
    Ok(())
}

#[tauri::command]
async fn lock_unlock(
    app: tauri::AppHandle,
    key_state: tauri::State<'_, VaultKeyState>,
    password: String,
) -> Result<(), security::AppLockError> {
    let path = security::vault_path(&app)?;
    let salt_path = security::stronghold_salt_path(&app)?;
    security::lock_unlock_with(&path, &salt_path, &password)?;
    set_vault_key(&key_state, security::stronghold_key_from_password(&password, &salt_path));
    Ok(())
}

#[tauri::command]
async fn lock_set_startup_lock_enabled(
    app: tauri::AppHandle,
    key_state: tauri::State<'_, VaultKeyState>,
    enabled: bool,
    password: Option<String>,
) -> Result<(), security::AppLockError> {
    let path = security::vault_path(&app)?;
    let salt_path = security::stronghold_salt_path(&app)?;
    security::lock_set_startup_lock_enabled_with(
        &path,
        &salt_path,
        enabled,
        password.as_deref(),
        &security::OsKeychain,
    )?;

    if let Some(pw) = password.as_deref() {
        set_vault_key(&key_state, security::stronghold_key_from_password(pw, &salt_path));
    }
    Ok(())
}

#[tauri::command]
async fn lock_reset_tracer(
    app: tauri::AppHandle,
    key_state: tauri::State<'_, VaultKeyState>,
) -> Result<(), security::AppLockError> {
    let vault_path = security::vault_path(&app)?;
    let sqlite_paths = security::possible_sqlite_paths(&app)?;
    clear_vault_key(&key_state);
    security::lock_reset_tracer_with(&vault_path, &sqlite_paths, &security::OsKeychain)
}
