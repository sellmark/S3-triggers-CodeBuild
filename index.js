const AWS = require('aws-sdk');
const codebuild = new AWS.CodeBuild();

exports.handler = async (event) => {
    const s3Info = event.Records[0].s3;
    const objectKey = s3Info.object.key;
    
    const parts = objectKey.split('/');
    const companyID = parts[1];
    const gameID = parts[2];

    const environmentVariables = [
        {
            name: 'COMPANY_ID',
            value: companyID,
            type: 'PLAINTEXT'
        },
        {
            name: 'GAME_ID',
            value: gameID,
            type: 'PLAINTEXT'
        }
    ];

    const response = await codebuild.startBuild({
        projectName: 'mole-build',
        environmentVariablesOverride: environmentVariables
    }).promise();

    console.log("CodeBuild start response: ", JSON.stringify(response));

    return response;
};
