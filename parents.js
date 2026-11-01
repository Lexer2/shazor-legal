import { FAMILY_SIDES, FAMILY_TOPICS, buildParentsReply } from './family.js';

const main = document.querySelector('#parents');
const params = new URLSearchParams(location.hash.slice(1));
const side = params.get('side');
const names = (params.get('names') || '').trim().slice(0, 80);
const draftKey = `shazor.parents.${side}`;
const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};
const readDraft = () => { try { return JSON.parse(localStorage.getItem(draftKey)) || {}; } catch { return {}; } };
const saveDraft = answers => { try { localStorage.setItem(draftKey, JSON.stringify(answers)); } catch { /* private mode: the form still works without a draft */ } };

if (!Object.hasOwn(FAMILY_SIDES, side)) {
  document.querySelector('#intro').replaceWith(el('p', { className: 'alert', textContent: 'הקישור חסר או שבור. בקשו מהזוג לשלוח קישור חדש מתוך שזור.' }));
} else {
  document.querySelector('#title').textContent = `${FAMILY_SIDES[side]}${names ? ` של ${names}` : ''} — מה חשוב לכם?`;
  document.querySelector('#intro').textContent = 'אין חובה לענות על הכול: דלגו על כל שאלה שלא רלוונטית. התשובות נשמרות רק בטלפון הזה עד שתשלחו אותן בעצמכם — הדף לא שולח שום דבר לשרת.';
  const draft = readDraft();
  const form = el('form', { id: 'parents-form', noValidate: true });
  for (const [id, [title, question]] of Object.entries(FAMILY_TOPICS)) {
    const area = el('textarea', { name: id, maxLength: 1500, rows: 3, value: draft[id] || '' });
    form.append(el('label', { className: 'question' }, el('strong', { textContent: title }), el('span', { textContent: question }), area));
  }
  const error = el('p', { className: 'alert', hidden: true, role: 'alert' });
  form.append(error, el('button', { className: 'button', type: 'submit', textContent: 'סיימנו — הכנת הודעה לזוג' }));
  const result = el('section', { className: 'result', hidden: true, tabIndex: -1 });
  main.append(form, result);

  const answers = () => Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, String(value)]));
  form.addEventListener('input', () => saveDraft(answers()));
  form.addEventListener('submit', event => {
    event.preventDefault();
    let text;
    try { text = buildParentsReply(side, answers(), names); error.hidden = true; }
    catch (problem) { error.textContent = problem.message; error.hidden = false; return; }
    const copy = el('button', { className: 'button secondary', type: 'button', textContent: 'העתקת ההודעה' });
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(text); copy.textContent = 'הועתק ✓'; }
      catch { preview.focus(); preview.select(); copy.textContent = 'סמנו והעתיקו ידנית'; }
    });
    const preview = el('textarea', { readOnly: true, rows: 8, value: text });
    preview.setAttribute('aria-label', 'ההודעה שתישלח');
    result.replaceChildren(
      el('h2', { textContent: 'תודה! עכשיו שלחו לזוג' }),
      el('p', { textContent: 'לחצו על הכפתור, בחרו את הזוג בוואטסאפ ושלחו את ההודעה כמו שהיא, בלי לערוך את שורת הקוד.' }),
      el('div', { className: 'actions' }, el('a', { className: 'button', href: `https://wa.me/?text=${encodeURIComponent(text)}`, target: '_blank', rel: 'noopener noreferrer', textContent: 'שליחה בוואטסאפ' }), copy),
      preview
    );
    result.hidden = false;
    result.focus();
  });
}
