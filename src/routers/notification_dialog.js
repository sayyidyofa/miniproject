import request from 'request';
import express from 'express';
import { createRequire } from "module";
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
const require = createRequire(import.meta.url);

const roles = require('../services/roles.json');

const router =  express.Router();
dotenv.config()
//Endpoint slack webhooks for rpa_team channels
const url = process.env.WEBHOOK_URL_RPA_TEAM;
const TIMEOUT_SECOND = 60 * 1000;
const timeouts = {};

router.post('/escalation_dialog', function(req,res){
    try {
        const error_message = req.body.message; // message will be send to chat
        const service = req.body.service;
        const roleId = req.body.roleId;
        const messageId = uuid();

        const members = lookup_role(roleId);
        const value = JSON.stringify({ roleId, messageId });

        const payload_block = {
            "channel" : "C02S28LEWRJ",
            "type": "interactive_message",
            "text" : "RPA Reporting",
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
        ]};    

        request.post({
            headers : { 'Content-type' : 'application/json' },
            url,
            form : {payload: JSON.stringify(payload_block)}
        }, (error, res, body) => {
            if (error) res.sendStatus(500);
        });

        const currentTimeout = setTimeout(() => {
            const supervisor = lookup_role(roleId + 1);
            request.post({
                headers : { 'Content-type' : 'application/json' },
                url,
                form : {
                    payload: JSON.stringify({
                        channel: 'C02S28LEWRJ',
                        text: `There is no response from ${members.join(' or ')}, this alert will be assigned to <${supervisor}>`
                    })
                }
            }, (error, res, body) => {
                if (error) res.sendStatus(500);
                delete timeouts[messageId];
            })
        }, TIMEOUT_SECOND);
        timeouts[messageId] = currentTimeout;

        return res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
    }
})

router.post('/response', function(req,res){
    const responses = JSON.parse(req.body.payload);
    const act = responses.actions[0].name;
    // const act = responses.actions[0].action_id; // commented because it works in Vio's Bot
    const { roleId, messageId } = JSON.parse(responses.actions[0].value);

    if (messageId && timeouts[messageId]) {
        clearTimeout(timeouts[messageId]);
    }

    const members = lookup_role(parseInt(roleId) + 1);

    if (act == 'approve'){
      res.send(`<@${responses.user.id}> has been take to fix the issues!`);
    
    } else {
      res.send(`<@${responses.user.id}> can't fix the problem! This alert will be assigned to ${members}`)
    }
})

function lookup_role(role_id = 1) {
  const role = roles[role_id];
  const slack_id = [];
  for (let { id_slack } of role) {
      slack_id.push(`<@${id_slack}>`)
  }
  return slack_id;
}

export default router;
