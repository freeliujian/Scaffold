import { chdir } from 'process';
import { spawn } from 'child_process';

type ExecResult = {
  stdout: string;
  stderr: string;
};

type TemplateStringArray = TemplateStringsArray;

export const cd = (dir: string) => {
  chdir(dir);
}

export const $ = async (pieces: TemplateStringArray, ...args: any[]): Promise<ExecResult> => {
  const command = pieces.reduce((acc, piece, i) => acc + piece + (args[i] || ''), '');

  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
    });

    child.stderr.on('data', (data) => {
      stderr += data;
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`💥 Command failed with exit code ${code}. Stderr: ${stderr}`));
      }
    });
  });
}