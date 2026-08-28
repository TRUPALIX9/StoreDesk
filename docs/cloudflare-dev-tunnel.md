# Cloudflare Development Tunnel Connector

To connect the development tunnel to Cloudflare for remote management and persistent development testing, you can install the `cloudflared` service using the following token.

## Windows Installation Instructions

1. Download the latest `cloudflared` installer for Windows:
   [https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi](https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi)
2. Run the installer.
3. Open Command Prompt as **Administrator**.
4. Run the following command:

```bash
cloudflared.exe service install eyJhIjoiOGZmNWNhYTU2NDgwOTY5NDE1YjEzNmM0NWI3MzkwMzMiLCJ0IjoiNTRiMjZhNjAtNmE2ZS00ZjRmLTllMmQtZDE2YzYxOTYwYzZkIiwicyI6Ik1URTVNbVF3TVRJdE9UTTBOQzAwWlROaExXSmlOREF0T0dObU9EQm1ZVGd3TldRMiJ9
```

Once installed, the connector will automatically show up in the Zero Trust dashboard.

> **Note:** This command includes a sensitive token that allows the connector to run. Anyone with access to this token will be able to run the tunnel. Keep it secure and only use it for the authorized development environment.
