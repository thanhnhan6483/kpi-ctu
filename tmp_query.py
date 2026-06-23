import sqlite3, json, datetime, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

conn = sqlite3.connect('C:/Users/NTNhan/.local/share/mimocode/mimocode.db')
cur = conn.cursor()

# Check bash tool calls for errors
cur.execute("""
SELECT m.time_created,
       substr(json_extract(p.data, '$.state.input'), 1, 200) as cmd,
       substr(json_extract(p.data, '$.state.output'), 1, 400) as output
FROM message m
JOIN part p ON p.message_id = m.id
WHERE m.session_id = 'ses_1215cbf42ffeKORVqOHSWKyXsP'
  AND json_extract(m.data, '$.role') = 'assistant'
  AND json_extract(p.data, '$.tool') = 'bash'
  AND json_extract(p.data, '$.state.output') IS NOT NULL
  AND (json_extract(p.data, '$.state.output') LIKE '%error%' 
       OR json_extract(p.data, '$.state.output') LIKE '%Error%'
       OR json_extract(p.data, '$.state.output') LIKE '%FAIL%')
ORDER BY m.time_created
""")
rows = cur.fetchall()

print(f"Bash outputs with errors: {len(rows)}")
print()

for tc, cmd, output in rows:
    tc_dt = datetime.datetime.fromtimestamp(tc/1000).strftime('%H:%M')
    print(f"[{tc_dt}] CMD: {cmd}")
    print(f"  OUTPUT: {output[:300]}")
    print("---")

conn.close()
