import { Input, Output } from 'rete';
import { Module } from './module';
import { ModuleManager } from './module-manager';

export function install(editor, { engine, modules }) {

    var moduleManager = new ModuleManager(modules);
    moduleManager.setEngine(engine);
        
    editor.on('componentregister', component => {    
        if(!component.module) return;

        const { nodeType, socket } = component.module;
        const name = component.name;

        switch (nodeType) {
            case 'input':
                moduleManager.registerInput(name, socket);
                component.worker = moduleManager.workerInputs.bind(moduleManager);
                break;
            case 'module':
                const builder = component.builder;

                component.updateModuleSockets = (node) => {
                    if (!node.data.module || !modules[node.data.module]) return;

                    node.getConnections().map(c => editor.removeConnection(c));
                    node.inputs.length = 0;
                    node.outputs.length = 0;

                    moduleManager.getInputs(modules[node.data.module].data).forEach(i => {
                        node.addInput(new Input(i.name, i.socket));
                    });
    
                    moduleManager.getOutputs(modules[node.data.module].data).forEach(o => {
                        node.addOutput(new Output(o.name, o.socket));
                    });
                }

                component.builder = (node) => {
                    component.updateModuleSockets(node);
                    builder.call(component, node);
                }    

                component.worker = moduleManager.workerModule.bind(moduleManager);
                break;
            case 'output':
                moduleManager.registerOutput(name, socket);
                component.worker = moduleManager.workerOutputs.bind(moduleManager);
                break;
        }
    });
}