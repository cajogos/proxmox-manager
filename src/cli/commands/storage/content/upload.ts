import path from 'path';
import fs from 'fs';
import { loadConfig, resolveProfile } from '../../../../config/loader';
import { configureAuditLog, audit } from '../../../../audit/logger';
import { uploadStorageContentService } from '../../../../services/storage';
import { startSpinner } from '../../../../output/spinner';
import { successMsg, errorMsg } from '../../../../output/colors';

interface StorageContentUploadOptions {
  profile?: string;
  node?: string;
  content: string;
}

export async function storageContentUpload(
  storage: string,
  filePath: string,
  opts: StorageContentUploadOptions,
): Promise<void> {
  const config = loadConfig();
  configureAuditLog(config.auditLog.path);
  const { name: profileName } = resolveProfile(config, opts.profile);

  const auditBase = {
    profile: profileName,
    command: 'storage content upload',
    resource: { type: 'storage', id: storage },
    dryRun: false,
    source: 'cli' as const,
  };

  if (!opts.node) {
    console.error(errorMsg('--node <name> is required for upload'));
    process.exit(1);
  }

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    const error = `File not found: ${absPath}`;
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error });
    console.error(errorMsg(error));
    process.exit(1);
  }

  const fileName = path.basename(absPath);
  const spinner = startSpinner(`Uploading ${fileName} to ${storage}…`);

  const result = await uploadStorageContentService(
    config,
    storage,
    absPath,
    opts.content,
    { profile: opts.profile, node: opts.node },
    (pct) => {
      spinner.setText(`Uploading ${fileName}… ${pct}%`);
    },
  );

  spinner.stop();

  if (!result.ok) {
    audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'failed', error: result.error });
    console.error(errorMsg(result.error));
    process.exit(1);
  }

  console.log(successMsg(`Uploaded ${fileName} to ${storage} on ${opts.node}.`));
  audit({ ...auditBase, timestamp: new Date().toISOString(), result: 'success', error: null });
}
