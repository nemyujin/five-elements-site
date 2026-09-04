'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { Lunar, Solar } from 'lunar-javascript';

type ElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
type View = 'home' | 'birth' | 'profile' | 'goal' | 'checkin' | 'result';
type CalendarType = 'solar' | 'lunar';
const order: ElementKey[] = ['wood', 'fire', 'earth', 'metal', 'water'];
const blank = (): Record<ElementKey, number> => ({ wood: 0, fire: 0, earth: 0, metal: 0, water: 0 });

const elements = {
  wood: { hanja:'木', ko:'목', en:'Growth', verb:'그려본다', color:'#caff66', soft:'#243318', meaning:'가능성을 열고 성장 방향을 설계하는 관점', question:'원하는 변화가 이미 시작됐다면, 나는 무엇을 하고 있을까요?', action:'이번 주에 시작할 수 있는 가장 작은 행동 하나를 적어보세요.', kit:'Growth 드로잉 키트' },
  fire: { hanja:'火', ko:'화', en:'Expression', verb:'연결한다', color:'#ff654c', soft:'#3b1c18', meaning:'마음을 밖으로 표현하고 사람과 연결하는 관점', question:'지금 누구에게 어떤 생각을 꺼내놓고 싶나요?', action:'떠오른 한 사람에게 생각을 한 문장으로 공유해보세요.', kit:'Expression 보이스 레터 키트' },
  earth: { hanja:'土', ko:'토', en:'Stability', verb:'추적한다', color:'#ffc861', soft:'#3a2d17', meaning:'몸과 일상의 리듬을 안정적으로 이어가는 관점', question:'지금의 나를 지탱하는 생활 리듬은 무엇인가요?', action:'내일도 지킬 수 있는 10분짜리 루틴 하나를 정해보세요.', kit:'Stability 웰니스 키트' },
  metal: { hanja:'金', ko:'금', en:'Clarity', verb:'구조화한다', color:'#f0f1ed', soft:'#292b2d', meaning:'복잡한 선택지에 기준을 세우고 덜어내는 관점', question:'이번 결정에서 절대 포기할 수 없는 기준은 무엇인가요?', action:'선택지를 세 개로 줄이고 가장 중요한 기준 하나에 표시하세요.', kit:'Clarity 대시보드 키트' },
  water: { hanja:'水', ko:'수', en:'Reflection', verb:'질문한다', color:'#54c8ff', soft:'#142f3e', meaning:'서두르지 않고 마음의 깊이와 흐름을 살피는 관점', question:'나는 무엇이 두려워 같은 고민을 반복하고 있을까요?', action:'답을 고치지 말고 5분 동안 떠오르는 문장을 적어보세요.', kit:'Reflection 리플렉션 키트' },
} satisfies Record<ElementKey, Record<string, string>>;

const goals = [
  { id:'career', label:'이직·취업', copy:'다음 커리어의 방향을 정하고 싶어요', element:'metal' as ElementKey },
  { id:'start', label:'새로운 시작', copy:'프로젝트나 창업을 실제로 시작하고 싶어요', element:'wood' as ElementKey },
  { id:'relationship', label:'관계·표현', copy:'마음을 정리하고 더 잘 표현하고 싶어요', element:'fire' as ElementKey },
  { id:'balance', label:'생활 균형', copy:'흐트러진 일상을 다시 세우고 싶어요', element:'earth' as ElementKey },
  { id:'reflection', label:'생각 정리', copy:'반복되는 고민에서 잠시 벗어나고 싶어요', element:'water' as ElementKey },
];
const questions = [
  { text:'하고 싶은 방향은 있지만 첫걸음을 정하지 못했다.', element:'wood' as ElementKey },
  { text:'다른 사람의 기대 때문에 내 생각을 표현하기 어렵다.', element:'fire' as ElementKey },
  { text:'생활 리듬이 무너져 계획을 실행할 힘이 부족하다.', element:'earth' as ElementKey },
  { text:'선택지가 많아 무엇을 버려야 할지 모르겠다.', element:'metal' as ElementKey },
  { text:'같은 고민을 반복하며 생각만 깊어지고 있다.', element:'water' as ElementKey },
];
const gan: Record<string,ElementKey> = {甲:'wood',乙:'wood',丙:'fire',丁:'fire',戊:'earth',己:'earth',庚:'metal',辛:'metal',壬:'water',癸:'water'};
const zhi: Record<string,ElementKey> = {寅:'wood',卯:'wood',巳:'fire',午:'fire',辰:'earth',戌:'earth',丑:'earth',未:'earth',申:'metal',酉:'metal',亥:'water',子:'water'};

