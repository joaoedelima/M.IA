const STORAGE_KEY = 'mia_studio_project_v2';

const el = {
  visualEditor: document.getElementById('visualEditor'),
  htmlCode: document.getElementById('htmlCode'),
  cssCode: document.getElementById('cssCode'),
  jsCode: document.getElementById('jsCode'),
  previewFrame: document.getElementById('previewFrame'),
  projectName: document.getElementById('projectName'),
  projectTags: document.getElementById('projectTags'),
  autosaveStatus: document.getElementById('autosaveStatus'),
  blockGrid: document.getElementById('blockGrid'),
  templatePicker: document.getElementById('templatePicker'),
};

const templates = {
  landing: {
    name: 'Landing de Conversão',
    html: `<section style="padding:36px;background:linear-gradient(135deg,#0f766e,#0ea5e9);color:white;border-radius:14px"><h1>Produto Incrível</h1><p>Converta mais com uma página pronta para vendas.</p><a href="#" style="display:inline-block;padding:10px 16px;border:1px solid #fff;color:#fff;border-radius:8px;text-decoration:none">Quero conhecer</a></section>`,
    css: `body{font-family:Arial,sans-serif;margin:20px;line-height:1.5}`,
    js: '',
  },
  newsletter: {
    name: 'Newsletter',
    html: `<h1>Newsletter Semanal</h1><p>Olá, confira os destaques da semana:</p><ul><li>Novidade 1</li><li>Novidade 2</li></ul>`,
    css: `body{font-family:Georgia,serif;margin:20px;color:#111827}`,
    js: '',
  }
};

const blocks = [
  { label: 'Hero CTA', html: '<section><h1>Título principal</h1><p>Subtítulo com proposta de valor.</p><a href="#">Call to action</a></section>' },
  { label: '2 Colunas', html: '<section style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div><h3>Coluna A</h3><p>Texto...</p></div><div><h3>Coluna B</h3><p>Texto...</p></div></section>' },
  { label: 'Card', html: '<article style="padding:16px;border:1px solid #ddd;border-radius:12px"><h3>Card</h3><p>Conteúdo do card.</p></article>' },
  { label: 'FAQ', html: '<section><h2>Perguntas frequentes</h2><details><summary>Pergunta 1</summary><p>Resposta.</p></details></section>' },
  { label: 'Rodapé', html: '<footer><p>© 2026 Minha Empresa</p></footer>' },
  { label: 'Botão', html: '<a href="#" style="display:inline-block;padding:10px 16px;background:#0ea5e9;color:white;border-radius:8px;text-decoration:none">Botão</a>' },
];

function buildDocument() {
  return `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${el.cssCode.value}</style></head><body>${el.htmlCode.value}<script>${el.jsCode.value}<'/script></body></html>`;
}

function refreshPreview() {
  el.previewFrame.srcdoc = buildDocument().replace("<'/script>", '</script>');
}

function persistProject() {
  const payload = {
    name: el.projectName.value,
    tags: el.projectTags.value,
    html: el.htmlCode.value,
    css: el.cssCode.value,
    js: el.jsCode.value,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  el.autosaveStatus.textContent = `Auto-save: ${new Date().toLocaleTimeString('pt-BR')}`;
}

function applyProject(project) {
  el.projectName.value = project.name || 'Projeto sem nome';
  el.projectTags.value = project.tags || '';
  el.htmlCode.value = project.html || '';
  el.cssCode.value = project.css || '';
  el.jsCode.value = project.js || '';
  el.visualEditor.innerHTML = el.htmlCode.value;
  refreshPreview();
}

function restoreProject() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return applyProject(templates.landing);
  try { applyProject(JSON.parse(raw)); } catch { applyProject(templates.landing); }
}

function syncFromVisual() {
  el.htmlCode.value = el.visualEditor.innerHTML;
  refreshPreview();
  persistProject();
}

function cssToInlineStyleMap(cssText) {
  return cssText.split('}').map(rule => {
    const [selector, body] = rule.split('{');
    if (!selector || !body) return null;
    return { selector: selector.trim(), style: body.trim().replace(/\s+/g, ' ') };
  }).filter(Boolean);
}

function generateEmailHtml() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = el.htmlCode.value;
  cssToInlineStyleMap(el.cssCode.value).forEach(({ selector, style }) => {
    try {
      wrapper.querySelectorAll(selector).forEach(node => node.setAttribute('style', `${node.getAttribute('style') || ''};${style}`));
    } catch {}
  });
  return `<!doctype html><html><body style="margin:0;padding:0"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="640" cellspacing="0" cellpadding="0"><tr><td>${wrapper.innerHTML}</td></tr></table></td></tr></table></body></html>`;
}

