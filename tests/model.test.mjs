import test from 'node:test';
import assert from 'node:assert/strict';
import {projects,metrics,forecast,emptyScenario,allocate,capacity,usedCapacity,timing,teams,cohort,selectProjects,sum,qualityScore,subcontractors,bidMetrics,daysBetween,AS_OF} from '../assets/model.js';

test('Every financial record reconciles earned, invoiced, collected, open and retained balances',()=>{
 for(const p of projects){assert.equal(p.earned,Math.round(p.contract*p.progress));assert.equal(p.unbilled,Math.max(p.earned-p.invoiced,0));assert.equal(sum(p.invoices.filter(i=>i.paid),'amount'),p.collected);assert.equal(sum(p.invoices,'amount')+p.retainage,p.invoiced);assert.ok(p.eligible<=p.unbilled);assert.ok(p.invoices.every(i=>i.amount>=0));}
 const m=metrics(projects);assert.equal(m.collected+m.ar+m.retainage,m.invoiced);assert.equal(sum(m.aging,n=>n),m.ar);
});
test('Paid cycle and completion-to-billing calculations use weighted amounts and real denominators',()=>{
 const m=metrics(projects),paid=projects.flatMap(p=>p.invoices).filter(i=>i.paid);assert.equal(m.paidCount,24);assert.equal(m.openCount,36);assert.equal(m.billingCount,24);assert.equal(m.paidDays,sum(paid,i=>daysBetween(i.issued,i.paid)*i.amount)/sum(paid,'amount'));assert.ok(projects.flatMap(p=>p.invoices).filter(i=>!i.paid).every(i=>daysBetween(i.issued,AS_OF)>0));assert.equal(metrics([]).paidCount,0);
});
test('Scenario cannot allocate more APM or billing capacity than is actually available',()=>{
 let s=emptyScenario();for(const p of projects){s=allocate(s,p.id,'apm',99);s=allocate(s,p.id,'billing',99);}assert.equal(usedCapacity(s,'apm'),capacity.apm);assert.equal(usedCapacity(s,'billing'),capacity.billing);s=allocate(s,projects[0].id,'apm',0);assert.equal(usedCapacity(s,'apm'),0);s=allocate(s,projects[1].id,'apm',-5);assert.ok(usedCapacity(s,'apm')>=0);assert.equal(allocate(s,'nonexistent','apm',2),s);
});
test('All cash buckets reconcile; scenario changes timing without increasing earned value or reducing commitments',()=>{
 const before=JSON.stringify(projects),baseline=forecast();let s=allocate(allocate(emptyScenario(),projects[0].id,'apm',1),projects[0].id,'billing',1);const alternative=forecast(s);for(const f of [baseline,alternative]){assert.equal(f.weeks.length,12);let cash=f.opening;for(const w of f.weeks){assert.equal(w.outflows,w.futureCosts+w.ap+w.overhead);cash+=w.receipts-w.outflows;assert.equal(w.closing,cash);}assert.equal(f.closing,f.opening+f.receipts-f.outflows);assert.equal(sum(f.weeks,'ap'),sum(projects,p=>p.apApproved+p.apPending));}assert.equal(alternative.outflows,baseline.outflows);assert.equal(sum(alternative.weeks,'futureCosts'),sum(baseline.weeks,'futureCosts'));assert.ok(timing(projects[0],s).receiptDay<timing(projects[0]).receiptDay);assert.ok(timing(projects[0],s).apDay<timing(projects[0]).apDay);assert.notDeepEqual(alternative.weeks,baseline.weeks);assert.equal(JSON.stringify(projects),before);assert.deepEqual(forecast(emptyScenario()),baseline);
});
test('Cohort comparison contains the $40M project and services projects at similar progress',()=>{
 const comparable=projects.filter(p=>p.progress>=.5&&p.progress<=.75);assert.ok(comparable.some(p=>p.contract===40e6));assert.ok(comparable.some(p=>cohort(p)==='Services · <$2M'));assert.equal(selectProjects({region:'East',stage:'Mobilization'}).length,1);assert.equal(selectProjects({risk:'does not exist'}).length,0);assert.equal(sum(teams(),'jobs'),projects.length);
});
test('Human-review quality score renormalizes missing data and separates disqualification; bid denominators exclude pending',()=>{
 const atlas=subcontractors.find(s=>s.name==='Atlas Civil Works');assert.equal(qualityScore(atlas),(68*.35+90*.25+61*.15)/.75);assert.equal(qualityScore(subcontractors.at(-1)),null);assert.equal(subcontractors.filter(s=>s.watch).length,2);assert.equal(subcontractors.filter(s=>s.disqualified).length,1);assert.equal(bidMetrics().decided,7);assert.equal(bidMetrics().count,4/7);
});
