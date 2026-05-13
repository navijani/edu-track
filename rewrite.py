import re

with open('studentdb.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Add DROP TABLE IF EXISTS before every CREATE TABLE
new_content = re.sub(r'CREATE TABLE `([^`]+)`', r'DROP TABLE IF EXISTS `\1`;\nCREATE TABLE `\1`', content)

with open('studentdb.sql', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Rewrote studentdb.sql to include DROP TABLE IF EXISTS")
