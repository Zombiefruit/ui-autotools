import { createSession } from 'chrome-debugging-client';
// import protocol domains "1-2", "tot", or "v8"
import { HeapProfiler } from 'chrome-debugging-client/dist/protocol/tot';

createSession(async (session) => {
  // spawns a chrome instance with a tmp user data
  // and the debugger open to an ephemeral port
  const process = await session.spawnBrowser({
    additionalArguments: ['--headless', '--disable-gpu', '--hide-scrollbars', '--mute-audio'],
    windowSize: { width: 640, height: 320 }
  });

  // open the REST API for tabs
  const client = session.createAPIClient('localhost', process.remoteDebuggingPort);

  const tabs = await client.listTabs();
  const tab = tabs[0];
  await client.activateTab(tab.id);

  // open the debugger protocol
  // https://chromedevtools.github.io/devtools-protocol/
  const debuggerClient = await session.openDebuggingProtocol(tab.webSocketDebuggerUrl as string);

  // create the HeapProfiler domain with the debugger protocol client
  const heapProfiler = new HeapProfiler(debuggerClient);
  await heapProfiler.enable();

  // The domains are optional, this can also be
  // await debuggerClient.send("HeapProfiler.enable", {})

  let buffer = '';
  heapProfiler.addHeapSnapshotChunk = (evt) => {
    buffer += evt.chunk;
  };
  await heapProfiler.takeHeapSnapshot({ reportProgress: false });
  // const thing = await heapProfiler.getSamplingProfile();
  await heapProfiler.disable();
  // console.log('thing', thing);

  return JSON.parse(buffer);
}).then((data) => {
  console.log(data.snapshot);
}).catch((err) => {
  console.error(err);
});
