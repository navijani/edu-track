import os

frontend_src = os.path.join('frontend', 'src')
old_url = 'http://localhost:8080'
new_url = 'https://edu-track-backend.onrender.com'

count = 0
for root, dirs, files in os.walk(frontend_src):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if old_url in content:
                new_content = content.replace(old_url, new_url)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
                print(f"Updated {file_path}")

print(f"Total files updated: {count}")
