# StoreDesk Mobile — Mobile Flow

1. Install Flutter SDK and run `flutter create .` in `store-desk-mobile` if platform folders are missing.
2. Open **StoreDesk Mobile** and enter the StoreDesk Worker URL (`http://<wifi-ip>:4310`).
3. Test connection, then open **Pair Device**.
4. Scan or paste the pairing QR payload from StoreDesk **Mobile Access**, or enter the 6-digit code manually.
5. After pairing, use **Scan**, **Search**, **Upload Invoice**, and **Settings** from Home.

Pairing payload format:

```txt
storedesk://pair?host=192.168.1.25&port=4310&code=123456
```

All invoice uploads go to the desktop review queue. Vendor prices are created only after review confirmation on StoreDesk desktop.
