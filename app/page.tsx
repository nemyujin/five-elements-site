'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, Menu, RotateCcw, Sparkles, X } from 'lucide-react';

type ElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

const elements: Record<ElementKey, { hanja: string; ko: string; en: string; verb: string; color: string; soft: string; ritual: string; question: string; action: string; kit: string }> = {
  wood: { hanja: '木', ko: '목', en: 'Growth', verb: '그려본다', color: '#bafc55', soft: '#253519', ritual: '성장 방향을 설계하는 시간', question: '지금 마음이 향하는 방향을 한 문장으로 적어보세요.', action: '완벽한 계획 대신, 이번 주에 시작할 가장 작은 행동 하나를 그려보세요.', kit: 'Growth 드로잉 키트' },
  fire: { hanja: '火', ko: '화', en: 'Expression', verb: '연결한다', color: '#ff5a45', soft: '#3b1b19', ritual: '마음을 바깥으로 연결하는 시간', question: '오늘 누구에게 어떤 마음을 표현하고 싶나요?', action: '떠오른 사람 한 명에게 짧은 안부나 고마움을 전해보세요.', kit: 'Expression 보이스 레터 키트' },
  earth: { hanja: '土', ko: '토', en: 'Stability', verb: '추적한다', color: '#ffc861', soft: '#3a2e17', ritual: '흐트러진 리듬을 돌보는 시간', question: '오늘의 몸과 마음은 각각 몇 점인가요?', action: '지금 필요한 휴식 한 가지를 정하고 일정에 10분을 비워두세요.', kit: 'Stability 웰니스 키트' },
  metal: { hanja: '金', ko: '금', en: 'Clarity', verb: '구조화한다', color: '#e6e8ea', soft: '#292b2d', ritual: '복잡함 속에서 기준을 세우는 시간', question: '지금 가장 먼저 결정해야 할 한 가지는 무엇인가요?', action: '선택지를 세 가지로 줄이고, 가장 중요한 기준 하나에 표시하세요.', kit: 'Clarity 대시보드 키트' },
  water: { hanja: '水', ko: '수', en: 'Reflection', verb: '질문한다', color: '#4fc7ff', soft: '#162f3b', ritual: '고민의 농도를 조절하는 시간', question: '같은 고민을 반복하고 있다고 느끼나요?', action: '답을 찾기보다 “내가 정말 두려워하는 것은?”을 천천히 적어보세요.', kit: 'Reflection 리플렉션 키트' },
};

const questions: { text: string; element: ElementKey }[] = [
  { text: '새로운 시작을 앞두고 방향을 잡기 어렵다.', element: 'wood' }, { text: '하고 싶은 말이나 감정을 안으로 삼키는 편이다.', element: 'fire' },
  { text: '요즘 수면이나 식사 같은 생활 리듬이 흐트러졌다.', element: 'earth' }, { text: '할 일이 많을수록 우선순위를 정하기 어렵다.', element: 'metal' },
  { text: '혼자 차분히 생각을 정리할 시간이 필요하다.', element: 'water' }, { text: '완벽한 계획을 세우느라 시작이 늦어진다.', element: 'wood' },
  { text: '사람들과 연결될 때 에너지를 되찾는 편이다.', element: 'fire' }, { text: '몸과 마음의 신호를 자주 놓치곤 한다.', element: 'earth' },
  { text: '결정할 때 나만의 기준보다 주변 의견을 따른다.', element: 'metal' }, { text: '같은 고민이 머릿속에서 반복되고 있다.', element: 'water' },
];

