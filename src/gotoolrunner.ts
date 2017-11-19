import * as tl from 'vsts-task-lib/task'
import * as tr from 'vsts-task-lib/toolrunner'
import * as process from "process";
import {GoEnvironment} from "./tools";
import {GoVariables} from "./constants";

export class GoToolRunner extends tr.ToolRunner{
    private dbg:boolean;
    private env: GoEnvironment;

    constructor(private workingDirectory: string){
        super('go');
        this.on('debug', (message:string) => {
            tl.debug(message);
        });

        let debugVar = tl.getVariable('System.Debug') || '';
        if (debugVar.toLowerCase() === 'true'){
            this.dbg = true;
        }

        this.env = new GoEnvironment();

        if (!tl.stats(workingDirectory).isDirectory()){
            throw new Error("Working directory not set");
        }
    }

    public exec(options?: tr.IExecOptions): Q.Promise<number>{
        options = this._prepareGoEnvironment(options) as tr.IExecOptions;
        return super.exec(options).then(
            (code:number) => {
              return code;
            },
            (reason:any) => {
                //TODO: error handling
                return 1;
            }
        );
    }

    public execSync(options?: tr.IExecSyncOptions): tr.IExecSyncResult {
        options = this._prepareGoEnvironment(options);

        const execResult = super.execSync(options);
        if (execResult.code !== 0){
            //TODO: print debug info
            throw new Error(execResult.code.toString());
        }

        return execResult;
    }

    public _prepareGoEnvironment(options?: tr.IExecSyncOptions): tr.IExecSyncOptions{
        options = options || <tr.IExecSyncOptions>{};
        options.cwd = this.workingDirectory;

        if (options.env === undefined && process.env != undefined){
            options.env = process.env as {[key: string]: string};
        }

        process.env[GoVariables.Path] = options.cwd;

        //TODO: proxy settings

        return options;
    }
}