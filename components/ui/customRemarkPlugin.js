// customRemarkPlugin.js
import { visit } from 'unist-util-visit';

function customRemarkPlugin() {
    return (tree) => {
        visit(tree, 'text', (node) => {
            const match = node.value.match(/'''c\s*{([^}]*)}\s*'''/);
            if (match) {
                node.type = 'html';
                node.value = `<div>${match[1]}</div>`;
            }
        });
    };
}

export default customRemarkPlugin;