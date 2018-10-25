import ts from 'typescript';
import React from 'react';
import { IFileSystem } from '@file-services/types';
import { IBaseHost } from '@file-services/typescript';
import { transform } from '@ui-autotools/schema-extract/esm/file-transformer';
import {BaseView as BaseSchemaView, defaultSchemaViewRegistry} from '@ui-autotools/schema-views/src';
import 'sanitize.css';
import './playground.css';
import { ModuleSchema, Schema } from '@ui-autotools/schema-extract/esm/json-schema-types';
import { SimulationPanel } from './simulation-panel';

// const availableDefinitions: string[] = [];

export interface IPlaygroundProps {
    fs: IFileSystem;
    baseHost: IBaseHost;
    languageService: ts.LanguageService;
    filePath: string;
}

export interface IPlaygroundState {
    transpiledOutput: string;
    schema: ModuleSchema | undefined;
    selectedExport: string;
}

export class Playground extends React.PureComponent<IPlaygroundProps, IPlaygroundState> {
    public state: IPlaygroundState = {
        transpiledOutput: '',
        schema: undefined,
        selectedExport: ''
    };

    public componentDidMount() {
        this.transpileFile();
    }

    public render() {
        const { filePath, fs: { readFileSync } } = this.props;
        let schemaForPanel: Schema | undefined;
        const definitionsMap: Map<string, Schema> = new Map();
        let selectedExport = '';
        let availableDefs: string[] = [];
        if (this.state.schema && this.state.schema.definitions) {
            availableDefs = Object.keys(this.state.schema.definitions!);
            selectedExport = this.state.selectedExport || availableDefs[0];
            schemaForPanel = this.state.schema.definitions[this.state.selectedExport] || this.state.schema.definitions[availableDefs[0]];
            availableDefs.forEach((key) => definitionsMap.set(key, this.state.schema!.definitions![key]));
        }
        return (
        <div className="playground">
                <textarea
                    className="playground-pane source-code-pane"
                    spellCheck={false}
                    value={readFileSync(filePath)}
                    onChange={this.onInputChange}
                />
                <textarea
                    className="playground-pane schema-pane"
                    spellCheck={false}
                    value={JSON.stringify(this.state.schema, null, 2)}
                    readOnly={true}
                />
                <div className="playground-pane view-pane">
                    <select onChange={this.selectExport} value={selectedExport}>
                        {
                            availableDefs.map((key) => {
                                return <option key={key} value={key}>{key}</option>;
                            })
                        }
                    </select>
                     {
                        schemaForPanel ?
                        <SimulationPanel schemaRegistry={definitionsMap} rootSchema={selectedExport}/>
                        : null
                     }
                     {
                        schemaForPanel ?
                        <BaseSchemaView schema={schemaForPanel} schemaRegistry={definitionsMap} viewRegistry={defaultSchemaViewRegistry}/>
                        : null
                     }

                </div>;
        </div >);

    }

    private selectExport = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({selectedExport: ev.target.value});
    }
    private transpileFile() {
        const transpiledOutput = this.getTranspiledCode();
        const program = this.props.languageService.getProgram();
        const typeChecker = program && program.getTypeChecker();
        const sourceFile = program && program.getSourceFile(this.props.filePath);
        if (typeChecker && sourceFile) {
            const moduleSchema = transform(typeChecker, sourceFile, this.props.filePath, '/');
            this.setState({ transpiledOutput, schema: moduleSchema });
        } else {
            this.setState({ transpiledOutput });
        }
    }

    private onInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        this.props.fs.writeFileSync(this.props.filePath, e.target.value);
        this.forceUpdate();
        requestAnimationFrame(() => this.transpileFile());
    }

    private getTranspiledCode(): string {
        const { languageService, filePath } = this.props;
        const { outputFiles } = languageService.getEmitOutput(filePath);
        const [jsFile] = outputFiles.filter((outputFile) => outputFile.name);

        if (!jsFile) {
            throw new Error('Cannot find transpiled .js file');
        }
        return jsFile.text;
    }

    // private getFormattedDiagnostics(): string {
    //     const { baseHost, languageService, filePath } = this.props;
    //     const diagnostics = [
    //         ...languageService.getSyntacticDiagnostics(filePath),
    //         ...languageService.getSemanticDiagnostics(filePath)
    //     ];
    //     return ts.formatDiagnostics(diagnostics, baseHost);
    // }
}
