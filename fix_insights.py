import os

p = r'D:\Avenir\Binty\binty\app\modals\insights.tsx'

with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f'Before: {len(lines)} lines')

# Keep first 101 lines, then close with }
kept = lines[:101]
# Ensure line 101 ends with newline
if not kept[-1].endswith('\n'):
    kept[-1] += '\n'

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(kept)
    f.write('}\n')

with open(p, 'r', encoding='utf-8') as f:
    result = f.readlines()

print(f'After: {len(result)} lines')
print('Last 3 lines:')
for i in range(max(0, len(result)-3), len(result)):
    print(f'  {i+1}: {repr(result[i])}')

# Cleanup this script
os.remove(__file__)
print('Done. Script self-deleted.')
