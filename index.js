'use strict';
const _ = require('lodash');
const Wreck = require('wreck');

class Post2Slack {
  constructor (config) {
    this.config = config;
  }

  async post (payloadToSend) {
    payloadToSend = _.isObject(payloadToSend) ? JSON.stringify(payloadToSend) : payloadToSend;
    const { payload } = await Wreck.request('POST', this.config.slackHook, {
      headers: { 'Content-type': 'application/json' },
      payload: payloadToSend
    });
    return payload;
  }

  // used by slackPostMessage to construct a nice payload:
  makeSlackPayload (tags, data) {
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
      if (this.config.json2Fields) {
        Object.keys(data).forEach((key) => {
          attachment.fields.push({
            title: key,
            value: data[key]
          });
        });
      } else {
        attachment.text = `\`\`\` ${JSON.stringify(data, null, '  ')} \`\`\``;
        attachment.mrkdwn_in = ['text'];
      }
    }
    if (this.config.additionalFields) {
      attachment.fields = attachment.fields.concat(this.config.additionalFields);
    }
    if (this.config.hideTags !== true && tags.length > 0) {
      attachment.fields.push({ title: 'Tags', value: tags.join(', ') });
    }
    // set any colors for special tags:
    // can overload the tag colors:
    if (this.config.tagColors) {
      Object.keys(this.config.tagColors).forEach((tagName) => {
        if (tags.indexOf(tagName) !== -1) {
          attachment.color = this.config.tagColors[tagName];
        }
      });
    // or just use the default tag colors:
    } else {
      if (tags.indexOf('success') > -1) {
        attachment.color = 'good';
      }
      if (tags.indexOf('warning') > -1) {
        attachment.color = 'warning';
      }
      if (tags.indexOf('error') > -1) {
        attachment.color = 'danger';
      }
    }
    // set any special channel:
    const slackPayload = {
      attachments: [attachment]
    };
    if (this.config.channel) {
      slackPayload.channel = this.config.channel;
    }
    if (this.config.iconURL) {
      slackPayload.icon_url = this.config.iconURL;
    }
    if (this.config.iconEmoji) {
      slackPayload.icon_emoji = this.config.iconEmoji;
    }
    if (this.config.username) {
      slackPayload.username = this.config.username;
    }
    return JSON.stringify(slackPayload);
  }

  // will format and slackPostRawMessage a server.log style message to slack:
  postFormatted(tags, message) {
    return this.post(this.makeSlackPayload(tags, message));
  }
}

module.exports = Post2Slack;
