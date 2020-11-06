import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
import { Trail, ReadWriteType } from '@aws-cdk/aws-cloudtrail';
import { Function, Code, Runtime } from '@aws-cdk/aws-lambda';
import { Topic } from '@aws-cdk/aws-sns';
import { LogGroup, FilterPattern, RetentionDays } from '@aws-cdk/aws-logs';
import { LambdaDestination } from '@aws-cdk/aws-logs-destinations';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const topic = new Topic(this, 'Topic');

    const log_processor_fn = new Function(this, 'LogProcessor', {
      code: Code.fromAsset('src/log_processor'),
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      environment: {
        "TOPIC_ARN": topic.topicArn,
      },
      logRetention: RetentionDays.ONE_DAY
    });
    topic.grantPublish(log_processor_fn);
    
    const logGroup = new LogGroup(this, 'LogGroup');

    new Trail(this, 'CloudTrail', {
      managementEvents: ReadWriteType.WRITE_ONLY,
      sendToCloudWatchLogs: true,
      cloudWatchLogGroup: logGroup,
      cloudWatchLogsRetention: RetentionDays.ONE_DAY
    });

    logGroup.addSubscriptionFilter('Subscription', {
      destination: new LambdaDestination(log_processor_fn),
      filterPattern: FilterPattern.literal('{ $.eventSource = "signin.amazonaws.com" && $.eventName = "ConsoleLogin"}')
    });

  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'sso-logins-report-dev', { env: devEnv });

app.synth();