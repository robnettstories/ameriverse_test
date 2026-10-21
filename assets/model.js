// All records and people are fictional. Monetary values are USD, rounded to dollars.
export const AS_OF = '2026-10-21';
export const DAY = 86400000;
export const asOfTime = Date.parse(AS_OF + 'T12:00:00Z');
export const dateAfter = day => new Date(asOfTime + day * DAY).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);
export const sum = (rows, key) => rows.reduce((total, row) => total + (typeof key === 'function' ? key(row) : row[key]), 0);
const million = n => Math.round(n * 1e6);
const seeds = [
// id, name, location, region, contract M, progress, invoiced M, collected M, PM, risk, stage, AP M, observations, high, hours
 ['AT-2401','Federal Medical Center','San Antonio, TX','South',40,.62,20.8,15.4,'Ava Mitchell','Critical','Construction',1.15,42,4,126000],
 ['AT-2402','Coastal Facilities Services','Charleston, SC','South',1.2,.64,.71,.64,'Ava Mitchell','Healthy','Construction',.04,5,0,8800],
 ['AT-2403','Pacific Research Campus','San Diego, CA','West',28,.48,11.2,8.6,'Marcus Reed','At risk','Construction',.72,24,2,87000],
 ['AT-2404','Rocky Mountain Operations','Denver, CO','West',8.5,.73,5.6,4.8,'Marcus Reed','Watch','Construction',.24,12,1,36000],
 ['AT-2405','Great Lakes Modernization','Chicago, IL','Central',18,.59,9.3,7.7,'Elena Brooks','At risk','Construction',.49,29,3,63000],
 ['AT-2406','Capital Annex Renovation','Arlington, VA','East',14,.82,10.8,9.1,'Daniel Hayes','Watch','Closeout',.31,18,1,54000],
 ['AT-2407','Northeast Energy Retrofit','Boston, MA','East',6.8,.36,2.2,1.9,'Daniel Hayes','Healthy','Construction',.11,8,0,21500],
 ['AT-2408','Plains Logistics Center','Omaha, NE','Central',12,.18,1.65,1.2,'Elena Brooks','Watch','Mobilization',.18,7,0,18000],
 ['AT-2409','Desert Infrastructure','Phoenix, AZ','West',3.5,.96,3.25,2.88,'Marcus Reed','Healthy','Closeout',.07,9,0,29000],
 ['AT-2410','Gulf Preventive Maintenance','Mobile, AL','South',.85,.61,.48,.43,'Ava Mitchell','Healthy','Construction',.025,4,0,6200],
 ['AT-2411','Midwest Building Services','Columbus, OH','Central',1.5,.60,.83,.75,'Elena Brooks','Healthy','Construction',.045,6,0,10500],
 ['AT-2412','Atlantic Training Facility','Norfolk, VA','East',9,.12,.72,.56,'Daniel Hayes','At risk','Mobilization',.19,6,1,12500]
];
export const projects = seeds.map((s, i) => {
  const [id,name,location,region,value,progress,billed,collected,pm,risk,stage,ap,observations,high,hours] = s;
  const contract = million(value), earned = Math.round(contract * progress), invoiced = million(billed), paid = million(collected);
  const retainage = Math.round(invoiced * .05), outstanding = invoiced - paid - retainage;
  const age = [12 + i % 8, 35 + i % 18, 67 + i % 27];
  const weights = [.45,.35,.2];
  const invoices = weights.map((weight, j) => ({id:`${id}-${j+1}`,amount:Math.round(outstanding * weight),issued:dateAfter(-age[j]),paid:null,expectedDay:[14,28,49][j]+i%4*3}));
  // Preserve exact reconciliation after rounding.
  invoices[2].amount = outstanding - invoices[0].amount - invoices[1].amount;
  invoices.push({id:`${id}-P1`,amount:Math.round(paid*.6),issued:dateAfter(-120-i),paid:dateAfter(-120-i+31+i%5*3)});
  invoices.push({id:`${id}-P2`,amount:paid-invoices[3].amount,issued:dateAfter(-70-i),paid:dateAfter(-70-i+36+i%6*2)});
  const unbilled = Math.max(earned - invoiced, 0);
  return {id,name,location,region,contract,progress,earned,invoiced,collected:paid,pm,risk,stage,apPending:million(ap),apApproved:million(ap*.45),apAge:8+i%5*4,observations,high,hours,retainage,invoices,
    customer:['Federal Health Agency','Coastal Public Works','National Research Authority','Regional Facilities Office'][i%4],
    unapproved:Math.round(contract*(i%3===0?.025:.008)),
    unbilled, eligible:Math.round(unbilled*.72), stageAge:6+i%6*3,
    billingStage:['Missing field evidence','Ready for COR buy-in','Internal QC','Signature routing'][i%4],
    apm:[.5,.25,.5,.25,.5,.25,.25,0,.25,0,.25,0][i],
    totalCost:Math.round(contract*(i%3===0?.88:.82)), remainingDays:stage==='Closeout'?100:stage==='Mobilization'?420:260,
    futureBillingDay:28+i%4*7, collectionLag:35+i%3*7,
    billingHistory:[{amount:Math.round(invoiced*.6),completed:dateAfter(-138-i),submitted:dateAfter(-120-i)},{amount:Math.round(invoiced*.4),completed:dateAfter(-82-i),submitted:dateAfter(-70-i)}]
  };
});
export const availableStaff = [
  {name:'Noah Bennett',role:'APM',available:1,skills:'Field evidence · QC preparation'},
  {name:'Maya Chen',role:'APM',available:.5,skills:'Submittals · COR preparation'},
  {name:'Jordan Ellis',role:'APM',available:.5,skills:'Closeout · Documentation'},
  {name:'Sam Rivera',role:'Billing',available:1,skills:'AIA review · AP approval packets'}
];
export const capacity = {apm:sum(availableStaff.filter(s=>s.role==='APM'),'available'),billing:sum(availableStaff.filter(s=>s.role==='Billing'),'available')};
export const emptyScenario = () => ({allocations:{},daysPerAPM:8,daysPerBilling:10,apDays:14,receiptConfidence:.9});
export function usedCapacity(scenario, role) {return sum(Object.values(scenario.allocations), a=>a[role]||0);}
export function allocate(scenario, id, role, value) {
  if (!projects.some(p=>p.id===id) || !['apm','billing'].includes(role)) return scenario;
  const current=scenario.allocations[id]?.[role]||0;
  const spare=capacity[role]-usedCapacity(scenario,role)+current;
  const amount=Math.max(0,Math.min(spare,Math.round(Number(value)*2)/2));
  return {...scenario,allocations:{...scenario.allocations,[id]:{...scenario.allocations[id],[role]:amount}}};
}
export function timing(p, scenario=emptyScenario()) {
  const a=scenario.allocations[p.id]||{};
  const advance=Math.min(21,(a.apm||0)*scenario.daysPerAPM+(a.billing||0)*scenario.daysPerBilling);
  return {advance,submissionDay:Math.max(7,p.futureBillingDay-advance),receiptDay:Math.max(7,p.futureBillingDay-advance)+p.collectionLag,apDay:Math.max(7,35+projects.indexOf(p)%4*7-Math.min(21,(a.billing||0)*scenario.apDays+(a.apm||0)*4))};
}
export const cohort = p => p.contract>=25e6?'Large · $25M+':p.contract>=2e6?'Mid · $2–25M':'Services · <$2M';
export function selectProjects(filters) {return projects.filter(p=>(!filters.region||p.region===filters.region)&&(!filters.cohort||cohort(p)===filters.cohort)&&(!filters.stage||p.stage===filters.stage)&&(!filters.risk||p.risk===filters.risk)&&(!filters.search||`${p.id} ${p.name} ${p.location} ${p.pm}`.toLowerCase().includes(filters.search.toLowerCase())));}
export function metrics(rows) {
  const invoices=rows.flatMap(p=>p.invoices), paid=invoices.filter(i=>i.paid), open=invoices.filter(i=>!i.paid);
  const history=rows.flatMap(p=>p.billingHistory);
  return {contract:sum(rows,'contract'),earned:sum(rows,'earned'),invoiced:sum(rows,'invoiced'),collected:sum(rows,'collected'),unbilled:sum(rows,'unbilled'),retainage:sum(rows,'retainage'),ap:sum(rows,'apPending'),ar:sum(open,'amount'),paidCount:paid.length,openCount:open.length,billingCount:history.length,
    paidDays:sum(paid,i=>daysBetween(i.issued,i.paid)*i.amount)/(sum(paid,'amount')||1),
    billingDays:sum(history,i=>daysBetween(i.completed,i.submitted)*i.amount)/(sum(history,'amount')||1),
    aging:[0,1,2,3].map(bucket=>sum(open.filter(i=>Math.min(3,Math.floor((daysBetween(i.issued,AS_OF)-1)/30))===bucket),'amount')),
    high:sum(rows,'high'),observations:sum(rows,'observations'),hours:sum(rows,'hours')};
}
export const projectWeight = p => (p.contract>=25e6?2.6:p.contract>=10e6?1.8:p.contract>=2e6?1:.6)*(p.stage==='Mobilization'?1.25:p.stage==='Closeout'?1.15:1);
export function teams(rows=projects,scenario=emptyScenario()) {
  return [...new Set(rows.map(p=>p.pm))].map(name=>{
    const jobs=rows.filter(p=>p.pm===name),load=sum(jobs,p=>projectWeight(p)*Math.max(.45,1-.2*(p.apm+(scenario.allocations[p.id]?.apm||0))-.12*(scenario.allocations[p.id]?.billing||0)));
    return {name,jobs:jobs.length,load,utilization:load/3,apm:sum(jobs,'apm')};
  });
}
// One enterprise forecast: all projects, opening cash, weekly project costs and corporate costs.
// Filters intentionally do not reattribute enterprise opening cash to a project subset.
export function forecast(scenario=emptyScenario()) {
  const weeks=Array.from({length:12},(_,i)=>({week:i+1,date:dateAfter((i+1)*7),receipts:0,futureCosts:0,ap:0,overhead:310000,closing:0}));
  const add=(day,key,amount)=>{const index=Math.floor(Math.max(0,day-1)/7);if(index<weeks.length) weeks[index][key]+=Math.round(amount);};
  for(const p of projects) {
    for(const invoice of p.invoices.filter(i=>!i.paid)) add(invoice.expectedDay,'receipts',invoice.amount*scenario.receiptConfidence);
    const t=timing(p,scenario);
    add(t.receiptDay,'receipts',p.eligible*.95*scenario.receiptConfidence); // 5% retained; never collect retainage early.
    add(10+projects.indexOf(p)%3*7,'ap',p.apApproved);
    add(t.apDay,'ap',p.apPending);
    const future=(p.totalCost*(1-p.progress))*Math.min(84/p.remainingDays,1);
    weeks.forEach(w=>w.futureCosts+=Math.round(future/12));
  }
  let cash=2600000;
  for(const w of weeks) {cash+=w.receipts-w.futureCosts-w.ap-w.overhead;w.closing=cash;w.outflows=w.futureCosts+w.ap+w.overhead;}
  return {opening:2600000,weeks,min:Math.min(2600000,...weeks.map(w=>w.closing)),closing:cash,receipts:sum(weeks,'receipts'),outflows:sum(weeks,'outflows')};
}
export const tasks = projects.flatMap((p,i)=>[
  {id:p.id+'-evidence',project:p.id,owner:p.pm,title:i%3===0?'Resolve missing field evidence':'Prepare COR billing review',due:i%3===0?'2026-10-19':'2026-10-24',kind:'Billing',age:p.stageAge},
  {id:p.id+'-ap',project:p.id,owner:i%2?'Sam Rivera':p.pm,title:'Review subcontractor approval packet',due:'2026-10-22',kind:'AP approval',age:p.apAge}
]);
export const milestones=[['19','Field evidence','PM + Superintendent'],['20','Invoices + internal QC','PM / APM'],['21–24','COR buy-in','PM + Superintendent'],['25','Signature routing','Billing coordinator'],['Month end','Signed AIA + upload','Billing coordinator'],['+48h','Platform status check','Billing coordinator']];
export const workflows = [
  {title:'AIA Billing by Date',category:'Billing',description:'The monthly rhythm: field evidence, internal QC, COR buy-in and final upload.',href:'aia-billing-by-date.html',tag:'MONTHLY PLAYBOOK',count:'16 deadlines'},
  {title:'AIA Billing Flow Chart',category:'Billing',description:'Follow the complete progress-billing process, one decision at a time.',href:'aia-billing-flow-chart.html',tag:'PROCESS MAP',count:'Interactive steps'},
  {title:'Subcontract Buyout',category:'Procurement',description:'From scope alignment and bid leveling to an executed subcontract.',href:'subcontract-buyout-flow-chart.html',tag:'PROCUREMENT',count:'Original workflow'},
  {title:'APM Project Lifecycle',category:'Project management',description:'A practical guide from award and mobilization through project closeout.',href:'apm-project-workflow.html',tag:'PROJECT DELIVERY',count:'Full lifecycle'}
];
export const subcontractors = [
  {name:'Summit Mechanical',trade:'Mechanical',n:18,schedule:88,rework:92,safety:96,closure:82,watch:false,disqualified:false},
  {name:'Blue Ridge Electric',trade:'Electrical',n:12,schedule:71,rework:84,safety:94,closure:65,watch:true,disqualified:false},
  {name:'Keystone Interiors',trade:'Interiors',n:9,schedule:94,rework:90,safety:98,closure:91,watch:false,disqualified:false},
  {name:'Atlas Civil Works',trade:'Civil',n:3,schedule:68,rework:null,safety:90,closure:61,watch:true,disqualified:false},
  {name:'Legacy Demo Vendor',trade:'Archived',n:2,schedule:null,rework:null,safety:null,closure:null,watch:false,disqualified:true}
];
export function qualityScore(s) {
  const weights={schedule:.35,rework:.25,safety:.25,closure:.15};
  const known=Object.keys(weights).filter(k=>s[k]!=null);
  return known.length?sum(known,k=>s[k]*weights[k])/sum(known,k=>weights[k]):null;
}
export const bids=[{status:'Won',value:40e6},{status:'Won',value:1.2e6},{status:'Won',value:8.5e6},{status:'Won',value:6.8e6},{status:'Lost',value:22e6},{status:'Lost',value:11e6},{status:'Lost',value:4e6},{status:'Pending',value:34e6}];
export function bidMetrics(){const decided=bids.filter(b=>b.status!=='Pending'),won=decided.filter(b=>b.status==='Won');return {count:won.length/decided.length,value:sum(won,'value')/sum(decided,'value'),won:won.length,decided:decided.length,pending:bids.length-decided.length};}
