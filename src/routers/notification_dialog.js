import request from 'request';
import express from 'express';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const roles = require('../services/roles.json');


const router =  express.Router();
//Endpoint slack webhooks for rpa_team channels
const url = 'https://hooks.slack.com/services/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';

router.post('/escalation_dialog', function(req,res){
    const error_message = req.body.message; // message will be send to chat
    const service = req.body.service;
    const roleId = req.body.roleId;

    const members = lookup_role(roleId);

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
                        "value": `${roleId}`,
                        "style": "primary",
                        "action_id": "approve"
                    },
                    {
                        "name": "reject",
                        "text": "No",
                        "type": "button",
                        "value": `${roleId}`,
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
    }, (error, res, body) => console.log(error, body, res.statusCode));


})

router.post('/response', function(req,res){
    const responses = JSON.parse(req.body.payload);
    const act = responses.actions[0].action_id;
    const roleId = responses.actions[0].value;

    const members = lookup_role(parseInt(roleId)+1);

    if (act == 'approve'){
      res.send(`<@${responses.user.id}> has been take to fix the issues!`);
    
    }else{
      res.send(`<@${responses.user.id}> can't fix the problem! This alert will assign to ${members}`)
    }
})

function lookup_role(role_id=1){
  const role = roles[role_id];
  const slack_id = [];
  for (var value = 0; value < role.length; value++){
      slack_id.push('<@'+role[value].id_slack+'>')
  }
  return slack_id;
  
}

export default router