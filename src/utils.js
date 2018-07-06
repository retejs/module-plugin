export function extractNodes(nodes, map) {
    const names = Array.from(map.keys());
    
    return Object.keys(nodes)
        .filter(k => names.includes(nodes[k].name))
        .map(k => nodes[k])
        .sort((n1, n2) => n1.position[1] > n2.position[1]);
}