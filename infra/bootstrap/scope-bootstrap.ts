import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const scopeProductionBootstrap = (template: string) => {
  const marker =
    '  DeploymentActionRole:\n    Type: AWS::IAM::Role\n    Properties:\n';
  if (template.split(marker).length !== 2) {
    throw new Error(
      'Pinned CDK bootstrap template changed: deployment role not unique'
    );
  }
  return template.replace(
    marker,
    `${marker}      PermissionsBoundary:\n        Fn::Sub: arn:\${AWS::Partition}:iam::\${AWS::AccountId}:policy/CagProductionDeploymentBoundary\n`
  );
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const require = createRequire(import.meta.url);
  const templatePath = join(
    dirname(require.resolve('aws-cdk/package.json')),
    'lib/api/bootstrap/bootstrap-template.yaml'
  );
  await writeFile(
    process.argv[2],
    scopeProductionBootstrap(await readFile(templatePath, 'utf8'))
  );
}