export default function Home() {
  const [step, setStep] = useState(0); const [answers, setAnswers] = useState<Record<ElementKey, number>>({ wood: 0, fire: 0, earth: 0, metal: 0, water: 0 });
  const [view, setView] = useState<'home' | 'checkin' | 'result'>('home'); const [selected, setSelected] = useState<ElementKey>('water'); const [menu, setMenu] = useState(false);
  const [ritualDone, setRitualDone] = useState(false); const [email, setEmail] = useState(''); const [subscribed, setSubscribed] = useState(false);
  const result = useMemo(() => (Object.keys(answers) as ElementKey[]).reduce((a, b) => answers[a] >= answers[b] ? a : b), [answers]);
  const answer = (score: number) => { const key = questions[step].element; const next = {...answers, [key]: answers[key] + score}; setAnswers(next); if (step === questions.length - 1) { setSelected((Object.keys(next) as ElementKey[]).reduce((a,b)=>next[a]>=next[b]?a:b)); setView('result'); } else setStep(step + 1); };
  const reset = () => { setStep(0); setAnswers({ wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }); setRitualDone(false); setView('checkin'); }; const current = elements[selected];
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: object, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'start_balance_checkin', title: '오행 밸런스 체크인 시작',
      description: '사용자가 현재 필요한 오행 관점을 찾도록 10문항 체크인 화면을 시작합니다.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: () => { reset(); return { status: 'started', questionCount: 10 }; },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);
  return <main>
    <header className="site-header"><a className="brand" href="#top" onClick={() => setView('home')} aria-label="오행 홈"><span className="brand-mark">五</span><span>5 ELEMENTS</span></a>
      <nav className={menu ? 'nav open' : 'nav'} aria-label="주요 메뉴"><a href="#elements" onClick={() => setMenu(false)}>오행 리추얼</a><a href="#kits" onClick={() => setMenu(false)}>키트</a><a href="#archive" onClick={() => setMenu(false)}>이야기</a><button className="nav-cta" onClick={() => { setView('checkin'); setMenu(false); }}>나의 균형 찾기</button></nav>
      <button className="menu-button" aria-label="메뉴 열기" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button></header>
    {view === 'home' && <>
      <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow"><span /> TODAY&apos;S BALANCE CHECK-IN</p><h1>지금의 나를<br/><em>알아차리는 일</em>부터.</h1><p className="hero-description">오행의 균형 철학으로 오늘의 마음을 관찰하고, 작은 행동으로 이어지는 나만의 리추얼을 만나보세요.</p><button className="primary-button" onClick={() => setView('checkin')}>3분 체크인 시작하기 <ArrowRight size={18}/></button><p className="microcopy">가입 없이 시작 · 10개의 짧은 질문</p></div>
        <div className="orbit" aria-label="목, 화, 토, 금, 수 다섯 오행"><div className="orbit-center"><span>오늘의 나</span><strong>觀</strong><small>OBSERVE</small></div>{(Object.keys(elements) as ElementKey[]).map((key, i) => <button key={key} className={`orbit-item orbit-${i}`} style={{'--el': elements[key].color} as React.CSSProperties} onClick={() => { setSelected(key); document.getElementById('elements')?.scrollIntoView({behavior:'smooth'}); }}><strong>{elements[key].hanja}</strong><span>{elements[key].ko} · {elements[key].en}</span></button>)}</div></section>
      <section className="ritual-intro" id="elements"><div><p className="eyebrow"><span /> FIVE PERSPECTIVES</p><h2>균형은 정답이 아니라<br/>계속 조정하는 과정입니다.</h2></div><p>오늘 더 필요한 관점을 선택해보세요. 각 오행은 지금의 나를 바라보는 다섯 가지 방법입니다.</p></section>
      <section className="element-tabs"><div className="element-selector" role="tablist">{(Object.keys(elements) as ElementKey[]).map((key) => <button key={key} role="tab" aria-selected={selected===key} onClick={() => setSelected(key)} className={selected===key?'active':''}><strong>{elements[key].hanja}</strong><span>{elements[key].ko}</span></button>)}</div><div className="element-feature" style={{'--accent': current.color, '--soft': current.soft} as React.CSSProperties}><div className="feature-symbol"><span>{current.hanja}</span><div className="ripple r1"/><div className="ripple r2"/></div><div className="feature-copy"><p>{current.ko} · {current.en}</p><h3>{current.verb}</h3><h4>{current.ritual}</h4><div className="mini-flow"><span>관찰</span><i/><span>기록</span><i/><span>실천</span><i/><span>균형</span></div><button onClick={() => setView('checkin')}>이 리추얼 만나기 <ArrowRight size={17}/></button></div></div></section>
      <section className="steps"><p className="eyebrow"><span /> 4-STEP RITUAL</p><h2>인사이트가 일상이 되는 네 번의 움직임</h2><div className="step-grid">{[['01','觀','관찰','지금의 나를 알아차립니다.'],['02','記','기록','경험을 나의 언어로 남깁니다.'],['03','行','실천','작은 행동으로 옮깁니다.'],['04','衡','균형','결과를 돌아보고 조정합니다.']].map((s)=><article key={s[0]}><span>{s[0]}</span><strong>{s[1]}</strong><h3>{s[2]}</h3><p>{s[3]}</p></article>)}</div></section>
      <section className="kits" id="kits"><div><p className="eyebrow"><span/> RITUAL KITS</p><h2>손으로 만지고,<br/>삶으로 이어지는 도구</h2><p>디지털에서 발견한 인사이트를 일상에서 반복할 수 있도록 오행별 질문과 기록 도구를 담았습니다.</p></div><div className="kit-stack">{(['water','fire','wood'] as ElementKey[]).map((key,i)=><article key={key} style={{'--card':elements[key].color} as React.CSSProperties}><span>0{i+1}</span><div><small>{elements[key].hanja} · {elements[key].en}</small><h3>{elements[key].kit}</h3><p>{elements[key].ritual}</p></div><ArrowRight/></article>)}</div></section>
      <section className="archive" id="archive"><span className="archive-symbol">水</span><div><p className="eyebrow"><span/> FROM HERITAGE TO RITUAL</p><h2>오래된 지혜를<br/>오늘의 질문으로.</h2><p>백자 청채 물고기모양 연적은 먹의 농도를 물 한 방울로 조절하던 도구였습니다. 우리는 그 쓰임을 고민의 농도를 조절하는 리추얼로 다시 읽습니다.</p><a href="#elements">브랜드 이야기 보기 <ArrowRight size={17}/></a></div></section>
      <section className="newsletter"><Sparkles/><h2>오늘, 어떤 균형이 필요했나요?</h2><p>계절마다 도착하는 새로운 질문과 리추얼 소식을 받아보세요.</p>{subscribed?<div className="success"><Check/> 신청이 완료되었습니다.</div>:<form onSubmit={(e)=>{e.preventDefault(); if(email){setSubscribed(true)}}}><label className="sr-only" htmlFor="email">이메일</label><input id="email" type="email" required placeholder="이메일 주소" value={email} onChange={e=>setEmail(e.target.value)}/><button>소식 받기 <ArrowRight size={17}/></button></form>}</section>
    </>}
    {view === 'checkin' && <section className="checkin-view"><button className="back-button" onClick={() => setView('home')}><ChevronLeft/> 처음으로</button><div className="progress-row"><span>{String(step+1).padStart(2,'0')}</span><div><i style={{width:`${(step+1)*10}%`}}/></div><span>10</span></div><div className="question-card"><p>지금의 나를 떠올리며 답해주세요.</p><h1>{questions[step].text}</h1><div className="answer-grid"><button onClick={()=>answer(0)}><span>전혀 아니에요</span><small>1</small></button><button onClick={()=>answer(1)}><span>조금 그래요</span><small>2</small></button><button onClick={()=>answer(2)}><span>꽤 그래요</span><small>3</small></button><button onClick={()=>answer(3)}><span>매우 그래요</span><small>4</small></button></div></div><p className="checkin-note">정답은 없습니다. 오늘의 상태에 가장 가까운 답을 골라주세요.</p></section>}
    {view === 'result' && <section className="result-view" style={{'--accent':current.color,'--soft':current.soft} as React.CSSProperties}><div className="result-top"><p>오늘 당신에게 필요한 관점</p><div className="result-emblem"><span>{current.hanja}</span></div><h1>{current.ko} · {current.en}</h1><h2>{current.ritual}</h2><p>{current.action}</p></div><div className="ritual-card"><span>DAY 01 · FREE RITUAL</span><h3>{current.question}</h3><textarea aria-label="오늘의 기록" placeholder="천천히 적어보세요..."/><button className={ritualDone?'done':''} onClick={()=>setRitualDone(!ritualDone)}>{ritualDone?<><Check/> 오늘의 리추얼 완료</>:<>실천으로 옮기기 <ArrowRight size={18}/></>}</button></div><div className="result-actions"><button onClick={reset}><RotateCcw/> 다시 체크하기</button><button onClick={()=>{setView('home');setTimeout(()=>document.getElementById('kits')?.scrollIntoView({behavior:'smooth'}),50)}}>{current.kit} 보기 <ArrowRight/></button></div></section>}
    <footer><div className="brand"><span className="brand-mark">五</span><span>5 ELEMENTS</span></div><p>From insight to action. 전통의 균형 철학을 현대적 리추얼로.</p><small>© 2026 5 Elements</small></footer>
  </main>;
}
