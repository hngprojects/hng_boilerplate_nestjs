import { promises as fs } from 'fs';
import { join } from 'path';

async function copyTemplates() {
  const srcDir = join(__dirname, '../../../src/modules/email/templates');
  const destDir = join(__dirname, '../modules/email/templates');
  try {
    // Create the destination directory if it does not exist
    await fs.mkdir(destDir, { recursive: true });

    const files = await fs.readdir(srcDir);
    for (const file of files) {
      await fs.copyFile(join(srcDir, file), join(destDir, file));
    }
    console.log('Templates copied successfully.');
  } catch (error) {
    console.error('Error copying templates:', error);
  }
}

export default copyTemplates;
