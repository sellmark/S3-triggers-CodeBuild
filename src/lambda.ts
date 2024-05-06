import { S3Event, Context, Callback } from 'aws-lambda';
import { CodeBuild } from 'aws-sdk';

const codebuild = new CodeBuild();

export const handler = async (event: S3Event, context: Context, callback: Callback) => {
  console.log("Event: ", JSON.stringify(event));

  const record = event.Records[0];
  const bucketName = record.s3.bucket.name;
  const objectKey = record.s3.object.key;

  const parts = objectKey.split('/');
  if (parts.length < 4) {
    console.error("Invalid object key structure.");
    return callback(new Error("Invalid object key structure."));
  }
  const companyID = parts[1];
  const gameID = parts[2];

  const environmentVariables = [
    { name: 'COMPANY_ID', value: companyID, type: 'PLAINTEXT' },
    { name: 'GAME_ID', value: gameID, type: 'PLAINTEXT' }
  ];

  try {
    const response = await codebuild.startBuild({
      projectName: 'mole-build',
      environmentVariablesOverride: environmentVariables
    }).promise();

    console.log("CodeBuild started successfully:", JSON.stringify(response));
    callback(null, response);
  } catch (error) {
    console.error("Failed to start CodeBuild:", error);
    // Ensure error is an instance of Error
    if (error instanceof Error) {
      callback(error);
    } else {
      // Convert unknown error into Error object if it's not already an error
      callback(new Error(`An unknown error occurred: ${error}`));
    }
  }
};