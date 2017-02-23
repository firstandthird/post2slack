'use strict';
const tape = require('tape');
const tapeExtra = require('tape-extras');
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

test('creates a post2slack class instance', (t) => {
  const post2slack = require('../index.js')({});
  t.equal(typeof post2slack.post, 'function', 'has "post" function');
  t.equal(typeof post2slack.postFormatted, 'function', 'has "postFormatted" function');
  t.end();
});

test('sends a raw message', (t) => {
  // set up a temp server:
  const post2slack = require('../index.js')({ slackHook: 'http://localhost:8080/test1' });
  server.route({
    method: 'POST',
    path: '/test1',
    handler: (request, reply) => {
      t.equal(request.payload.thing, 'is a thing', 'will post a raw package to slack');
      reply({ payload: 'yeah' });
    }
  });
  post2slack.post({ thing: 'is a thing' }, (err, result) => {
    t.equal(err, null, 'does not error by default');
    server.stop(t.end);
  });
});

test('sends a formatted message', (t) => {
  const post2slack = require('../index.js')({ slackHook: 'http://localhost:8080/test2' });
  server.route({
    method: 'POST',
    path: '/test2',
    handler: (request, reply) => {
      t.equal(Array.isArray(request.payload.attachments), true, 'attachments is an array');
      t.equal(request.payload.attachments[0].text.indexOf('is another thing') > -1, true, 'text field is set up correctly');
      t.equal(request.payload.attachments[0].fields[0].title, 'Tags', 'tag fields set up correctly');
      t.equal(request.payload.attachments[0].fields[0].value, 'aTag, anotherTag', 'tag fields set up correctly');
      t.equal(request.payload.attachments[0].mrkdwn_in[0], 'text', 'tag fields set up correctly');
      reply({});
    }
  });
  post2slack.postFormatted(['aTag', 'anotherTag'], { thing: 'is another thing' }, (err, result) => {
    t.equal(err, null, 'does not error by default');
    server.stop(t.end);
  });
});

test('returns errors', (t) => {
  const post2slack = require('../index.js')({ slackHook: 'http://localhost:8080/' });
  post2slack.postFormatted(['aTag', 'anotherTag'], { thing: 'is another thing' }, (err, result) => {
    t.notEqual(err, null, 'returns an error');
    t.equal(err.toString(), 'Error: post to http://localhost:8080/ failed: 404 Not Found');
    server.stop(t.end);
  });
});
