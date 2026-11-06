const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('email lookup parses the response body rather than its load event', () => {
  const elements = Object.fromEntries(['orderList','submitButton','emailInput','orderInput','filterBox','filterButton'].map(id => [id, {
    value: '', innerHTML: '', addEventListener(_, fn) { this.click = fn; }
  }]));
  const requests = [];
  class XMLHttpRequest {
    open(method, url) { this.method = method; this.url = url; }
    setRequestHeader() {}
    send() { requests.push(this); }
  }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../2-day/assignment-1-coffee-orders/app.js'), 'utf8'), {
    document: { getElementById: id => elements[id] }, XMLHttpRequest, console
  });
  elements.filterBox.value = 'person+tag@example.com';
  elements.filterButton.click();
  const request = requests.at(-1);
  assert.ok(request.url.endsWith('person%2Btag%40example.com'));
  request.responseText = JSON.stringify({ emailAddress: 'person+tag@example.com', coffee: 'Latte' });
  request.onload({ type: 'load' });
  assert.match(elements.orderList.innerHTML, /person\+tag@example\.com/);
  assert.match(elements.orderList.innerHTML, /Latte/);
  assert.doesNotMatch(elements.orderList.innerHTML, /undefined/);
});
