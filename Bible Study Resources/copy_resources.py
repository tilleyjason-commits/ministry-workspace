import subprocess, os, shutil

# Use PowerShell to force OneDrive to download the files
src_folder = os.path.expandvars(r'C:\Users\user\OneDrive\Desktop\Bible Resources')
dst_folder = os.path.expandvars(r'C:\Users\user\Desktop\Codex\Ministry\Bible Study Resources')

# Files we want to copy
files_to_copy = [
    'Expositors Bible Commentary Ephesians - Philemon.docx',
    'Vines-Expositary-Dictionary.pdf',
    'The Treasury of Scripture Knowledge.docx',
    'New Testament.docx',
    'A Greek-English Lexicon of the New Testament.pdf',
]

for fname in files_to_copy:
    src = os.path.join(src_folder, fname)
    dst = os.path.join(dst_folder, fname)
    
    if not os.path.exists(src):
        print(f"SKIP: {fname} - not found")
        continue
    
    size = os.path.getsize(src)
    print(f"FOUND: {fname} ({size} bytes)", end="")
    
    try:
        # Try reading first byte to see if it's downloadable
        with open(src, 'rb') as f:
            first_byte = f.read(1)
        
        # If we got here, we can read it - now copy
        if os.path.exists(dst):
            existing_size = os.path.getsize(dst)
            if existing_size > 0:
                print(f" - already exists ({existing_size} bytes), skipping")
                continue
        
        shutil.copy2(src, dst)
        copied_size = os.path.getsize(dst)
        print(f" - COPIED ({copied_size} bytes)")
    except PermissionError:
        print(" - ONLINE-ONLY (needs sync)")
    except Exception as e:
        print(f" - ERROR: {e}")

# Also check Ephesians folder
eph_src = os.path.expandvars(r'C:\Users\user\OneDrive\Desktop\Ephesians')
if os.path.exists(eph_src):
    for fname in os.listdir(eph_src):
        if fname.endswith('.docx'):
            src = os.path.join(eph_src, fname)
            dst = os.path.join(dst_folder, fname)
            size = os.path.getsize(src)
            print(f"FOUND: Eph {fname} ({size} bytes)", end="")
            try:
                with open(src, 'rb') as f:
                    f.read(1)
                if os.path.exists(dst) and os.path.getsize(dst) > 0:
                    print(" - already exists, skipping")
                    continue
                shutil.copy2(src, dst)
                print(" - COPIED")
            except PermissionError:
                print(" - ONLINE-ONLY")
            except Exception as e:
                print(f" - ERROR: {e}")

print("\nDone!")