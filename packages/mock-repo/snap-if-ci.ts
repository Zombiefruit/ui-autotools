import isCI from 'is-ci';
import {exec} from 'child_process';

// CHANGE BACK BEFORE MERGING
if (!isCI) {
  exec('yarn autotools-snap', (err, stdout, stderr) => {
    if (err) {
      process.exitCode = (err as any).status;
    }

    process.stdout.write(stdout);
    process.stderr.write(stderr);
  });
}
