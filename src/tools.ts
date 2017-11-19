import * as path from "path";
import tl = require('vsts-task-lib/task');
import {ToolRunner} from "vsts-task-lib/toolrunner";

export class GoEnvironment{
    public readonly root:string;
    constructor(){
        this.root = tl.getPathInput('goroot', false);
        if (!this.root){
            //on windows trying env
            tl.debug("GOROOT variables is not set");
            if (process.platform=='win32'){
                this.root = tl.getVariable('GOROOT');
                if (this.root){
                    this.root = path.join(this.root, 'bin', 'go.exe');
                }
                else{
                    tl.debug("cannot find GOROOT environmental variable");
                }
            }
        }
        if (!this.root){
            tl.debug("trying which func resolution")
            this.root = tl.which('go');
        }
        if (!this.root){
            throw "Cannot resolve path to go executable";
        }
        tl.debug("GOROOT: " +  this.root);
    }

    set path(value:string|undefined)
    {
        process.env['GOPATH'] = value;
    }
    get path():string|undefined{
        return process.env['GOPATH'];
    }
}

export class GoToolFactory{

    constructor(readonly environment:GoEnvironment, readonly tl:ToolRunner){
    }

    private prepare(verb:string):ToolRunner{
        return  tl.tool(this.environment.root).arg(verb)
    }

    public getBuild(additional:string):ToolRunner{
        return  this.prepare('build');
    }

}