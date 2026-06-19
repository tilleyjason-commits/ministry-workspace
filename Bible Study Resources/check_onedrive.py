import os, shutil

# Try reading the OneDrive file to force download
src = os.path.expandvars(r'C:\Users\user\OneDrive\Desktop\Bible Resources\Expositors Bible Commentary Ephesians - Philemon.docx')
dst = os.path.expandvars(r'C:\Users\user\Desktop\Codex\Ministry\Bible Study Resources\Expositors Bible Commentary Ephesians - Philemon.docx')

print(f"Source: {src}")
print(f"Exists: {os.path.exists(src)}")

try:
    with open(src, 'rb') as f:
        data = f.read(8192)
    print(f"Read {len(data)} bytes - file is downloadable")
    # Now copy it
    with open(src, 'rb') as fin:
        with open(dst, 'wb') as fout:
            bytes_copied = 0
            while True:
                chunk = fin.read(65536)
                if not chunk:
                    break
                fout.write(chunk)
                bytes_copied += len(chunk)
    print(f"Copied {bytes_copied} bytes to {dst}")
except PermissionError:
    print("Permission denied - file is cloud-only (OneDrive online-only)")
    print("Right-click the Bible Resources folder in OneDrive and select")
    print("'Always keep on this device' to sync files locally.")
except FileNotFoundError:
    print("File not found - may be an alternate path")
except Exception as e:
    print(f"Error: {e}")

free_gb = shutil.disk_usage('C:\\').free / 1024**3
print(f"\nDisk free: {free_gb:.1f} GB")