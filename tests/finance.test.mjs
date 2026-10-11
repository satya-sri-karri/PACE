import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, createSeed, decide, parseMoney, payBill, transferSaving, validateBudget } from '../lib/finance.ts';
test('Day 11 baseline and fresh-month arithmetic', () => {
  const m = calculate(createSeed());
  assert.deepEqual([m.balance,m.allowance,m.monthEnd,m.health,m.risk], [740000,16000,90000,70,'Watch']);
  const fresh = calculate(createSeed(true));
  assert.equal(fresh.balance,1000000); assert.equal(fresh.days,30); assert.equal(fresh.monthEnd,210000); assert.ok(Math.abs(fresh.allowance-19333.333333)<.001);
});
test('independent decisions update every financial consequence', () => {
  for (const [decision, expected] of [
    [{type:'purchase',amount:180000,title:'Shopping'},[560000,7000,-90000,16,'High']],
    [{type:'emergency',amount:60000,title:'Repair'},[680000,13000,30000,45,'High']],
    [{type:'income',amount:100000,title:'Extra income'},[840000,21000,190000,100,'Low']],
    [{type:'cancel',amount:0,title:'Cloud',subscriptionId:'cloud'},[740000,16750,105000,78,'Watch']],
  ]) {
    const b=createSeed(), original=JSON.stringify(b), candidate=decide(b,decision,true), m=calculate(candidate);
    assert.equal(JSON.stringify(b),original); assert.deepEqual([m.balance,m.allowance,m.monthEnd,m.health,m.risk],expected);
  }
});
test('paying reserved bills and transferring planned savings do not double charge',()=>{
  const b=createSeed(), original=calculate(b), paid=payBill(b,'room'), saved=transferSaving(b,'emergency',150000);
  for(const result of [paid,saved]) {const m=calculate(result);assert.equal(m.allowance,original.allowance);assert.equal(m.monthEnd,original.monthEnd);assert.ok(validateBudget(result));}
  assert.equal(calculate(saved).saved,150000);assert.equal(calculate(saved).savingsPlan,0);
  assert.throws(()=>payBill(paid,'room'));assert.throws(()=>decide(decide(b,{type:'cancel',amount:0,title:'Cloud',subscriptionId:'cloud'}),{type:'cancel',amount:0,title:'Cloud',subscriptionId:'cloud'}));
});
test('posted essentials are not deducted a second time',()=>{
  const b=decide(createSeed(),{type:'purchase',amount:10000,title:'Food',essential:true});
  assert.equal(calculate(b).futureEssentials,270000); assert.equal(calculate(b).monthEnd,90000);
});
test('invalid amounts, overdraws and corrupt state are rejected',()=>{
  for(const v of ['','-1','1.005','NaN','Infinity','1e4','0'])assert.throws(()=>parseMoney(v));
  assert.equal(parseMoney('0',true),0);assert.equal(parseMoney('12.05'),1205);
  assert.throws(()=>decide(createSeed(),{type:'purchase',amount:900000,title:'Too much'}));
  assert.ok(calculate(decide(createSeed(),{type:'purchase',amount:900000,title:'Preview'},true)).balance<0);
  assert.equal(validateBudget({}),false);
  const corrupt=createSeed();corrupt.transactions=[null];assert.equal(validateBudget(corrupt),false);
  const missingPayment=createSeed();missingPayment.commitments[0].status='paid';assert.equal(validateBudget(missingPayment),false);
});
test('day 30, zero essentials, no goals and overdue obligations remain finite',()=>{
  const b=createSeed(); b.day=30;b.essentials=0;b.goals=[];
  const m=calculate(b);assert.equal(m.days,1);assert.equal(m.monthEnd,520000);assert.ok(Number.isFinite(m.health));
  assert.equal(m.forecast.at(-1).events.length,4);
});
