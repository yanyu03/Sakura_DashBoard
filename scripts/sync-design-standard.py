"""Generate the preview adapter from the checked-in DESIGN Markdown (requires PyYAML)."""
from pathlib import Path
import json
import re
import yaml

root = Path(__file__).resolve().parents[1]
md = (root / 'docs/DESIGN-sakuraedu-1.0Sakura.md').read_text(encoding='utf-8')
spec = yaml.safe_load(re.split(r'^---\s*$', md, maxsplit=2, flags=re.M)[1])
blocks = re.findall(r'```css\s*\n(.*?)```', md.split('## CSS Implementation — Full Source')[1], re.S)
assert len(blocks) == 8
(root / 'src/styles/SakuraEdu_1.0Sakura.css').write_text('\n\n'.join(b.strip() for b in blocks) + '\n', encoding='utf-8')
themes = []
for key, theme in spec['themes'].items():
    colors = theme['colors']
    description = theme['description']
    if key == 'sakura-milk':
        description = '浅粉白画布与绯红强调色，温和清晰，适合日常教学协同。'
    elif key == 'midnight-cyan':
        description = '深蓝画布与青色强调，适合夜间备课与数据浏览。'
    themes.append(dict(id=key, name=theme['name'], shortLabel=theme['name'], badge='1.0Sakura', sourceRef='SakuraEdu · 1.0Sakura', description=description, primaryHex=colors['button-primary-bg'], secondaryHex=colors['text-brand'], surfaceHex=colors['surface-canvas'], radiusSpec='按钮 6px / 卡片 12px'))
(root / 'src/data/sakuraStandardThemes.json').write_text(json.dumps(themes, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# Tailwind utilities keep the product layout; semantic variables resolve from the standard.
mapping = {
    'background': 'surface-canvas', 'surface': 'surface-canvas', 'surface-bright': 'surface-card',
    'surface-dim': 'surface-accent', 'surface-container-lowest': 'surface-card',
    'surface-container-low': 'surface-muted', 'surface-container': 'surface-accent',
    'surface-container-high': 'surface-accent', 'surface-container-highest': 'border-default',
    'surface-variant': 'surface-accent', 'on-background': 'text-primary', 'on-surface': 'text-primary',
    'on-surface-variant': 'text-secondary', 'inverse-surface': 'text-primary',
    'inverse-on-surface': 'surface-card', 'outline': 'text-muted', 'outline-variant': 'border-default',
    'surface-tint': 'text-brand', 'primary': 'button-primary-bg', 'on-primary': 'button-primary-text',
    'primary-container': 'primary-100', 'on-primary-container': 'primary-800',
    'inverse-primary': 'primary-300', 'primary-fixed': 'primary-100', 'primary-fixed-dim': 'primary-200',
    'on-primary-fixed': 'primary-900', 'on-primary-fixed-variant': 'primary-800',
    'secondary': 'button-primary-bg', 'on-secondary': 'button-primary-text', 'secondary-container': 'primary-100',
    'on-secondary-container': 'primary-800', 'secondary-fixed': 'primary-100', 'secondary-fixed-dim': 'primary-200',
    'on-secondary-fixed': 'primary-900', 'on-secondary-fixed-variant': 'primary-800',
    'tertiary': 'text-brand', 'on-tertiary': 'button-primary-text', 'tertiary-container': 'surface-accent',
    'on-tertiary-container': 'text-primary', 'tertiary-fixed': 'surface-muted', 'tertiary-fixed-dim': 'surface-accent',
    'on-tertiary-fixed': 'text-primary', 'on-tertiary-fixed-variant': 'text-secondary',
    'error': 'danger', 'on-error': 'text-inverse', 'error-container': 'danger-bg', 'on-error-container': 'danger',
}
css = '/* Generated semantic bridge; do not change the product layout. */\n[data-design-standard="1.0Sakura"] {\n'
for target, source in mapping.items():
    assert source in spec['colors']
    css += f'  --color-{target}: var(--sakura-{source});\n'
for key, source in dict(xs='xs', sm='sm', md='md', lg='sm', xl='lg', **{'2xl':'xl','3xl':'xl'}).items():
    css += f'  --radius-{key}: var(--sakura-radius-{source});\n'
css += '}\n'
# Dark palettes need surface-based containers rather than the light primary ramp.
css += '[data-design-standard="1.0Sakura"][data-theme="midnight-cyan"] {\n'
for name in ['primary', 'secondary', 'tertiary']:
    for suffix in ['container', 'fixed', 'fixed-dim']:
        css += f'  --color-{name}-{suffix}: var(--sakura-surface-accent);\n'
    for suffix in ['container', 'fixed', 'fixed-variant']:
        css += f'  --color-on-{name}-{suffix}: var(--sakura-text-primary);\n'
css += '}\n'
css += '''[data-design-standard="1.0Sakura"] .sakura-btn {
  min-height: var(--sakura-control-height);
  border-radius: var(--sakura-radius-sm);
  transition-property: background-color, color, border-color, box-shadow, transform;
  transition-duration: var(--sakura-duration-fast);
  transition-timing-function: var(--sakura-ease-standard);
}
[data-design-standard="1.0Sakura"] .sakura-input { border-radius: var(--sakura-radius-sm); }
[data-design-standard="1.0Sakura"] .sakura-btn-primary {
  background: var(--sakura-button-primary-bg);
  color: var(--sakura-button-primary-text);
}
[data-design-standard="1.0Sakura"] .sakura-btn-primary:hover { background: var(--sakura-primary-700); }
[data-design-standard="1.0Sakura"][data-theme="midnight-cyan"] .sakura-btn-primary:hover { background: #155e75; }
[data-design-standard="1.0Sakura"][data-theme="midnight-cyan"] .sakura-btn-secondary {
  background: var(--sakura-surface-muted);
  color: var(--sakura-text-primary);
  border-color: var(--sakura-border-default);
}
[data-design-standard="1.0Sakura"][data-theme="midnight-cyan"] .sakura-btn-secondary:hover,
[data-design-standard="1.0Sakura"][data-theme="midnight-cyan"] .sakura-btn-ghost:hover {
  background: var(--sakura-surface-accent);
  color: var(--sakura-text-primary);
}
/* All existing utilities also honor the standard's reduced-motion contract. */
@media (prefers-reduced-motion: reduce) {
  [data-design-standard="1.0Sakura"] *,
  [data-design-standard="1.0Sakura"] *::before,
  [data-design-standard="1.0Sakura"] *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
  [data-design-standard="1.0Sakura"] button { transform: none !important; }
}
/* Legacy decorative status pings are not actual pending requests. */
[data-design-standard="1.0Sakura"] .animate-ping,
[data-design-standard="1.0Sakura"] .animate-pulse { animation: none; }
@media (max-width: 767px) {
  [data-design-standard="1.0Sakura"] .sakura-btn,
  [data-design-standard="1.0Sakura"] .sakura-input { min-height: var(--sakura-touch-target); }
}
'''
(root / 'src/styles/sakura-standard-bridge.css').write_text(css, encoding='utf-8')
print('Synced standard CSS, 7 themes and Tailwind semantic bridge from Markdown.')
