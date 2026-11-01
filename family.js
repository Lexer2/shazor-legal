export const FAMILY_SIDES = { bride: 'משפחת הכלה', groom: 'משפחת החתן', brideparents: 'הורי הכלה', groomparents: 'הורי החתן' };
export const FAMILY_TOPICS = {
  kosher: ['מסורת וכשרות', 'איזו רמת כשרות חשובה לכל משפחה? רבנות, מהדרין או העדפה אחרת — ומה חשוב לזוג?'],
  ceremony: ['הטקס והחופה', 'איזה טקס ומי עורך אותו: רבנות, רב פרטי או טקס חלופי? אילו גבולות חשובים לכם?'],
  dates: ['תאריך ושעות', 'אילו מועדים אינם מתאימים? חגים, קרבה לשבת, ספירה ושלושת השבועות — אילו מנהגים רלוונטיים לכם?'],
  guests: ['מוזמנים ומכסות', 'מה המכסה לכל צד, מי חשוב במיוחד להזמין ומה עושים אם הרשימה גדולה מהתקציב?'],
  contributions: ['כסף וציפיות', 'מי מציע להשתתף ובמה? האם הסכום ודאי, מתי יינתן והאם נלוות אליו ציפיות או תנאים?'],
  venue: ['מקום ומרחק', 'איזה סגנון ואזור רצויים? מה המרחק המתאים לקרובים מבוגרים ומי זקוק להסעה?'],
  music: ['מוזיקה ואווירה', 'איזו מוזיקה נעימה לכל צד? מה חשוב להשאיר מקום לכל הדורות ומה לא מתאים לזוג?'],
  dress: ['לבוש וצניעות', 'האם יש ציפיות לגבי לבוש או צניעות? איך מציגים בקשה בצורה מכבדת ולא שיפוטית?'],
  alcohol: ['אלכוהול', 'האם רוצים בר, אילו מגבלות חשובות ומי אחראי לבטיחות ולחזרה הביתה?'],
  kids: ['ילדים ומלווים', 'האם מזמינים ילדים ומלווים? אילו צרכים וחריגים חשוב לבדוק בלי להניח מראש?'],
  traditions: ['מנהגים משפחתיים', 'אילו מנהגים תרצו לשלב: חינה, מנהגי חופה, כיסוי הינומה או אחרים? מה מתאים לשניכם?'],
  accessibility: ['נגישות ונוחות', 'אילו התאמות נדרשות לחניה, הליכה, שירותים, שמיעה, מזון ומנוחה? אין צורך לכתוב אבחנות רפואיות.'],
  dynamics: ['יחסים וסידורי ישיבה — פרטי', 'האם יש גבולות או סידורי ישיבה שחשוב לתאם, למשל בין הורים גרושים? כתבו רק מה שנחוץ ובשפה מכבדת.']
};
const keys = object => Object.keys(object);
const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
const string = (value, limit = 1500) => typeof value === 'string' && value.length <= limit;
export function createFamilyState() {
  return {
    version: 1,
    topics: Object.fromEntries(keys(FAMILY_TOPICS).map(id => [id, { couple: '', decided: '', agreed: false, families: Object.fromEntries(keys(FAMILY_SIDES).map(side => [side, ''])) }])),
    constraints: { region: '', style: '', kosher: '', ceremony: '', accessible: 'keep', observant: 'keep', kids: 'keep', budgetCap: null, sideQuotas: Object.fromEntries(keys(FAMILY_SIDES).map(side => [side, null])) }
  };
}
export function validateFamilyState(value) {
  if (value === undefined) return createFamilyState();
  const error = 'נתוני תיאום המשפחות אינם תקינים. לא החלפנו או מחקנו אותם.';
  if (!isObject(value) || value.version !== 1 || keys(value).some(k => !['version', 'topics', 'constraints'].includes(k)) ||
      !isObject(value.topics) || keys(value.topics).length !== keys(FAMILY_TOPICS).length) throw new Error(error);
  for (const [id, topic] of Object.entries(value.topics)) {
    if (!Object.hasOwn(FAMILY_TOPICS, id) || !isObject(topic) || keys(topic).some(k => !['couple', 'decided', 'agreed', 'families'].includes(k)) ||
        !string(topic.couple) || !string(topic.decided) || typeof topic.agreed !== 'boolean' ||
        (topic.agreed && !topic.decided.trim()) || !isObject(topic.families) ||
        keys(topic.families).length !== keys(FAMILY_SIDES).length ||
        keys(topic.families).some(side => !Object.hasOwn(FAMILY_SIDES, side) || !string(topic.families[side]))) throw new Error(error);
  }
  const c = value.constraints;
  if (!isObject(c) || keys(c).some(k => !['region', 'style', 'kosher', 'ceremony', 'accessible', 'observant', 'kids', 'budgetCap', 'sideQuotas'].includes(k)) ||
      !['region', 'style', 'kosher'].every(k => string(c[k], 120)) || !string(c.ceremony, 200) ||
      !['accessible', 'observant', 'kids'].every(k => ['keep', 'yes', 'no'].includes(c[k])) ||
      !(c.budgetCap === null || Number.isFinite(c.budgetCap) && c.budgetCap >= 1 && c.budgetCap <= 10000000) ||
      !isObject(c.sideQuotas) || keys(c.sideQuotas).length !== keys(FAMILY_SIDES).length ||
      keys(c.sideQuotas).some(side => !Object.hasOwn(FAMILY_SIDES, side) || !(c.sideQuotas[side] === null || Number.isInteger(c.sideQuotas[side]) && c.sideQuotas[side] >= 0 && c.sideQuotas[side] <= 10000))) throw new Error(error);
  return structuredClone(value);
}
export function familyAlignment(topic) {
  const normalized = value => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('he-IL');
  const couple = normalized(topic.couple);
  const byFamily = Object.fromEntries(keys(FAMILY_SIDES).map(side => {
    const value = normalized(topic.families[side]);
    return [side, !value || !couple ? 'undecided' : value === couple ? 'same-wording' : 'different-wording'];
  }));
  return { byFamily, status: topic.agreed ? 'confirmed' : Object.values(byFamily).includes('different-wording') ? 'discussion' : Object.values(byFamily).includes('undecided') ? 'undecided' : 'same-wording' };
}
export function setFamilyDiscussion(family, payload) {
  const next = validateFamilyState(family);
  for (const id of keys(FAMILY_TOPICS)) {
    next.topics[id] = {
      couple: String(payload[`topic.${id}.couple`] ?? '').trim(),
      decided: String(payload[`topic.${id}.decided`] ?? '').trim(),
      agreed: payload[`topic.${id}.agreed`] === true,
      families: Object.fromEntries(keys(FAMILY_SIDES).map(side => [side, String(payload[`topic.${id}.family.${side}`] ?? '').trim()]))
    };
  }
  return validateFamilyState(next);
}
export function setFamilyConstraints(family, payload) {
  const next = validateFamilyState(family);
  const numeric = value => {
    if (value === '' || value === undefined) return null;
    if (typeof value !== 'string' || !/^\d+(?:\.\d+)?$/.test(value)) throw new Error('הזינו סכום או מכסה תקינים, או השאירו ריק ללא שינוי.');
    return Number(value);
  };
  next.constraints = {
    ...Object.fromEntries(['region', 'style', 'kosher', 'ceremony', 'accessible', 'observant', 'kids'].map(k => [k, String(payload[k] ?? (['accessible', 'observant', 'kids'].includes(k) ? 'keep' : '')).trim()])),
    budgetCap: numeric(payload.budgetCap),
    sideQuotas: Object.fromEntries(keys(FAMILY_SIDES).map(side => [side, numeric(payload[`quota.${side}`])]))
  };
  return validateFamilyState(next);
}
export function agreedFamilyChanges(family) {
  const checked = validateFamilyState(family);
  const constraints = checked.constraints;
  const topicFor = { region: 'venue', style: 'venue', kosher: 'kosher', ceremony: 'ceremony', accessible: 'accessibility', observant: 'dates', kids: 'kids', budgetCap: 'contributions', sideQuotas: 'guests' };
  const requirements = {};
  const planning = {};
  for (const [key, value] of Object.entries(constraints)) {
    const selected = key === 'sideQuotas' ? Object.values(value).some(v => v !== null) : !['', null, 'keep'].includes(value);
    if (!selected) continue;
    if (!checked.topics[topicFor[key]].agreed) throw new Error(`לפני החלת ${FAMILY_TOPICS[topicFor[key]][0]}, כתבו את החלטת הזוג וסמנו שההסכמה סוכמה. אין להסיק הסכמה מניסוח דומה בלבד.`);
    if (['region', 'style', 'kosher', 'ceremony'].includes(key)) requirements[key] = value;
    if (key === 'accessible') requirements.accessible = value === 'yes';
    if (key === 'observant') planning.observant = value === 'yes';
    if (key === 'kids') planning.includeKids = value === 'yes';
    if (key === 'budgetCap') { requirements.budget = value; planning.budgetCap = value; }
    if (key === 'sideQuotas') planning.sideQuotas = Object.fromEntries(Object.entries(value).filter(([, quota]) => quota !== null));
  }
  if (!keys(requirements).length && !keys(planning).length) throw new Error('לא נבחרו אילוצים מוסכמים להחלה. שיחה משפחתית יכולה להישמר בלי לשנות דרישות.');
  return { requirements, planning };
}
export const PARENTS_CODE = 'SHZ1';
const titleLine = /^\s*\*([^*\n]+)\*\s*$/;
export function buildParentsReply(side, answers, names = '') {
  if (!Object.hasOwn(FAMILY_SIDES, side)) throw new Error('הקישור אינו תקין: חסר צד משפחה.');
  const sections = Object.entries(FAMILY_TOPICS).map(([id, [title]]) => {
    // A line that looks like a topic heading would split the answer on import, so drop its asterisks.
    const text = String(answers[id] ?? '').trim().slice(0, 1500).split('\n').map(line => line.replace(titleLine, '$1')).join('\n');
    return text ? `*${title}*\n${text}` : '';
  }).filter(Boolean);
  if (!sections.length) throw new Error('כתבו תשובה לפחות לשאלה אחת. אפשר לדלג על כל השאר.');
  return [`שזור · תשובות ${FAMILY_SIDES[side]}${names ? ` · ${String(names).slice(0, 80)}` : ''}`, `קוד: ${PARENTS_CODE}-${side}`, '', sections.join('\n\n')].join('\n');
}
export function parseParentsReply(text) {
  const source = String(text ?? '').replace(/\r\n?/g, '\n');
  const code = source.match(new RegExp(`${PARENTS_CODE}-([a-z]+)`));
  if (!code || !Object.hasOwn(FAMILY_SIDES, code[1])) throw new Error('לא נמצא קוד שזור בהודעה. הדביקו את כל ההודעה שההורים שלחו, כולל השורה "קוד: SHZ1-…".');
  const byTitle = Object.fromEntries(Object.entries(FAMILY_TOPICS).map(([id, [title]]) => [title, id]));
  const answers = {};
  let current = null;
  for (const line of source.slice(code.index).split('\n').slice(1)) {
    const heading = line.match(titleLine);
    if (heading && Object.hasOwn(byTitle, heading[1].trim())) { current = byTitle[heading[1].trim()]; answers[current] = []; continue; }
    if (current) answers[current].push(line);
  }
  const result = Object.fromEntries(Object.entries(answers).map(([id, lines]) => [id, lines.join('\n').trim()]).filter(([, value]) => value));
  if (!Object.keys(result).length) throw new Error('ההודעה זוהתה, אך לא נמצאו בה תשובות. ודאו שהודבקה ההודעה המלאה.');
  const long = Object.entries(result).find(([, value]) => value.length > 1500);
  if (long) throw new Error(`התשובה בנושא ${FAMILY_TOPICS[long[0]][0]} ארוכה מ־1,500 תווים. קצרו אותה לפני הייבוא.`);
  return { side: code[1], answers: result };
}
export function importParentsReply(family, text) {
  const next = validateFamilyState(family);
  const { side, answers } = parseParentsReply(text);
  const overwritten = Object.entries(answers).filter(([id, value]) => next.topics[id].families[side] && next.topics[id].families[side] !== value).map(([id]) => id);
  for (const [id, value] of Object.entries(answers)) {
    if (next.topics[id].families[side] === value) continue;
    next.topics[id].families[side] = value;
    next.topics[id].agreed = false;
  }
  return { family: validateFamilyState(next), side, count: Object.keys(answers).length, overwritten };
}
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function familySummary(family, { includePrivate = false } = {}) {
  const state = validateFamilyState(family);
  const body = Object.entries(FAMILY_TOPICS).map(([id, [label]]) => {
    const t = state.topics[id];
    if (!includePrivate && !t.decided.trim()) return '';
    return `<section><h2>${escape(label)}</h2><p>החלטת הזוג: ${escape(t.decided || 'טרם הוחלט')}</p><p>הסכמה שסוכמה ידנית: ${t.agreed ? 'כן' : 'טרם סוכמה'}</p>${includePrivate ? `<p>בחירת הזוג לשיחה: ${escape(t.couple)}</p>${Object.entries(t.families).map(([side, value]) => `<p>${escape(FAMILY_SIDES[side])}: ${escape(value || 'טרם נרשם')}</p>`).join('')}` : ''}</section>`;
  }).join('');
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>סיכום תיאום משפחות</title><style>body{max-width:800px;margin:32px auto;padding:24px;font-family:Arial,sans-serif;color:#423139;line-height:1.8}section{break-inside:avoid;border-bottom:1px solid #ddd;padding:16px 0}p{white-space:pre-wrap;overflow-wrap:anywhere}@media print{body{margin:0}}</style></head><body><h1>סיכום תיאום משפחות — לבדיקת הזוג</h1><p>${includePrivate ? 'פרטי: כולל ציפיות משפחות ונושאים רגישים. לבדוק לפני שיתוף.' : 'החלטות הזוג בלבד; ללא ציפיות פרטיות של המשפחות.'} זהו סיכום לדיון, לא חוזה או אישור ספק.</p>${body || '<p>לא נרשמו עדיין החלטות זוג להצגה.</p>'}</body></html>`;
}
