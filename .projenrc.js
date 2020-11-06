const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: "1.72.0",
  name: "sso-report",
  cdkDependencies: [
    "@aws-cdk/aws-cloudtrail",
    "@aws-cdk/aws-s3",
    "@aws-cdk/aws-lambda",
    "@aws-cdk/aws-sns",
    "@aws-cdk/aws-lambda-event-sources",
    "@aws-cdk/aws-events-targets",
    "@aws-cdk/aws-sns-subscriptions",
    "@aws-cdk/aws-lambda-event-sources",
    "@aws-cdk/aws-logs",
    "@aws-cdk/aws-logs-destinations"
  ]
});

project.synth();
