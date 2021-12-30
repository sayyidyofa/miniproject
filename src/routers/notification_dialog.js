import request from 'request';
import express from 'express';
import dotenv from 'dotenv';
import { createRequire } from "module";
import { v4 as uuid } from 'uuid';
import { WebClient } from '@slack/web-api';


dotenv.config()
const notificationRouter =  express.Router();
const require = createRequire(import.meta.url);
const roles = require('../services/roles.json');
const TIMEOUT_SECOND = 60 * 1000;
const timeouts = {};
var payload_block ={}

//Endpoint slack webhooks for rpa_team channels
const url = process.env.WEBHOOK_URL;

const client = new WebClient(process.env.BOT_TOKEN);

notificationRouter.post('/escalation_dialog', escalation_dialog)

notificationRouter.post('/response', response)

async function escalation_dialog(req,res){
    try {
        const error_message = req.body.message; // message will be send to chat
        const service = req.body.service;
        const roleId = req.body.roleId;
        const messageId = uuid();

        const members = lookup_role(roleId);
        const value = JSON.stringify({ roleId, messageId });

        payload_block = {
            "channel" : process.env.channel_id,
            "type": "interactive_message",
            "text" : "RPA Reporting",
            "attachments": [
                {
                    "text": `[ERROR] Developer ${members}.\nError message: ${error_message}\nError location: ${service}\n\nWould you like to fix it?`,
                    "attachment_type": "default",
                    "callback_id": "selection_action",
                    "fallback":` ${error_message} location : ${service}`,
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

        const result_chat = await client.chat.postMessage(payload_block)

        const currentTimeout = setTimeout(() => {
            const supervisor = lookup_role(parseInt(roleId) + 1);
            client.chat.delete({
                channel : process.env.channel_id,
                ts: result_chat.ts
            })
            request.post({
                headers : { 'Content-type' : 'application/json' },
                url,
                form : {
                    payload: JSON.stringify({
                        channel: 'C02S28LEWRJ',
                        response_type: "ephemeral",
                        text: `There is no response from ${members.join(' or ')}, this alert will be assigned to ${supervisor}`
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
        console.log(e)
        res.sendStatus(500);
    }
}

function response(req,res) {
    const responses = JSON.parse(req.body.payload);
    const act = responses.actions[0].name;
    const { roleId, messageId } = JSON.parse(responses.actions[0].value);
    const fallback = responses.original_message.attachments[0].fallback;
    const members = lookup_role(parseInt(roleId)+1);
    const is_same_user = user_checking(roleId, responses.user.id)

    // const act = responses.actions[0].action_id; // commented because it works in Vio's Bot)

    if (is_same_user){
        if (messageId && timeouts[messageId]) {
            clearTimeout(timeouts[messageId]);
            delete timeouts[messageId];
        }
        if (act == 'approve'){
            res.send(`<@${responses.user.id}> has been take to fix the issues! [ERROR] ${fallback}`);
          }else{
            res.send(`<@${responses.user.id}> can't fix the problem! This alert will assign to ${members}! [ERROR] ${fallback}`)
          }
    }
    else {
        res.send({text:`<@${responses.user.id}> You dont have permissions to take this error`, replace_original:false});
    }

}

function lookup_role(role_id = 1) {
  const role = roles[role_id];
  const slack_id = [];
  for (let { id_slack } of role) {
      slack_id.push(`<@${id_slack}>`)
  }
  return slack_id;
}

function user_checking(role_id, user_action){
  const role = roles[role_id];
  for (let { id_slack } of role){
    if (user_action == id_slack) return true;
  }
  return false;
}

export  {notificationRouter, escalation_dialog} 
