'use strict';
const test = require('tap').test;
const Post2Slack = require('../index.js');

const post2slack = new Post2Slack({});

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
  t.match(packet, expectedPacket);
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
  t.match(packet, expectedPacket);
  t.end();
});

test('option to convert an object to fields', (t) => {
  const post2slackWithFields = new Post2Slack({
    json2Fields: true
  });
  const expectedPacket = {
    attachments: [{
      fields: [{
        title: 'name',
        value: 'test'
      },
      {
        title: 'age',
        value: 25
      }]
    }],
  };
  const packet = JSON.parse(post2slackWithFields.makeSlackPayload([], {
    name: 'test',
    age: 25
  }));
  t.match(packet, expectedPacket);
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
  t.match(packet, expectedPacket);
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
  t.match(packet, expectedPacket);
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
  t.match(packet, expectedPacket);
  t.end();
});

test('can take in a tagColors object to over-ride default tags colors', (t) => {
  const expectedPacket = {
    attachments: [{
      color: 'danger',
      title: 'a string',
      fallback: 'a string',
      fields: [{
        title: 'Tags',
        value: 'german'
      }]
    }],
  };
  const post2slackColors = new Post2Slack({
    tagColors: {
      french: 'good',
      english: 'warning',
      german: 'danger'
    }
  });
  const packet = JSON.parse(post2slackColors.makeSlackPayload(['german'], 'a string'));
  t.match(packet, expectedPacket);
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
  t.match(packet, expectedPacket);
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
  t.match(packet, expectedPacket);
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
  t.match(packet, expectedPacket);
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
  const localPost2Slack = new Post2Slack({
    username: 'Jared'
  });
  const packet = JSON.parse(localPost2Slack.makeSlackPayload([], 'a string'));
  t.match(packet, expectedPacket);
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
  const localPost2Slack = new Post2Slack({
    additionalFields: [
      { title: 'hi', value: 'there' },
      { title: 'go', value: 'away' }
    ]
  });
  const packet = JSON.parse(localPost2Slack.makeSlackPayload([], 'hi there'));
  t.match(packet.attachments[0], expectedPacket.attachments[0]);
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
  const localPost2Slack = new Post2Slack({
    hideTags: true
  });
  const packet = JSON.parse(localPost2Slack.makeSlackPayload(['tags', 'more tags'], 'hi there'));
  t.match(packet, expectedPacket);
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
  const localPost2Slack = new Post2Slack({
    channel: 'MTV'
  });
  const packet = JSON.parse(localPost2Slack.makeSlackPayload([], 'a message'));
  t.match(packet, expectedPacket);
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
  const localPost2Slack = new Post2Slack({
    iconURL: 'http://image.com'
  });
  const packet = JSON.parse(localPost2Slack.makeSlackPayload([], 'a string'));
  t.match(packet, expectedPacket);
  t.end();
});
