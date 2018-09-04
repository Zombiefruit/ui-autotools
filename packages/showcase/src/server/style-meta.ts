import 'typescript-support';
// import Registry, {getCompName} from '@ui-autotools/registry';
import fs from 'fs';
// import {processSource} from '@stylable/generate-test-util';

// function formatComponentStyleMeta() {
//  // esixts in client-data.
//  // use the call in indes.ts
// }

// function getComponentsMetadata() {
//     const metadata = Registry.metadata.components;
//     return metadata;
// }

export function getComponentsStylesheet(
    basePath: string,
) {
    const stylesheet = fs.readFileSync(basePath);
    // tslint:disable-next-line:no-console
    console.log(stylesheet);
    // const normalize = (string: string) => string.toLowerCase().replace(/-/g, '');
    // Get the file path from the file system
    // const sourceFiles = glob.sync(basePath, {
        // stylesheetPath: basePath,
        // absolute: true
    // });

    // for (const comp of components) {
    //     const name = getCompName(comp);
    //     const metaFile = sourceFiles.find((file) =>
    //         normalize(path.basename(file)) === normalize(name + '.st.css')
    //     );
    //     matchedStylesheet = comp;
    // }
    // return matchedStylesheet;
}

// export function getComponentStyleMetadata(
//     component: React.ComponentType,
// ) {
//     const metadata = getComponentsMetadata();
//     // .root {
//     //     -st-states: state1, state2;
//     // }
//     // const stylesheet = findComponentsStylesheet([component], '../..');
//     // const { classes, diagnostics } = processSource(stylesheet

// // , { from: 'path/to/style.css' });

// //     metadataFiles.forEach(require);
// //     const metadata = Registry.metadata;
// //     const schemasByComponent = findComponentSchemas(
// //       metadata.components,
// //       basePath,
// //       sourceGlob
// //     );
// //     return {metadata, schemasByComponent};
//   }
