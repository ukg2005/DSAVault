with open('src/pages/PatternDetail.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
if 'import ReactMarkdown' not in text:
    text = text.replace('import { Link, useParams, useNavigate } from ''react-router-dom'';', 'import { Link, useParams, useNavigate } from ''react-router-dom'';\nimport ReactMarkdown from ''react-markdown'';')
text = text.replace('{pattern.notes && <div className=\"detail-notes\">{pattern.notes}</div>}', '{pattern.notes && <div className=\"detail-notes markdown-content\"><ReactMarkdown>{pattern.notes}</ReactMarkdown></div>}')
with open('src/pages/PatternDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
