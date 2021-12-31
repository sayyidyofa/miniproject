import request from 'request';
import express from 'express';
import dotenv from 'dotenv';
import { createRequire } from "module";
import { v4 as uuid } from 'uuid';
import pkg from '@slack/web-api';
const { WebClient } = pkg;

dotenv.config()
const notificationRouter = express.Router();
const require = createRequire(import.meta.url);
const roles = require('../services/roles.json');
const TIMEOUT_SECOND = 60 * 1000;
const timeouts = {};
var payload_block = {}

//Endpoint slack webhooks for rpa_team channels
const url = process.env.WEBHOOK_URL;
const CHANNEL_ID = process.env.channel_id
//BOT Token for RPA BOT
const client = new WebClient(process.env.BOT_TOKEN);

// notificationRouter.post('/escalation_dialog', escalation_dialog)

notificationRouter.post('/response', response)

async function escalation_dialog(error_message, service, roleId) {
    try {
        const messageId = uuid();

        const members = lookup_role(roleId);
        const value = JSON.stringify({ roleId, messageId });

        payload_block = {
            "channel": CHANNEL_ID,
            "type": "interactive_message",
            "text": "RPA Reporting",
            "attachments": [
                {
                    "text": `[ERROR] Hi ${members.join(', ')} our system can't automatically handle this error.\nError message: ${error_message}\nError location: ${service}\n\nWould you like to fix it?`,
                    "attachment_type": "default",
                    "callback_id": "selection_action",
                    "fallback": ` ${error_message} location : ${service}`,
                    "color": "#FF0000",
                    "actions": [
                        {
                            "name": "approve",
                            "text": "Yes",
                            "type": "button",
                            "value": value,
                            "style": "primary",
                            "action_id": "approve"
                        },
                        {
                            "name": "reject",
                            "text": "No",
                            "type": "button",
                            "value": value,
                            "style": "danger",
                            "action_id": "reject"
                        }
                    ]
                }
            ]
        };

        const result_chat = await client.chat.postMessage(payload_block)

        const currentTimeout = setTimeout(() => {
            const supervisor = lookup_role(parseInt(roleId) + 1);
            client.chat.delete({
                channel: CHANNEL_ID,
                ts: result_chat.ts
            })
            request.post({
                headers: { 'Content-type': 'application/json' },
                url,
                form: {
                    payload: JSON.stringify({
                        channel: CHANNEL_ID,
                        response_type: "ephemeral",
                        text: `There is no response from ${members.join(' or ')}, this alert will be assigned to ${supervisor}. \n[ERROR] ${error_message}, Location ${service}`
                    })
                }
            }, (error, res, body) => {

                if (error) res.sendStatus(500);
                delete timeouts[messageId];
            })
        }, TIMEOUT_SECOND);
        timeouts[messageId] = currentTimeout;

        // return res.sendStatus(200);
    } catch (e) {
        console.log(e)
        // res.sendStatus(500);
    }
}

function response(req, res) {
    //function to received response from slack 

    const responses = JSON.parse(req.body.payload);
    const act = responses.actions[0].name;
    const { roleId, messageId } = JSON.parse(responses.actions[0].value);
    const fallback = responses.original_message.attachments[0].fallback;
    const members = lookup_role(parseInt(roleId) + 1);
    const is_same_user = user_checking(roleId, responses.user.id)

    if (is_same_user) {
        if (messageId && timeouts[messageId]) {
            clearTimeout(timeouts[messageId]);
            delete timeouts[messageId];
        }
        if (act == 'approve') {
            res.send(`Troubleshooting Status: [ERROR] ${fallback} will be ` + 
            `taken care of by <@${responses.user.id}>`);
        } else {
            res.send(`Troubleshooting Status: [ERROR] ${fallback} can't be ` +
            `handled by <@${responses.user.id}>! This problem will be escalated ` +
            `to ${members}!`);
        }
    }
    else {
        res.send({ text: `Sorry <@${responses.user.id}> but you dont have permissions to take this error`, replace_original: false });
    }

}

function lookup_role(role_id = 1) {
    //function to search user that define in post request by role_id (read from file roles.json)

    const role = roles[role_id];
    const slack_id = [];
    for (let { id_slack } of role) {
        slack_id.push(`<@${id_slack}>`)
    }
    return slack_id;
}

function user_checking(role_id, user_action) {
    //function user checking (compare between user should be take action and (real) take action)

    const role = roles[role_id];
    for (let { id_slack } of role) {
        if (user_action == id_slack) return true;
    }
    return false;
}

export { notificationRouter, escalation_dialog } 
