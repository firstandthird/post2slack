'use strict';
const tape = require('tape');
const tapeExtra = require('tape-extras');
const post2slack = require('../index.js');
const Hapi = require('hapi');

let server;
const test = tapeExtra(tape, {
  before(done) {
    server = new Hapi.Server({});
    server.connection({ port: 8080 });
    server.start(done);
  },
  after() {
  }
});


test('sends a message', (t) => {
  // set up a temp server:
  server.route({
    method: 'POST',
    path: '/',
    handler: (req, reply) => {
      t.equal(req.payload.thing, 'is a thing', 'will post a raw package to slack');
      reply({});
    }
  });
  post2slack.post('http://localhost:8080', { thing: 'is a thing' }, (err, result) => {
    console.log('does this call?')
    t.equal(err, null, 'does not error by default');
    console.log(result.result)
    // t.equal(result.payload, , 'does not error by default');
    server.stop(t.end);
  });
});
