const aws = require("aws-sdk");
const zlib = require("zlib");
const util = require("util");
const gunzip = util.promisify(zlib.gunzip);
const s3 = new aws.S3();
var sns = new aws.SNS({
  apiVersion: '2010-03-31',
  region: 'us-east-1'
});
//const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async function (event) {
  console.log(event);
  const data = await gunzip(Buffer.from(event.awslogs.data, 'base64'));

  for (const e of JSON.parse(data.toString()).logEvents) {
    const message = JSON.parse(e.message);
    console.log(JSON.stringify(message));
    let username = '';
    if (message.userIdentity.type == "AssumedRole") {
      username = message.userIdentity.principalId.split(':')[1];
    } else if (message.userIdentity.type == "IAMUser") {
      username = message.userIdentity.userName;
    }
    if (message.additionalEventData.MFAUsed == 'No') {
      const msg = `User ${username} logged at ${message.eventTime} without MFA`
      await sns.publish({
        Message: JSON.stringify(msg),
        TopicArn: process.env.TOPIC_ARN
      }).promise();  
    }
  }

  return;
};