function getProfile(date:string,time:string,calendar:CalendarType,timeKnown:boolean,leap:boolean){
  const [y,m,d]=date.split('-').map(Number); const [h,min]=(time||'12:00').split(':').map(Number);
  const lunar=calendar==='solar'?Solar.fromYmdHms(y,m,d,timeKnown?h:12,timeKnown?min:0,0).getLunar():Lunar.fromYmdHms(y,leap?-m:m,d,timeKnown?h:12,timeKnown?min:0,0);
  const eight=lunar.getEightChar(); const pillars=[eight.getYear(),eight.getMonth(),eight.getDay(),...(timeKnown?[eight.getTime()]:[])]; const scores=blank();
  pillars.forEach((p:string)=>{if(gan[p[0]])scores[gan[p[0]]]++;if(zhi[p[1]])scores[zhi[p[1]]]++;}); return {pillars,scores};
}

export default function Home(){
  const [view,setView]=useState<View>('home'); const [calendar,setCalendar]=useState<CalendarType>('solar'); const [date,setDate]=useState('1995-06-15'); const [time,setTime]=useState('12:00'); const [timeKnown,setTimeKnown]=useState(true); const [leap,setLeap]=useState(false);
  const [profile,setProfile]=useState<ReturnType<typeof getProfile>|null>(null); const [goalId,setGoalId]=useState('career'); const [step,setStep]=useState(0); const [answers,setAnswers]=useState(blank()); const [record,setRecord]=useState(''); const [done,setDone]=useState(false); const [interested,setInterested]=useState(false); const [sound,setSound]=useState(false); const audio=useRef<{ctx:AudioContext;source:AudioBufferSourceNode}|null>(null);
  const goal=goals.find(g=>g.id===goalId)??goals[0]; const total=profile?Object.values(profile.scores).reduce((a,b)=>a+b,0):1;
  const least=useMemo(()=>profile?order.reduce((a,b)=>profile.scores[a]<=profile.scores[b]?a:b):'water',[profile]);
  const recommended=useMemo(()=>{const s={...answers};s[goal.element]+=2;return order.reduce((a,b)=>s[a]>=s[b]?a:b)},[answers,goal.element]); const current=elements[recommended];
  const begin=()=>{try{setProfile(getProfile(date,time,calendar,timeKnown,leap));setView('profile');scrollTo(0,0)}catch{alert('입력한 날짜와 음력 윤달 여부를 다시 확인해주세요.')}};
  const answer=(score:number)=>{const key=questions[step].element;setAnswers(v=>({...v,[key]:v[key]+score}));step===4?setView('result'):setStep(v=>v+1)};
  const stopSound=()=>{audio.current?.source.stop();void audio.current?.ctx.close();audio.current=null;setSound(false)};
  const toggleSound=()=>{if(sound){stopSound();return}const ctx=new AudioContext();const buffer=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate);const data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=last*.985+(Math.random()*2-1)*.015;data[i]=last*2.8}const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=900;gain.gain.value=.18;source.connect(filter).connect(gain).connect(ctx.destination);source.start();audio.current={ctx,source};setSound(true)};
  const reset=()=>{stopSound();setStep(0);setAnswers(blank());setRecord('');setDone(false);setInterested(false);setView('birth');scrollTo(0,0)};
  const previous:Partial<Record<View,View>>={birth:'home',profile:'birth',goal:'profile',checkin:'goal',result:'checkin'};
  const progress={birth:1,profile:2,goal:3,checkin:4,result:5}[view]??0;
  return <main>
    <header><button className="brand" onClick={()=>setView('home')}><span>五</span><b>5 ELEMENTS</b></button><div className="flow"><span>INPUT</span><i/><span>RECORD</span><i/><span>PRACTICE</span><i/><span>BALANCE</span></div><button className="pill" onClick={()=>setView('birth')}>나의 오행 보기</button></header>
    {view==='home'&&<>
      <section className="hero"><div><p className="eyebrow">FROM INSIGHT TO ACTION</p><h1>나를 이루는 오행을 알고,<br/><em>원하는 방향으로 움직입니다.</em></h1><p className="lead">사주에서 발견한 오행의 기본 구성과 지금의 고민을 연결해, 오늘 실천할 수 있는 하나의 리추얼을 제안합니다.</p><button className="cta" onClick={()=>setView('birth')}>3분 오행 리추얼 시작하기 <ArrowRight/></button><small>가입 없이 시작 · 미래를 예측하지 않는 자기이해 도구</small></div><div className="orbit"><div className="core"><small>지금의 나</small><strong>衡</strong><small>BALANCE</small></div>{order.map((k,i)=><div className={`node n${i}`} style={{'--c':elements[k].color} as React.CSSProperties} key={k}><strong>{elements[k].hanja}</strong><span>{elements[k].ko}</span></div>)}</div></section>
      <section className="approach"><p className="eyebrow dark">OUR APPROACH</p><h2>부족함에 집착하기보다,<br/>지금 필요한 태도를 빌려보세요.</h2><div className="approach-grid">{[['01','타고난 구성','생년월일시의 여덟 글자에서 기본 오행 분포를 살펴봅니다.'],['02','현재의 목표','이직, 시작, 관계, 생활처럼 지금 움직이고 싶은 영역을 고릅니다.'],['03','오늘의 행동','오행의 관점을 질문과 기록, 작은 실천으로 바꿉니다.']].map(x=><article key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></section>
      <section className="perspectives"><div><p className="eyebrow">FIVE PERSPECTIVES</p><h2>다섯 가지 관점,<br/>하나의 움직임.</h2></div><div className="element-list">{order.map(k=><article style={{'--c':elements[k].color} as React.CSSProperties} key={k}><strong>{elements[k].hanja}</strong><div><small>{elements[k].ko} · {elements[k].en}</small><h3>{elements[k].verb}</h3><p>{elements[k].meaning}</p></div></article>)}</div></section>
      <section className="heritage"><span>水</span><div><p className="eyebrow">FROM HERITAGE TO RITUAL</p><h2>오래된 지혜를<br/>오늘의 질문으로.</h2><p>먹의 농도를 물 한 방울로 조절하던 백자 청채 물고기모양 연적의 쓰임을, 고민의 농도를 스스로 조절하는 리추얼로 다시 읽습니다.</p></div></section>
    </>}
    {view!=='home'&&<section className={`experience ${view==='result'?'result-bg':''}`} style={view==='result'?{'--accent':current.color,'--soft':current.soft} as React.CSSProperties:undefined}>
      <nav><button onClick={()=>setView(previous[view]??'home')}><ArrowLeft/> 이전</button><div>{[1,2,3,4,5].map(i=><i className={i<=progress?'on':''} key={i}/>)}</div><span>0{progress} / 05</span></nav>
      {view==='birth'&&<div className="two-col"><div><p className="eyebrow">INPUT</p><h1>나를 이루는<br/>오행을 살펴봅니다.</h1><p className="muted">생년월일시로 사주의 네 기둥을 구하고, 여덟 글자에 나타난 기본 오행 분포를 확인합니다.</p><aside>입력한 정보는 이 화면에서 계산하는 데만 사용하며 별도로 저장하지 않습니다.</aside></div><div className="form"><label>달력</label><div className="segment"><button className={calendar==='solar'?'selected':''} onClick={()=>setCalendar('solar')}>양력</button><button className={calendar==='lunar'?'selected':''} onClick={()=>setCalendar('lunar')}>음력</button></div><label>생년월일<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>{calendar==='lunar'&&<label className="check"><input type="checkbox" checked={leap} onChange={e=>setLeap(e.target.checked)}/> 윤달로 입력할게요</label>}<label className="check"><input type="checkbox" checked={timeKnown} onChange={e=>setTimeKnown(e.target.checked)}/> 출생 시간을 알고 있어요</label>{timeKnown&&<label>출생 시간<input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label>}<button className="submit" onClick={begin}>기본 오행 확인하기 <ArrowRight/></button><small>베타 버전은 천간·지지 8글자의 주 오행을 같은 비중으로 집계합니다. 출생 시간을 모르면 6글자로 계산하며, 용신이나 운세를 단정하지 않습니다.</small></div></div>}
      {view==='profile'&&profile&&<div className="two-col"><div><p className="eyebrow">MY ELEMENTS</p><h1>나의 기본<br/>오행 구성</h1><p className="muted">많고 적음은 좋고 나쁨이 아니라, 나를 관찰하는 하나의 출발점이에요.</p><div className="pillars">{profile.pillars.map((p,i)=><div key={p+i}><small>{['년주','월주','일주','시주'][i]}</small><strong>{p}</strong></div>)}</div></div><div className="chart">{order.map(k=>{const percent=Math.round(profile.scores[k]/total*100);return <div className={k===least?'least':''} style={{'--c':elements[k].color} as React.CSSProperties} key={k}><span><strong>{elements[k].hanja}</strong>{elements[k].ko} · {elements[k].en}</span><i><b style={{width:`${Math.max(percent,4)}%`}}/></i><em>{percent}%</em></div>})}<article className="insight"><strong>{elements[least].hanja}</strong><div><small>상대적으로 적게 나타난 오행</small><h3>{elements[least].ko} · {elements[least].en}</h3><p>이 결과만으로 삶의 결핍을 단정하지 않습니다. 현재 목표를 더해 지금 활용할 관점을 찾아볼게요.</p></div></article><button className="submit bright" onClick={()=>setView('goal')}>현재 고민과 연결하기 <ArrowRight/></button></div></div>}
      {view==='goal'&&<div className="two-col goal"><div><p className="eyebrow">CURRENT DESIRE</p><h1>지금 가장<br/>움직이고 싶은 것은?</h1><p className="muted">사주는 출발점을 보여주고, 목표는 오늘 사용할 오행의 방향을 정합니다.</p></div><div className="goal-list">{goals.map((g,i)=><button className={goalId===g.id?'selected':''} onClick={()=>setGoalId(g.id)} key={g.id}><span>0{i+1}</span><div><strong>{g.label}</strong><p>{g.copy}</p></div><i>{elements[g.element].hanja}</i></button>)}<button className="submit bright" onClick={()=>{setStep(0);setAnswers(blank());setView('checkin')}}>5개의 질문 이어가기 <ArrowRight/></button></div></div>}
      {view==='checkin'&&<div className="checkin"><div className="q-progress"><span>0{step+1}</span><i><b style={{width:`${(step+1)*20}%`}}/></i><span>05</span></div><p className="eyebrow">NOW, OBSERVE</p><h1>{questions[step].text}</h1><div className="answers">{[['전혀 아니에요',0],['조금 그래요',1],['꽤 그래요',2],['매우 그래요',3]].map(([l,s],i)=><button onClick={()=>answer(Number(s))} key={String(l)}><span>0{i+1}</span><strong>{l}</strong><ArrowRight/></button>)}</div><small>정답은 없습니다. 오늘의 상태에 가장 가까운 답을 골라주세요.</small></div>}
      {view==='result'&&profile&&<div className="result"><div className="result-hero"><p className="eyebrow">YOUR RITUAL</p><div className="symbol"><span>{current.hanja}</span><i/><i/></div><small>지금 활용할 오행의 관점</small><h1>{current.ko} · {current.en}</h1><h2>{current.verb}</h2><p>{goal.label}이라는 현재 목표에는 <b>{current.ko}({current.hanja})의 태도</b>가 먼저 도움이 될 수 있어요. {current.meaning}입니다.</p></div><div className="contrast"><article><small>타고난 구성에서 적게 나타난 오행</small><strong>{elements[least].hanja}</strong><span>{elements[least].ko} · {elements[least].en}</span></article><ArrowRight/><article className="active"><small>현재 목표에 활용할 오행</small><strong>{current.hanja}</strong><span>{current.ko} · {current.en}</span></article></div><div className="ritual"><div><p className="eyebrow dark">DAY 01 · FREE RITUAL</p><h2>인사이트를 오늘의<br/>행동으로 바꿔보세요.</h2></div><article><span>01 · 觀 OBSERVE</span><h3>{current.question}</h3></article><article><span>02 · 記 RECORD</span><textarea value={record} onChange={e=>setRecord(e.target.value)} placeholder="답을 고치지 말고 천천히 적어보세요..."/></article>{recommended==='water'&&<article><span>AMBIENT · WATER</span><button className="sound" onClick={toggleSound}>{sound?<Pause/>:<Play/>}<div><strong>{sound?'물의 흐름을 듣는 중':'물결 집중 사운드'}</strong><small>기록하는 동안 잔잔하게 재생됩니다.</small></div><Volume2/></button></article>}<article><span>03 · 行 PRACTICE</span><h3>{current.action}</h3><button className={`complete ${done?'done':''}`} onClick={()=>setDone(!done)}>{done?<><Check/> 오늘의 리추얼 완료</>:<>실천으로 옮기기 <ArrowRight/></>}</button></article><article><span>04 · 衡 BALANCE</span><h3>완벽한 답보다, 내일 다시 조정할 수 있는 움직임을 남겨보세요.</h3></article></div><section className="kit"><div><p className="eyebrow">NEXT 7 DAYS</p><h2>이 리추얼을<br/>손으로 이어간다면?</h2><p>질문 카드와 기록 도구로 구성된 7일 리추얼 키트를 준비하고 있어요. 관심 표시는 첫 제품을 구체화하는 데 반영됩니다.</p></div><article style={{'--c':current.color} as React.CSSProperties}><span>{current.hanja}</span><small>{current.ko} · {current.en}</small><h3>{current.kit}</h3><ul><li>7일 질문 카드</li><li>행동 트래커</li><li>오행 그래픽 카드</li>{recommended==='water'&&<li>물결 사운드 QR</li>}</ul><button onClick={()=>setInterested(true)}>{interested?<><Check/> 관심을 남겼어요</>:<>이 키트가 궁금해요 <ArrowRight/></>}</button></article></section><div className="restart"><button onClick={reset}><RotateCcw/> 처음부터 다시 보기</button><p>오행 결과는 미래를 예측하거나 중요한 결정을 대신하지 않습니다.</p></div></div>}
    </section>}
    <footer><div className="brand"><span>五</span><b>5 ELEMENTS</b></div><p>From insight to action. 전통의 균형 철학을 오늘의 행동으로.</p><small>© 2026 5 Elements</small></footer>
  </main>
}

