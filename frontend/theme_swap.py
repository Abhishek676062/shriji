import os
import glob

def swap_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to swap: text-navy -> text-cream, text-cream -> text-navy
    # bg-navy -> bg-cream, bg-cream -> bg-navy
    # border-navy -> border-cream, border-cream -> border-navy
    # We will use temporary tokens
    
    content = content.replace('text-navy', 'text_TMP_1')
    content = content.replace('text-cream', 'text-navy')
    content = content.replace('text_TMP_1', 'text-cream')
    
    content = content.replace('bg-navy', 'bg_TMP_1')
    content = content.replace('bg-cream', 'bg-navy')
    content = content.replace('bg_TMP_1', 'bg-cream')
    
    content = content.replace('border-navy', 'border_TMP_1')
    content = content.replace('border-cream', 'border-navy')
    content = content.replace('border_TMP_1', 'border-cream')
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('/home/zaidhasan/Proects/shri_ji/frontend/src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            swap_in_file(os.path.join(root, file))
print("Swapped theme tokens natively!")
