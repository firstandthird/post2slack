'use strict';
const test = require('tape');
const post2slack = require('../index.js')({});

test('converts a basic message passed as string ', (t) => {
  const expectedPacket = {
    attachments: [{
      fallback: 'a string',
      title: 'a string',
      fields: [{
        title: 'Tags',
        value: 'test'
      }]
    }],
  };
  const packetString = post2slack.makeSlackPayload(['test'], 'a string');
  t.equal(typeof packetString, 'string');
  const packet = JSON.parse(packetString);
  t.deepEqual(packet, expectedPacket);
  t.end();
});

test('lets you post an object as the message', (t) => {
  const expectedPacket = {
    attachments: [{
      text: '``` {\n  "data": "this is an object"\n} ```',
      mrkdwn_in: ['text'],
      fields: []
    }],
  };
  const packet = JSON.parse(post2slack.makeSlackPayload([], {
    data: 'this is an object'
  }));
  t.deepEqual(packet, expectedPacket);
  t.end();
});

test('"error" tag will set the "danger" color option', (t) => {
  const expectedPacket = {
    attachments: [{
      color: 'danger',
      title: 'some text',
      fallback: 'some text',
      fields: [{
        title: 'Tags',
        value: 'error'
      }]
    }],
  };
  const packet = JSON.parse(post2slack.makeSlackPayload(['error'], 'some text'));
  t.deepEqual(packet, expectedPacket);
  t.end();
});

test('warning tags will have a yellow swatch', (t) => {
  const expectedPacket = {
    attachments: [{
      color: 'warning',
      title: 'test msg',
      fallback: 'test msg',
      fields: [{
        title: 'Tags',
        value: 'warning'
      }]
    }],
  };
  const packet = JSON.parse(post2slack.makeSlackPayload(['warning'], 'test msg'));
  t.deepEqual(packet, expectedPacket);
  t.end();
});

test('"success" tags will have a "good" color', (t) => {
  const expectedPacket = {
    attachments: [{
      color: 'good',
      title: 'a string',
      fallback: 'a string',
      fields: [{
        title: 'Tags',
        value: 'success'
      }]
    }],
  };
  const packet = JSON.parse(post2slack.makeSlackPayload(['success'], 'a string'));
  t.deepEqual(packet, expectedPacket);
  t.end();
});
test('lets you post an object with a special "message" field', (t) => {
  const expectedPacket = {
    attachments: [{
      title: 'this is the message that was pulled out of the object below',
      fallback: 'this is the message that was pulled out of the object below',
      text: '``` {\n  "data": "this is an object and should be formatted"\n} ```',
      mrkdwn_in: ['text'],
      fields: []
    }],
  };
  const packet = JSON.parse(post2slack.makeSlackPayload([], {
    message: 'this is the message that was pulled out of the object below',
    data: 'this is an object and should be formatted'
  }));
  t.deepEqual(packet, expectedPacket);
  t.end();
});
test('lets you post an object without a "message" field', (t) => {
  const expectedPacket = {
    attachments: [{
      text: '``` {\n  "data": "this is an object and should be formatted"\n} ```',
      mrkdwn_in: ['text'],
      fields: []
    }],
  };
  const packet = JSON.parse(post2slack.makeSlackPayload([], {
    data: 'this is an object and should be formatted'
  }));
  t.deepEqual(packet, expectedPacket);
  t.end();
});

test('lets you set the title_link with a url field', (t) => {
  const expectedPacket = {
    attachments: [{
      fields: [],
      title: 'this is the message that was pulled out of the object below',
      fallback: 'this is the message that was pulled out of the object below',
      title_link: 'http://example.com',
      text: '``` {\n  "data": "this is an object and should be formatted"\n} ```',
      mrkdwn_in: ['text'],
    }],
  };
  const packet = JSON.parse(post2slack.makeSlackPayload([], {
    message: 'this is the message that was pulled out of the object below',
    data: 'this is an object and should be formatted',
    url: 'http://example.com'
  }));
  t.deepEqual(packet, expectedPacket);
  t.end();
});
test('will use a supplied username', (t) => {
  const expectedPacket = {
    username: 'Jared',
    attachments: [{
      title: 'a string',
      fallback: 'a string',
      fields: []
    }],
  };
  const localSlack2Post = require('../index.js')({
    username: 'Jared'
  });
  const packet = JSON.parse(localSlack2Post.makeSlackPayload([], 'a string'));
  t.deepEqual(packet, expectedPacket);
  t.end();
});
test('will let you specify additional fields in options', (t) => {
  const expectedPacket = {
    attachments: [{
      fields: [
        { title: 'hi', value: 'there' },
        { title: 'go', value: 'away' }
      ],
      fallback: 'hi there',
      title: 'hi there'
    }],
  };
  const localSlack2Post = require('../index.js')({
    additionalFields: [
      { title: 'hi', value: 'there' },
      { title: 'go', value: 'away' }
    ]
  });
  const packet = JSON.parse(localSlack2Post.makeSlackPayload([], 'hi there'));
  t.deepEqual(packet.attachments[0], expectedPacket.attachments[0]);
  t.end();
});
test('will hide tags when indicated', (t) => {
  const expectedPacket = {
    attachments: [{
      title: 'hi there',
      fallback: 'hi there',
      fields: []
    }],
  };
  const localSlack2Post = require('../index.js')({
    hideTags: true
  });
  const packet = JSON.parse(localSlack2Post.makeSlackPayload(['tags', 'more tags'], 'hi there'));
  t.deepEqual(packet, expectedPacket);
  t.end();
});
test('will post to a specific channel', (t) => {
  const expectedPacket = {
    attachments: [{
      title: 'a message',
      fallback: 'a message',
      fields: []
    }],
    channel: 'MTV'
  };
  const localSlack2Post = require('../index.js')({
    channel: 'MTV'
  });
  const packet = JSON.parse(localSlack2Post.makeSlackPayload([], 'a message'));
  t.deepEqual(packet, expectedPacket);
  t.end();
});
test('will post with a provided icon URL', (t) => {
  const expectedPacket = {
    attachments: [{
      title: 'a string',
      fallback: 'a string',
      fields: []
    }],
    icon_url: 'http://image.com'
  };
  const localSlack2Post = require('../index.js')({
    iconURL: 'http://image.com'
  });
  const packet = JSON.parse(localSlack2Post.makeSlackPayload([], 'a string'));
  t.deepEqual(packet, expectedPacket);
  t.end();
});