function download(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatHtml(value) {
  return value.replace(/></g, '>\n<');
}

// Toolbar
document.querySelectorAll('[data-cmd]').forEach(btn => btn.addEventListener('click', () => {
  document.execCommand(btn.dataset.cmd, false);
  syncFromVisual();
}));

document.getElementById('btnAddImage').addEventListener('click', () => {
  const url = prompt('URL da imagem'); if (!url) return;
  document.execCommand('insertImage', false, url); syncFromVisual();
});

document.getElementById('btnAddLink').addEventListener('click', () => {
  const url = prompt('URL do link'); if (!url) return;
  document.execCommand('createLink', false, url); syncFromVisual();
});

document.getElementById('btnInsertTable').addEventListener('click', () => {
  document.execCommand('insertHTML', false, '<table border="1" cellpadding="8"><tr><th>Título</th><th>Título</th></tr><tr><td>Item</td><td>Item</td></tr></table>');
  syncFromVisual();
});

// Blocks + Templates
blocks.forEach(block => {
  const btn = document.createElement('button');
  btn.textContent = block.label;
  btn.addEventListener('click', () => {
    document.execCommand('insertHTML', false, block.html);
    syncFromVisual();
  });
  el.blockGrid.appendChild(btn);
});

Object.entries(templates).forEach(([key, tpl]) => {
  const option = document.createElement('option');
  option.value = key;
  option.textContent = tpl.name;
  el.templatePicker.appendChild(option);
});

document.getElementById('btnApplyTemplate').addEventListener('click', () => {
  applyProject(templates[el.templatePicker.value]);
  persistProject();
});

// Code tabs + actions
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  [el.htmlCode, el.cssCode, el.jsCode].forEach(area => area.classList.toggle('hidden', area.id !== tab.dataset.target));
}));

document.getElementById('btnApplyCode').addEventListener('click', () => { el.visualEditor.innerHTML = el.htmlCode.value; refreshPreview(); persistProject(); });
document.getElementById('btnSyncFromVisual').addEventListener('click', syncFromVisual);
document.getElementById('btnFormatHtml').addEventListener('click', () => { el.htmlCode.value = formatHtml(el.htmlCode.value); persistProject(); });

el.visualEditor.addEventListener('input', syncFromVisual);
[el.cssCode, el.jsCode, el.projectName, el.projectTags].forEach(node => node.addEventListener('input', () => { refreshPreview(); persistProject(); }));

// Exports

document.getElementById('btnExportHtml').addEventListener('click', () => download('pagina.html', buildDocument(), 'text/html'));
document.getElementById('btnExportEmail').addEventListener('click', () => download('email-template.html', generateEmailHtml(), 'text/html'));
document.getElementById('btnExportPdf').addEventListener('click', () => window.print());
document.getElementById('btnExportPpt').addEventListener('click', () => {
  const slides = el.htmlCode.value.split(/<h[1-3][^>]*>/i).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean).map((s, i) => `Slide ${i + 1}\n${s}`).join('\n\n');
  download('apresentacao-outline.txt', slides || 'Slide 1\nConteúdo');
});

document.getElementById('btnExportProject').addEventListener('click', () => download('projeto-mia.json', localStorage.getItem(STORAGE_KEY) || '{}', 'application/json'));
document.getElementById('btnImportProject').addEventListener('click', () => document.getElementById('importProjectFile').click());
document.getElementById('importProjectFile').addEventListener('change', async (ev) => {
  const file = ev.target.files?.[0]; if (!file) return;
  applyProject(JSON.parse(await file.text()));
  persistProject();
});

document.getElementById('btnImportHtml').addEventListener('click', () => document.getElementById('importHtmlFile').click());
document.getElementById('importHtmlFile').addEventListener('change', async (ev) => {
  const file = ev.target.files?.[0]; if (!file) return;
  el.htmlCode.value = await file.text();
  el.visualEditor.innerHTML = el.htmlCode.value;
  refreshPreview();
  persistProject();
});

document.getElementById('btnNew').addEventListener('click', () => {
  applyProject(templates.landing);
  persistProject();
});

