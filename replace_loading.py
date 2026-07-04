import os
import re

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                process_file(os.path.join(root, file))

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to find places where 'Loading' is rendered to the screen
    # Common patterns:
    # <p>Loading...</p>
    # <p className="t-empty-state">Loading...</p>
    # <div className="t-empty-state">Loading...</div>
    # {loading ? 'Adding...' : ...} (we can skip buttons for now)
    
    modified = False
    
    # 1. Replace <div className="admin-loading-state">...</div>
    old_admin_loader = re.compile(r'<div className="admin-loading-state">\s*<div className="spinner"></div>\s*<p>(.*?)</p>\s*</div>', re.DOTALL)
    if old_admin_loader.search(content):
        content = old_admin_loader.sub(r'<Loader text="\1" />', content)
        modified = True
        
    # 2. Replace <p style={{...}}>Loading...</p> (like in QuizRanklist)
    old_p_loader = re.compile(r'<p style={{.*?}}>Loading(.*?)</p>')
    if old_p_loader.search(content):
        content = old_p_loader.sub(r'<Loader text="Loading\1" />', content)
        modified = True

    # 3. Replace <div className="up-big-spinner" />\s*<p style={{...}}>Loading...</p>
    old_up_loader = re.compile(r'<div className="up-big-spinner" />\s*<p style={{.*?}}>\s*(Loading.*?)\s*</p>')
    if old_up_loader.search(content):
        content = old_up_loader.sub(r'<Loader text="\1" />', content)
        modified = True

    # 4. Replace <p className="t-empty-state">Loading...</p>
    old_t_loader = re.compile(r'<p className="t-empty-state">Loading(.*?)</p>')
    if old_t_loader.search(content):
        content = old_t_loader.sub(r'<Loader text="Loading\1" />', content)
        modified = True
        
    # 5. Replace <div className="t-empty-state">Loading...</div>
    old_t2_loader = re.compile(r'<div className="t-empty-state">\s*<p>Loading(.*?)</p>\s*</div>')
    if old_t2_loader.search(content):
        content = old_t2_loader.sub(r'<Loader text="Loading\1" />', content)
        modified = True
        
    old_t3_loader = re.compile(r'<div className="t-empty-state">Loading(.*?)</div>')
    if old_t3_loader.search(content):
        content = old_t3_loader.sub(r'<Loader text="Loading\1" />', content)
        modified = True
        
    # 6. <p>Loading your analytics...</p>
    old_p_simple = re.compile(r'<p>Loading(.*?)</p>')
    if old_p_simple.search(content):
        content = old_p_simple.sub(r'<Loader text="Loading\1" />', content)
        modified = True
        
    # 7. Button texts: {loading ? 'Processing...' : 'Register User'}
    # We can use an inline loader for these!
    # e.g., {loading ? <Loader type="inline" text="Processing..." /> : 'Register User'}
    old_btn_loader = re.compile(r"\{loading \? '([^']+)' : '([^']+)'\}")
    if old_btn_loader.search(content):
        content = old_btn_loader.sub(r'{loading ? <Loader type="inline" text="\1" /> : "\2"}', content)
        modified = True

    if modified:
        # Add import if missing
        if 'Loader' not in content:
            # Figure out the relative path to components
            # if we are in admin, it's ../components/Loader
            # if we are in student, it's ../components/Loader
            # if we are in components, it's ./Loader
            depth = filepath.replace(os.path.abspath('frontend/src'), '').count(os.sep)
            if 'components' in filepath:
                import_stmt = "import Loader from './Loader';\n"
            else:
                import_stmt = "import Loader from '../components/Loader';\n"
                
            # Insert import after the last import statement
            last_import = 0
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    last_import = i
                    
            lines.insert(last_import + 1, import_stmt)
            content = '\n'.join(lines)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            print(f"Updated {filepath}")

if __name__ == '__main__':
    process_directory(os.path.abspath('frontend/src'))
