export type DeploymentStage = 'preview' | 'production' | 'staging';

export interface DeploymentTarget {
  deploymentId: string;
  isEphemeral: boolean;
  isProduction: boolean;
  stackName: string;
  stageName: DeploymentStage;
}

const persistentStages = ['staging', 'production'] as const;
const reservedPreviewIds = new Set(['preview', 'production', 'staging']);
const previewIdPattern = /^(?=.{3,20}$)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*$/;

const resolvePreviewId = (previewId: unknown): string => {
  if (typeof previewId !== 'string') {
    throw new Error('A previewId is required for preview deployments.');
  }

  if (!previewIdPattern.test(previewId) || reservedPreviewIds.has(previewId)) {
    throw new Error(
      'previewId must be a non-reserved 3-20 character slug containing only lowercase letters, numbers, and single hyphens.'
    );
  }

  return previewId;
};

export const resolveDeploymentTarget = (
  stage: unknown,
  previewId?: unknown
): DeploymentTarget => {
  if (stage === 'preview') {
    const normalizedPreviewId = resolvePreviewId(previewId);

    return {
      deploymentId: `preview-${normalizedPreviewId}`,
      isEphemeral: true,
      isProduction: false,
      stackName: `CagPlatform-preview-${normalizedPreviewId}`,
      stageName: 'preview'
    };
  }

  if (stage === 'staging' || stage === 'production') {
    return {
      deploymentId: stage,
      isEphemeral: false,
      isProduction: stage === 'production',
      stackName: `CagPlatform-${stage}`,
      stageName: stage
    };
  }

  throw new Error(
    'stage must be exactly one of preview, staging, or production.'
  );
};

export const resolveRequestedDeploymentTargets = (
  stage: unknown,
  previewId?: unknown
): DeploymentTarget[] => {
  if (stage === undefined) {
    return persistentStages.map((persistentStage) =>
      resolveDeploymentTarget(persistentStage)
    );
  }

  return [resolveDeploymentTarget(stage, previewId)];
};
