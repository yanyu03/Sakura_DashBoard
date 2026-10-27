"""Check the Markdown/CSS integration contract, not snapshots of implementation details."""
from pathlib import Path
import json
import re
import tinycss2
import yaml

root = Path(__file__).resolve().parents[1]
markdown = (root / 'docs/DESIGN-sakuraedu-1.0Sakura.md').read_text(encoding='utf-8')
spec = yaml.safe_load(re.split(r'^---\s*$', markdown, maxsplit=2, flags=re.M)[1])
css = (root / 'src/styles/SakuraEdu_1.0Sakura.css').read_text(encoding='utf-8')
blocks = re.findall(r'```css\s*\n(.*?)```', markdown.split('## CSS Implementation — Full Source')[1], re.S)
assert '\n\n'.join(b.strip() for b in blocks) + '\n' == css, 'Markdown and CSS differ'
assert spec['version'] == '1.0Sakura'
themes = json.loads((root / 'src/data/sakuraStandardThemes.json').read_text(encoding='utf-8'))
assert {t['id'] for t in themes} == set(spec['themes'])
for theme in themes:
    assert theme['primaryHex'] == spec['themes'][theme['id']]['colors']['button-primary-bg']
index = (root / 'src/index.css').read_text(encoding='utf-8')
prelude = '@layer theme, base, legacy, themes, components, motion, responsive, utilities, accessibility;'
assert index.index(prelude) < index.index('@import "tailwindcss"'), 'Layer order must be registered first'

def check_rules(rules):
    for rule in rules:
        assert rule.type != 'error', rule
        if rule.type == 'at-rule' and rule.content is not None:
            check_rules(tinycss2.parse_rule_list(rule.content, skip_comments=True, skip_whitespace=True))
        elif rule.type == 'qualified-rule':
            for declaration in tinycss2.parse_declaration_list(rule.content, skip_comments=True, skip_whitespace=True):
                assert declaration.type != 'error', declaration

bridge = (root / 'src/styles/sakura-standard-bridge.css').read_text(encoding='utf-8')
for stylesheet in [css, bridge]:
    check_rules(tinycss2.parse_stylesheet(stylesheet, skip_comments=True, skip_whitespace=True))
declared = set(re.findall(r'(--sakura-[\w-]+)\s*:', css + bridge))
for match in re.finditer(r'var\((--sakura-[\w-]+)(\s*,)?', css + bridge):
    assert match.group(1) in declared or match.group(2), f'Undefined variable {match.group(1)}'
assert 'prefers-reduced-motion: reduce' in css
assert '.sakura-motion[data-state="leaving"] { opacity: 0; }' in css
print('PASS: Markdown/CSS equality, theme coverage, layer ordering, CSS syntax, variable resolution and reduced-motion fallback.')
