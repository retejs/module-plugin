import { Module } from './module';
import { extractNodes } from './utils';

export class ModuleManager {

    constructor(modules) {
        this.engine = null;
        this.modules = modules;
        this.inputs = new Map();
        this.outputs = new Map();
    }
    
    getInputs(data) {
        return extractNodes(data.nodes, this.inputs)
            .map(n => ({ name: n.data.name, socket: this.inputs.get(n.name) }));
    }
    
    getOutputs(data) {
        return extractNodes(data.nodes, this.outputs)
            .map(n => ({ name: n.data.name, socket: this.outputs.get(n.name) }));
    }

    registerInput(name, socket) {
        this.inputs.set(name, socket)
    }

    registerOutput(name, socket) {
        this.outputs.set(name, socket)
    }

    async workerModule(node, inputs, outputs, args) {
        if (!node.data.module) return;
        if (!this.modules[node.data.module]) return;

        var data = this.modules[node.data.module].data;
        var module = new Module();
        var engine = this.engine.clone();

        module.read(inputs);
        await engine.process(data, null, Object.assign({}, args, { module, silent: true }));
        module.write(outputs);
    }
    
    workerInputs(node, inputs, outputs, { module } = {}) {
        if (!module) return;
            
        outputs['output'] = (module.getInput(node.data.name) || [])[0];
    }
        
    workerOutputs(node, inputs, outputs, { module } = {}) {
        if (!module) return;

        module.setOutput(node.data.name, inputs['input'][0]);
    }
        
    setEngine(engine) {
        this.engine = engine;
    }
}