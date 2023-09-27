const fs = require('fs').promises;
const path = require('path');

async function directoryToTree(rootPath, maxDepth) {
    if (maxDepth < 0) {
        return null;
    }

    try {
        const stats = await fs.stat(rootPath);

        if (stats.isFile() || stats.isSymbolicLink()) {
            return {
                name: path.basename(rootPath),
                path: rootPath,
                type: stats.isSymbolicLink() ? 'symlink' : 'file',
                size: stats.size
            };
        }

        if (stats.isDirectory()) {
            let children = [];

            // We only process the children if maxDepth is not reached
            if (maxDepth >= 1) {
                const files = await fs.readdir(rootPath);
                for (let file of files) {
                    const childPath = path.join(rootPath, file);
                    const childNode = await directoryToTree(childPath, maxDepth - 1);
                    if (childNode) {  // Ensure non-null results are added
                        children.push(childNode);
                    }
                }
            }

            return {
                name: path.basename(rootPath),
                path: rootPath,
                type: 'dir',
                size: stats.size,
                children: children
            };
        }
    } catch (error) {
        console.error('Error reading path:', rootPath, '-', error.message);
        throw new Error('Path does not exist.');
    }

    return null; // Safe fallback.
}

if (require.main === module) {
    const [rootPath, maxDepth] = process.argv.slice(2);
    directoryToTree(rootPath, Number(maxDepth)).then(tree => {
        console.log(JSON.stringify(tree, null, 2));
    }).catch(error => {
        console.error('Error:', error.message);
    });
}

module.exports = directoryToTree;