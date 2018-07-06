import { extractNodes } from './utils';

export class Module {
    
    constructor(data, inputs, outputs) {
        var inputs = extractNodes(data.nodes, inputs);
        var outputs = extractNodes(data.nodes, outputs);
    
        this.inputs = [];
        this.outputs = [];
        this.keys = {
            input: inputs.map(n => n.data.name),
            output: outputs.map(n => n.data.name)
        };
    }
    
    read(inputs) {
        this.keys.input.forEach((key, i) => {
            this.inputs[key] = inputs[i];
        });
    }
    
    write(outputs) {
        this.keys.output.forEach((k, i) => {
            outputs[i] = this.outputs[k];
        });
    }
}
    