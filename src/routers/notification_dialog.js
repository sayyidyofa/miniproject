import request from 'request';
import express from 'express';
import { createRequire } from "module";
import { v4 as uuid } from 'uuid';
const require = createRequire(import.meta.url);

const roles = require('../services/roles.json');

const router =  express.Router();
//Endpoint slack webhooks for rpa_team channels
const url = 'https://hooks.slack.com/services/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';
const timeouts = {};

router.post('/escalation_dialog', function(req,res){
    try {
        const error_message = req.body.message; // message will be send to chat
        const service = req.body.service;
        const roleId = req.body.roleId;
        const messageId = uuid();

        const members = lookup_role(roleId);

        const payload_block = {
            "channel" : "C02S28LEWRJ",
            "type": "interactive_message",
            "text" : "Do not click, testing 60s timeout!",
            "attachments": [
                {
                    "text": `[ERROR] Hi, developer ${members}. ${error_message} ${service}, would you like to fix it?`,
                    "attachment_type": "default",
                    "callback_id": "selection_action",
                    "color": "#FF0000",
                    "actions": [
                        {
                            "name": "approve",
                            "text": "Yes",
                            "type": "button",
                            "value": `{ roleId: ${roleId}, messageId: ${messageId} }`,
                            // "value": `${roleId}`,
                            "style": "primary",
                            "action_id": "approve"
                        },
                        {
                            "name": "reject",
                            "text": "No",
                            "type": "button",
                            "value": `{ roleId: ${roleId}, messageId: ${messageId} }`,
                            // "value": `${roleId}`,
                            "style": "danger",
                            "action_id": "reject"
                        }
                    ]
                }
        ]};    

        request.post({
            headers : { 'Content-type' : 'application/json' },
            url,
            form : {payload: JSON.stringify(payload_block)}
        }, (error, res, body) => {
            console.log(error, body, res.statusCode)
        });

        const currentTimeout = setTimeout(() => {
            request.post({
                headers : { 'Content-type' : 'application/json' },
                url,
                form : {payload: JSON.stringify({
                    channel: 'C02S28LEWRJ',
                    text: `There is no response from ${members.join(' or ')}, this alert will be assigned to <@U02SPNE5SHE>`
                })}
            }, (error, res, body) => {
                console.log(error, body, res.statusCode)
                // delete timeouts[messageId];
            })
        }, 7000);
        timeouts[messageId] = currentTimeout;

        return res.sendStatus(200);
    } catch (e) {
        console.error(e);
    }
})

router.post('/response', function(req,res){
    const responses = JSON.parse(req.body.payload);
    const act = responses.actions[0].action_id;
    // const roleId = responses.actions[0].value;
    const { roleId, messageId } = JSON.parse(responses.actions[0].value);
    console.log(responses);
    if (messageId && timeouts[messageId]) {
        clearTimeout(timeouts[messageId]);
    }

    const members = lookup_role(parseInt(roleId)+1);

    if (act == 'approve'){
      res.send(`<@${responses.user.id}> has been take to fix the issues!`);
    
    }else{
      res.send(`<@${responses.user.id}> can't fix the problem! This alert will assign to ${members}`)
    }
})

function lookup_role(role_id=1) {
  const role = roles[role_id];
  const slack_id = [];
  for (let { id_slack } of role) {
      slack_id.push(`<@${id_slack}>`)
  }
  return slack_id;
  
}

export default router