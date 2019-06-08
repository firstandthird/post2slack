'use strict';
const tap = require('tap');
const Hapi = require('hapi');
const Post2Slack = require('../');
// let server;

tap.test('creates a post2slack class instance', (t) => {
  const post2slack = new Post2Slack({});
  t.equal(typeof post2slack.post, 'function', 'has "post" function');
  t.equal(typeof post2slack.postFormatted, 'function', 'has "postFormatted" function');
  t.end();
});

tap.test('sends a raw message', async(t) => {
  // set up a temp server:
  const server = new Hapi.Server({ port: 8080 });
  await server.start();

  const post2slack = new Post2Slack({ slackHook: 'http://localhost:8080/test1' });
  server.route({
    method: 'POST',
    path: '/test1',
    handler: (request, h) => {
      t.equal(request.payload.thing, 'is a thing', 'will post a raw package to slack');
      return { payload: 'yeah' };
    }
  });
  await post2slack.post({ thing: 'is a thing' });
  await server.stop();
  t.end();
});

tap.test('sends a formatted message', async (t) => {
  const server = new Hapi.Server({ port: 8080 });
  await server.start();

  const post2slack = new Post2Slack({ slackHook: 'http://localhost:8080/test2' });
  server.route({
    method: 'POST',
    path: '/test2',
    handler: (request, h) => {
      t.equal(Array.isArray(request.payload.attachments), true, 'attachments is an array');
      t.equal(request.payload.attachments[0].text.indexOf('is another thing') > -1, true, 'text field is set up correctly');
      t.equal(request.payload.attachments[0].fields[0].title, 'Tags', 'tag fields set up correctly');
      t.equal(request.payload.attachments[0].fields[0].value, 'aTag, anotherTag', 'tag fields set up correctly');
      t.equal(request.payload.attachments[0].mrkdwn_in[0], 'text', 'tag fields set up correctly');
      return {};
    }
  });
  await post2slack.postFormatted(['aTag', 'anotherTag'], { thing: 'is another thing' });
  await server.stop();
  t.end();
});

tap.test('returns errors', async(t) => {
  const post2slack = new Post2Slack({ slackHook: 'http://localhost:8080/' });
  try {
    await post2slack.postFormatted(['aTag', 'anotherTag'], { thing: 'is another thing' });
    t.fail();
  } catch (e) {
    t.equal(e.toString(), 'Error: Client request error: connect ECONNREFUSED 127.0.0.1:8080');
    t.end();
  }
});
