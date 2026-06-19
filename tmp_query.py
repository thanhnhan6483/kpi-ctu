import sqlite3
conn = sqlite3.connect('C:/Users/NTNhan/.local/share/mimocode/mimocode.db')
cur = conn.cursor()
cur.execute("SELECT * FROM project")
rows = cur.fetchall()
for r in rows:
    print(r)
conn.close()
