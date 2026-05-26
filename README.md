# Overlayer Daily Tasks Bot

Bot TypeScript tự động chạy daily tasks Overlayer trên Ethereum Sepolia cho nhiều ví.

## Bot Làm Gì

- Đọc private keys từ `pv.txt`.
- Đọc proxy từ `proxy.txt` nếu có.
- Tự chọn RPC Sepolia đang hoạt động.
- Lấy daily tasks từ Overlayer API nếu có `GLOBAL_AUTH_TOKEN`, nếu không sẽ dùng `task-list.txt`.
- Chạy các task on-chain: mint, stake, send, receive, bridge và dummy transactions.
- Lưu tiến độ vào `progress.json` để chạy lại không làm trùng task đã xong.

## Cấu Trúc

```text
src/
├── api/          # Overlayer API client
├── blockchain/   # Contract addresses và ABIs
├── config/       # RPC và đường dẫn file
├── runner/       # Logic chạy task từng ví
├── storage/      # Đọc/ghi file và progress
├── tasks/        # Load/cache daily tasks
├── utils/        # Proxy, random, user-agent
└── wallets/      # Wallet helpers
```

## Cài Đặt

```bash
npm install
```

Khuyến nghị dùng dotenvx để mã hoá private key/proxy:

```bash
cp .env.example .env
```

Điền private key và proxy vào `.env`:

```env
PRIVATE_KEYS=0x_private_key_1,0x_private_key_2
PROXIES=ip:port:user:pass,ip:port
```

Chạy không proxy qua mạng local:

```env
PRIVATE_KEYS=0x_private_key_1,0x_private_key_2
PROXIES=
```

Mã hoá `.env`:

```bash
npm run secrets:encrypt
```

Giữ `.env.keys` ở máy chạy bot, không commit file này.

Fallback nếu không dùng dotenvx:

Tạo `pv.txt` để điền private key, mỗi dòng một key:

```text
0x_private_key_1
0x_private_key_2
```

Tuỳ chọn tạo `proxy.txt`, mỗi dòng một proxy:

```text
ip:port:user:pass
ip:port
```

Không có proxy thì không cần tạo `proxy.txt`, hoặc để file rỗng. Bot sẽ chạy trực tiếp qua mạng local.

Tuỳ chọn tạo `.env`:

```env
GLOBAL_AUTH_TOKEN=
GLOBAL_AUTH_ADDRESS=
RPC=
```

## Chạy

```bash
npm start
```

Kiểm tra TypeScript:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

## File Không Commit

Các file sau đã nằm trong `.gitignore`:

- `pv.txt`
- `proxy.txt`
- `.env`
- `.env.keys`
- `progress.json`
- `node_modules/`