document.querySelectorAll('.preview-actions button').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.preview-actions button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  el.previewFrame.classList.remove('mobile', 'tablet');
  if (btn.dataset.device !== 'desktop') el.previewFrame.classList.add(btn.dataset.device);
}));

restoreProject();
refreshPreview();


// Quality analyzers + undo/redo stack
const historyStack = [];
let historyIndex = -1;
const analysisOutput = document.getElementById('analysisOutput');

function pushHistory() {
  const state = JSON.stringify({ html: el.htmlCode.value, css: el.cssCode.value, js: el.jsCode.value });
  if (historyStack[historyIndex] === state) return;
  historyStack.splice(historyIndex + 1);
  historyStack.push(state);
  historyIndex = historyStack.length - 1;
}

function applyHistory(state) {
  const data = JSON.parse(state);
  el.htmlCode.value = data.html;
  el.cssCode.value = data.css;
  el.jsCode.value = data.js;
  el.visualEditor.innerHTML = data.html;
  refreshPreview();
  persistProject();
}

function analyzeSeo() {
  const html = el.htmlCode.value;
  const checks = [];
  checks.push(/<h1[\s>]/i.test(html) ? '✅ Possui H1' : '⚠️ Falta H1 principal');
  checks.push(/<meta[^>]+name=["']description["']/i.test(buildDocument()) ? '✅ Meta description detectada' : '⚠️ Falta meta description');
  checks.push(/<img/i.test(html) ? ((html.match(/<img[^>]+alt=/gi)||[]).length > 0 ? '✅ Imagens com ALT detectadas' : '⚠️ Existem imagens sem ALT') : 'ℹ️ Nenhuma imagem detectada');
  checks.push(html.length > 300 ? '✅ Conteúdo com tamanho razoável' : '⚠️ Conteúdo muito curto para SEO');
  analysisOutput.textContent = `Relatório SEO\n\n${checks.join('\n')}`;
}

function analyzeA11y() {
  const html = el.htmlCode.value;
  const checks = [];
  checks.push(/<button/i.test(html) || /<a/i.test(html) ? '✅ Elementos interativos presentes' : '⚠️ Falta elementos interativos');
  checks.push(/aria-/i.test(html) ? '✅ Atributos ARIA encontrados' : '⚠️ Considere incluir atributos ARIA');
  checks.push((html.match(/<img[^>]+alt=/gi) || []).length > 0 ? '✅ Imagens com ALT' : '⚠️ Falta ALT em imagens');
  checks.push(/<table/i.test(html) ? '⚠️ Verifique semântica de tabelas para leitores de tela' : '✅ Sem tabelas complexas');
  analysisOutput.textContent = `Relatório Acessibilidade\n\n${checks.join('\n')}`;
}

function analyzeEmail() {
  const css = el.cssCode.value;
  const checks = [];
  checks.push(/position\s*:\s*fixed/i.test(css) ? '⚠️ position:fixed tem baixa compatibilidade em email' : '✅ Sem uso de position:fixed');
  checks.push(/display\s*:\s*grid/i.test(css) ? '⚠️ CSS Grid pode falhar em Outlook' : '✅ Sem CSS Grid crítico');
  checks.push(/@media/i.test(css) ? '✅ Media queries detectadas' : 'ℹ️ Sem media queries (email responsivo pode ficar limitado)');
  checks.push(/<table/i.test(el.htmlCode.value) ? '✅ Estrutura com tabelas presente (bom para email)' : '⚠️ Considere estrutura por tabelas para email');
  analysisOutput.textContent = `Relatório Compatibilidade Email\n\n${checks.join('\n')}`;
}

document.getElementById('btnAnalyzeSeo').addEventListener('click', analyzeSeo);
document.getElementById('btnAnalyzeA11y').addEventListener('click', analyzeA11y);
document.getElementById('btnAnalyzeEmail').addEventListener('click', analyzeEmail);

document.getElementById('btnUndo').addEventListener('click', () => {
  if (historyIndex <= 0) return;
  historyIndex -= 1;
  applyHistory(historyStack[historyIndex]);
});

document.getElementById('btnRedo').addEventListener('click', () => {
  if (historyIndex >= historyStack.length - 1) return;
  historyIndex += 1;
  applyHistory(historyStack[historyIndex]);
});

['input', 'keyup'].forEach(evt => el.visualEditor.addEventListener(evt, pushHistory));
[el.htmlCode, el.cssCode, el.jsCode].forEach(node => node.addEventListener('input', pushHistory));
pushHistory();

