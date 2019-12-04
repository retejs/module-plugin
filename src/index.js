import { Input, Output } from 'rete';
import { ModuleManager } from './module-manager';

function removeIO(node, editor) {
    node.getConnections().forEach(c => editor.removeConnection(c));
    Array.from(node.inputs.values()).forEach(input => node.removeInput(input));
    Array.from(node.outputs.values()).forEach(output => node.removeOutput(output));
}

function addIO(node, inputs, outputs) {
    const uniqueInputsCount = new Set(inputs.map(i => i.name)).size;
    const uniqueOutputsCount = new Set(outputs.map(i => i.name)).size;

    if (uniqueInputsCount !== inputs.length)
        throw `Module ${node.data.module} has duplicate inputs`;
    if (uniqueOutputsCount !== outputs.length)
        throw `Module ${node.data.module} has duplicate outputs`;

    inputs.forEach(i => node.addInput(new Input(i.name, i.name, i.socket)))
    outputs.forEach(o => node.addOutput(new Output(o.name, o.name, o.socket)));
}

function install(editor, { engine, modules }) {

    var moduleManager = new ModuleManager(modules);

    moduleManager.setEngine(engine);
        
    editor.on('componentregister', component => {
        if (!component.module) return;

        // socket - Rete.Socket instance or function that returns a socket instance
        const { nodeType, socket } = component.module;
        const name = component.name;

        switch (nodeType) {
        case 'input':
            let inputsWorker = component.worker;

            moduleManager.registerInput(name, socket);

            component.worker = (...args) => {
                moduleManager.workerInputs.apply(moduleManager, args);
                if (inputsWorker) inputsWorker.apply(component, args);
            }
            break;
        case 'module':
            const builder = component.builder;

            component.updateModuleSockets = (node) => {
                removeIO(node, editor);

                if (!node.data.module || !modules[node.data.module]) return;

                const data = modules[node.data.module].data;
                const inputs = moduleManager.getInputs(data);
                const outputs = moduleManager.getOutputs(data);
                
                try {
                    addIO(node, inputs, outputs)
                } catch (e) {
                    return editor.trigger('warn', e);
                }
            }

            component.builder = async (node) => {
                component.updateModuleSockets(node);
                await builder.call(component, node);
            }

            let moduleWorker = component.worker;

            component.worker = async (...args) => {
                await moduleManager.workerModule.apply(moduleManager, args);
                if (moduleWorker) moduleWorker.apply(component, args);
            };
            break;
        case 'output':
            let outputsWorker = component.worker;

            moduleManager.registerOutput(name, socket);

            component.worker = (...args) => {
                if (outputsWorker) outputsWorker.apply(component, args);
                moduleManager.workerOutputs.apply(moduleManager, args);
            }
            break;
        default: break;
        }
    });
}

export default {
    install
}