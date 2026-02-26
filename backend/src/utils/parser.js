const { parse } = require('csv-parse/sync');
const xml2js = require('xml2js');

async function parseCSV(content, opts = {}) {
  const records = parse(content, { columns: true, skip_empty_lines: true });
  // expect columns: text, options (pipe-separated), correctIndex, marks
  return records.map(r => {
    const optsRaw = (r.options || '').split('|').map(s => s.trim()).filter(Boolean);
    return {
      text: r.text || '',
      options: optsRaw,
      correctIndex: r.correctIndex ? Number(r.correctIndex) : 0,
      marks: r.marks ? Number(r.marks) : opts.marksDefault || 1
    };
  });
}

async function parseXML(content, opts = {}) {
  const parsed = await xml2js.parseStringPromise(content, { explicitArray: false });
  // Expect root.questions.question[*] with fields
  const qs = [];
  const list = parsed?.questions?.question;
  if (!list) return qs;
  const arr = Array.isArray(list) ? list : [list];
  for (const q of arr) {
    const options = [];
    if (q.options && q.options.option) {
      const olist = Array.isArray(q.options.option) ? q.options.option : [q.options.option];
      for (const o of olist) options.push(String(o));
    }
    qs.push({
      text: q.text || '',
      options,
      correctIndex: q.correctIndex ? Number(q.correctIndex) : 0,
      marks: q.marks ? Number(q.marks) : opts.marksDefault || 1
    });
  }
  return qs;
}

async function parseJSON(content, opts = {}) {
  const data = typeof content === 'string' ? JSON.parse(content) : content;
  // expect array of q objects
  return (Array.isArray(data) ? data : []).map(q => ({
    text: q.text || '',
    options: q.options || [],
    correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
    marks: typeof q.marks === 'number' ? q.marks : opts.marksDefault || 1
  }));
}

module.exports.parse = async (content, type, opts = {}) => {
  type = (type || '').toLowerCase();
  if (type === 'csv') return parseCSV(content, opts);
  if (type === 'xml') return parseXML(content, opts);
  if (type === 'json') return parseJSON(content, opts);
  // try to auto-detect
  try {
    return await parseJSON(content, opts);
  } catch (e) {}
  try {
    return await parseCSV(content, opts);
  } catch (e) {}
  return await parseXML(content, opts);
};
