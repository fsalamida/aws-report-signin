import '@aws-cdk/assert/jest';
import { MyStack } from '../src/main'
import { App } from '@aws-cdk/core';

test('Snapshot', () => {
  const app = new App();
  const stack = new MyStack(app, 'test');

  expect(stack).not.toHaveResource('AWS::S3::Bucket');
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});