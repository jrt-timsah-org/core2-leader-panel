const skills = [
  { name: 'ピットイン', cost: 20, effect: '手動補給/軽整備', id: 'pit-in' },
  { name: 'サプライ', cost: 100, effect: 'ディスク+100', id: 'supply' },
  { name: '回復Lv.1', cost: 50, effect: 'HP30回復', id: 'heal1' },
  { name: '回復Lv.2', cost: 100, effect: 'HP全回復', id: 'heal2' },
  { name: 'ブーストLv.1', cost: 50, effect: '攻撃2倍20s', id: 'boost1' },
  { name: 'ブーストLv.2', cost: 90, effect: '攻撃2倍40s', id: 'boost2' },
  { name: 'バリアLv.1', cost: 80, effect: 'ダメージ半減20s', id: 'barrier1' },
  { name: 'バリアLv.2', cost: 150, effect: '無敵15s', id: 'barrier2' },
  { name: 'リジェネ', cost: 100, effect: 'ロボット蘇生', id: 'regen' }
];

const state = {
  redName: '',
  blueName: '',
  red: { vp: 0, rp: 100, disk: 200, bonuses: [], freeSkills: { barrier2: 0, barrier1: 0, boost2: 0 }, log: [] },
  blue: { vp: 0, rp: 100, disk: 200, bonuses: [], freeSkills: { barrier2: 0, barrier1: 0, boost2: 0 }, log: [] },
  currentSide: 'blue'
};

function getCurrentState() {
  return state[state.currentSide];
}

function updateDisplay() {
  const s = getCurrentState();
  document.getElementById('vp-red').textContent = state.red.vp;
  document.getElementById('vp-blue').textContent = state.blue.vp;
  document.getElementById('rp-red').textContent = state.red.rp;
  document.getElementById('rp-blue').textContent = state.blue.rp;
  document.getElementById('disk-red').textContent = state.red.disk;
  document.getElementById('disk-blue').textContent = state.blue.disk;
  
  document.getElementById('red-name').value = state.redName;
  document.getElementById('blue-name').value = state.blueName;
  document.getElementById('team-side').value = state.currentSide;
  
  document.getElementById('header-red').textContent = `RED - ${state.redName || 'UNDEFINED'}`;
  document.getElementById('header-blue').textContent = `BLUE - ${state.blueName || 'UNDEFINED'}`;
  
  renderBonusList();
  renderSkills();
  renderLog();
}

function renderBonusList() {
  const list = document.getElementById('bonus-list');
  list.innerHTML = '';
  const s = getCurrentState();
  s.bonuses.forEach(b => {
    const li = document.createElement('li');
    li.textContent = b.name + (b.count > 1 ? ` x${b.count}` : '');
    list.appendChild(li);
  });
}

function renderSkills() {
  const skillsDiv = document.getElementById('skills');
  skillsDiv.innerHTML = '';
  const s = getCurrentState();
  skills.forEach(skill => {
    const isFree = s.freeSkills[skill.id] > 0;
    const canAfford = s.rp >= skill.cost || isFree;
    const btn = document.createElement('button');
    btn.className = `skill-btn ${isFree ? 'free' : ''}`;
    btn.textContent = `${skill.name}\n${skill.effect}${!isFree ? ` (${skill.cost}RP)` : ' [FREE]'}`;
    btn.disabled = !canAfford;
    btn.onclick = () => activateSkill(skill);
    skillsDiv.appendChild(btn);
  });
}

function renderLog() {
  const logList = document.getElementById('log-list');
  logList.innerHTML = '';
  const s = getCurrentState();
  s.log.slice(0, 10).forEach(l => {
    const li = document.createElement('li');
    li.textContent = `[${l.time}] [${state.currentSide.toUpperCase()}] ${l.msg}`;
    logList.appendChild(li);
  });
}

function activateSkill(skill) {
  const s = getCurrentState();
  if (s.freeSkills[skill.id] > 0) {
    s.freeSkills[skill.id]--;
  } else if (s.rp >= skill.cost) {
    s.rp -= skill.cost;
  } else return;
  addLog(`${skill.name}を発動しました`);
  updateDisplay();
}

function addBonus(name, rpGain = 0, diskGain = 0) {
  const s = getCurrentState();
  if (rpGain > 0) s.rp += rpGain;
  if (diskGain > 0) s.disk += diskGain;
  const existing = s.bonuses.find(b => b.name === name);
  if (existing) existing.count++; else s.bonuses.push({ name, count: 1 });
  updateDisplay();
}

function addLog(msg) {
  const s = getCurrentState();
  const time = new Date().toLocaleTimeString();
  s.log.unshift({ msg, time });
  if (s.log.length > 10) s.log.pop();
}

document.getElementById('add-bonus').onclick = () => {
  const type = document.getElementById('bonus-type').value;
  if (type === 'tech-prize') addBonus('革新的技術賞 (RP+150)', 150, 0);
  else if (type === 'idea-prize') addBonus('革新的アイデア賞 (RP+80)', 80, 0);
  else if (type === 'try-prize') addBonus('GOOD TRY賞 (RP+40)', 40, 0);
  else if (type === 'prop-prize') addBonus('技術提案賞 (RP+20)', 20, 0);
  else if (type === 'knowledge-share') addBonus('ナレッジシェア賞 (ディスク+50)', 0, 50);
  else if (type === 'best-team') addBonus('BEST TEAM賞 (ディスク+50)', 0, 50);
  else if (type === 'good-pr') addBonus('優秀広報賞 (ディスク+50)', 0, 50);
  else if (type === 'remain-disk') addBonus('残りディスク+5', 0, 5);
  else if (type === 'full-exall') {
    const s = getCurrentState();
    s.freeSkills.barrier2++; s.freeSkills.barrier1++; s.freeSkills.boost2++;
    addBonus('全スキル再発動');
  }
};

document.getElementById('add-rp').onclick = () => { getCurrentState().rp += 10; addLog('RP+10'); updateDisplay(); };
document.getElementById('add-disk').onclick = () => { getCurrentState().disk += 10; addLog('ディスク+10'); updateDisplay(); };
document.getElementById('add-vp').onclick = () => { getCurrentState().vp += 10; addLog('VP+10'); updateDisplay(); };

document.getElementById('set-names').onclick = () => {
  state.redName = document.getElementById('red-name').value;
  state.blueName = document.getElementById('blue-name').value;
  addLog(`同盟名設定: Red=${state.redName || '-'}, Blue=${state.blueName || '-'}`);
  updateDisplay();
};

document.getElementById('team-side').onchange = e => {
  state.currentSide = e.target.value;
  document.body.style.setProperty('--primary-bg', state.currentSide === 'red' ? '#fdf2e9' : '#e5f0ff');
  document.body.style.setProperty('--border-color', state.currentSide === 'red' ? '#c0392b' : '#2980b9');
  document.body.style.setProperty('--title-color', state.currentSide === 'red' ? '#c0392b' : '#2980b9');
  document.body.style.setProperty('--skill-bg', state.currentSide === 'red' ? '#e74c3c' : '#3498db');
  addLog(`陣営切替: ${state.currentSide.toUpperCase()}`);
  updateDisplay();
};

document.body.style.setProperty('--primary-bg', '#e5f0ff');
document.body.style.setProperty('--border-color', '#2980b9');
document.body.style.setProperty('--title-color', '#2980b9');
document.body.style.setProperty('--skill-bg', '#3498db');

updateDisplay();