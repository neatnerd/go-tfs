import * as process from 'process';
import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');
import path = require('path');

async function run() {
    try{
        let src_path:string = tl.getPathInput('path', true, true);
        //trying to resolve go executable path
        let go_root = tl.getPathInput('goroot', true);
        if (!go_root){
            //on windows trying env
            tl.debug("GOROOT variables is not set");
            if (process.platform=='win32'){
                go_root = tl.getVariable('GOROOT');
                if (go_root){
                    go_root = path.join(go_root, 'bin', 'go.exe');
                }
                else{
                    tl.debug("cannot find GOROOT environmental variable");
                }                
            }
        }
        if (!go_root){
            tl.debug("trying which func resolution")
            go_root = tl.which('go');
        }
        if (!go_root){
            throw "Cannot resolve path to go executable";
        }
        tl.debug("GOROOT: " +  go_root);
        
        //configuring the tool
        let tool:trm.ToolRunner;
        tool = 
        tl
        .tool(go_root)
        .arg('build');
        //executing the go tool
        tool.exec()
        .then(function (code) {
            tl.setResult(tl.TaskResult.Succeeded, "Go build has completed successfully");
        }).fail(function (err) {
            tl.setResult(tl.TaskResult.Failed, err);
        });
    }
    catch(err){
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}
