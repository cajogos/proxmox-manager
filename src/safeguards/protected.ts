import { Safeguards } from '../config/types';

export type ResourceType = 'vm' | 'container' | 'node';

export function checkProtected(
  type: ResourceType,
  id: number | string,
  safeguards: Safeguards
): void {
  if (type === 'vm' && typeof id === 'number' && safeguards.protectedVMs.includes(id)) {
    throw new Error(
      `VM ${id} is in the protected list and cannot be modified.\n` +
      `Remove it from safeguards.protectedVMs in config.json to proceed.`
    );
  }

  if (type === 'container' && typeof id === 'number' && safeguards.protectedContainers.includes(id)) {
    throw new Error(
      `Container ${id} is in the protected list and cannot be modified.\n` +
      `Remove it from safeguards.protectedContainers in config.json to proceed.`
    );
  }

  if (type === 'node' && typeof id === 'string' && safeguards.protectedNodes.includes(id)) {
    throw new Error(
      `Node "${id}" is in the protected list and cannot be modified.\n` +
      `Remove it from safeguards.protectedNodes in config.json to proceed.`
    );
  }
}
