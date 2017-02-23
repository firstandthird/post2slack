'use strict';
const _ = require('lodash');
const Wreck = require('wreck');

module.exports.config = {};

module.exports.post = (payload, done) => {
  payload = _.isObject(payload) ? JSON.stringify(payload) : payload;
  Wreck.request('POST', module.exports.config.slackHook, {
    headers: { 'Content-type': 'application/json' },
    payload
  }, done);
};

// used by slackPostMessage to construct a nice payload:
const makeSlackPayload = (tags, data) => {
  //clone because we muck with data
  data = _.cloneDeep(data);
  const attachment = {
    fields: []
  };

  if (_.isString(data)) { //if string just pass as title and be done with it
    attachment.title = data;
    attachment.fallback = data;
  } else if (_.isObject(data)) { // if object, then lets make it look good
    //if it has a message, pull that out and display as title
    if (data.message) {
      attachment.title = data.message;
      attachment.fallback = data.message;
      delete data.message;
    }
    if (data.url) {
      attachment.title_link = data.url;
      delete data.url;
    }
    attachment.text = `\`\`\` ${JSON.stringify(data, null, '  ')} \`\`\``;
    attachment.mrkdwn_in = ['text'];
  }
  if (module.exports.config.additionalFields) {
    attachment.fields = attachment.fields.concat(module.exports.config.additionalFields);
  }
  if (module.exports.config.hideTags !== true && tags.length > 0) {
    attachment.fields.push({ title: 'Tags', value: tags.join(', ') });
  }
  // set any colors for special tags:
  if (tags.indexOf('success') > -1) {
    attachment.color = 'good';
  }
  if (tags.indexOf('warning') > -1) {
    attachment.color = 'warning';
  }
  if (tags.indexOf('error') > -1) {
    attachment.color = 'danger';
  }
  // set any special channel:
  const slackPayload = {
    attachments: [attachment]
  };
  if (module.exports.config.channel) {
    slackPayload.channel = module.exports.config.channel;
  }
  if (module.exports.config.iconURL) {
    slackPayload.icon_url = module.exports.config.iconURL;
  }
  if (module.exports.config.username) {
    slackPayload.username = module.exports.config.username;
  }
  return JSON.stringify(slackPayload);
};

// will format and slackPostRawMessage a server.log style message to slack:
module.exports.postFormatted = (tags, message, done) => {
  module.exports.post(makeSlackPayload(tags, message), done);
};
