'use strict';
const _ = require('lodash');
const Wreck = require('wreck');

class Post2Slack {
  constructor (config) {
    this.config = config;
  }

  post (payload, done) {
    payload = _.isObject(payload) ? JSON.stringify(payload) : payload;
    Wreck.request('POST', this.config.slackHook, {
      headers: { 'Content-type': 'application/json' },
      payload
    }, (err, response, responsePayload) => {
      if (err) {
        return done(err);
      }
      if (response.statusCode !== 200) {
        return done(new Error(`post to ${this.config.slackHook} failed: ${response.statusCode} ${response.statusMessage}`));
      }
      return done(null, responsePayload);
    });
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
      attachment.text = `\`\`\` ${JSON.stringify(data, null, '  ')} \`\`\``;
      attachment.mrkdwn_in = ['text'];
    }
    if (this.config.additionalFields) {
      attachment.fields = attachment.fields.concat(this.config.additionalFields);
    }
    if (this.config.hideTags !== true && tags.length > 0) {
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
    if (this.config.channel) {
      slackPayload.channel = this.config.channel;
    }
    if (this.config.iconURL) {
      slackPayload.icon_url = this.config.iconURL;
    }
    if (this.config.icon_emoji) {
      slackPayload.icon_emoji = this.config.icon_emoji;
    }
    if (this.config.username) {
      slackPayload.username = this.config.username;
    }
    return JSON.stringify(slackPayload);
  }
  // will format and slackPostRawMessage a server.log style message to slack:
  postFormatted(tags, message, done) {
    this.post(this.makeSlackPayload(tags, message), done);
  }
}

module.exports = Post2Slack;
