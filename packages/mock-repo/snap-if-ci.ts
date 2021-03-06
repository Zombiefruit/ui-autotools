import isCI from 'is-ci';
import {exec} from 'child_process';

if (isCI) {
  exec('yarn autotools-snap', (err, stdout, stderr) => {
    console.log('SNAPPING ON CI')
    if (err) {
      process.exitCode = (err as any).status;
    }

    process.stdout.write(stdout);
    process.stderr.write(stderr);
  });
}
