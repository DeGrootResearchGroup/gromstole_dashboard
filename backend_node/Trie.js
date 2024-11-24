class Node {
    constructor(value, pango_lineage){
        this.value = value;
        this.exists = false;
        this.alias = pango_lineage;
        this.children = {};
    }
}

class Trie {
    constructor(){
        this.root = new Node(null);
    }

    insert(lineage, pango_lineage){
        let current = this.root;
        const lineage_nodes = lineage.split(".");
        lineage_nodes.forEach(node => {
            if(current.children[node] === undefined)
                current.children[node] = new Node(current.value ? current.value + "." + node : node, pango_lineage)
            current = current.children[node];
        });
        current.exists = true;
    }
    
    // search will be implemented on the frontend
    // search(lineage){
    //     let current = this.root;
    //     const lineage_nodes = lineage.split(".");
    //     lineage_nodes.forEach(node => {
    //         if(current.children[node] === undefined)
    //             return false;
    //         current = current.children[node];
    //     })
    //     return current.children.exists;
    // }
}

module.exports = {
    Node,
    Trie
}