const directoryToTree = require('./app');
const fs = require('fs').promises;
const path = require('path');

const testDir = path.join(__dirname, 'testDir');
const testFilePath = path.join(testDir, 'file.txt');
const testLinkFilePath = path.join(testDir, 'file.txt');
const testSubDir = path.join(testDir, 'subDir');
const testSubSubDir = path.join(testSubDir, 'subSubDir');

beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFilePath, 'test content');
    await fs.mkdir(testSubDir);
    await fs.mkdir(testSubSubDir, { recursive: true });
});

afterAll(async () => {
    await fs.rmdir(testDir, { recursive: true });
});

test('should generate tree for root directory', async () => {
    const tree = await directoryToTree(testDir, 1);
    expect(tree).toEqual({
        name: 'testDir',
        path: testDir,
        type: 'dir',
        size: expect.any(Number),
        children: [
            { name: 'file.txt', path: testFilePath, type: 'file', size: expect.any(Number) },
            { name: 'subDir', path: testSubDir, type: 'dir', size: expect.any(Number), children: [] }
        ]
    });
});

test('should handle maxDepth correctly', async () => {
    const tree = await directoryToTree(testDir, 0);
    expect(tree.children).toEqual([]);
});

test('should throw error for non-existent paths', async () => {
    await expect(directoryToTree('./nonExistentPath', 1)).rejects.toThrow('Path does not exist.');
});

test('should not include paths beyond maxDepth', async () => {
    const tree = await directoryToTree(testDir, 0);
    expect(tree.name).toBe('testDir');
    expect(tree.children).toEqual([]);
});

test('should return null for negative maxDepth', async () => {
    const tree = await directoryToTree(testDir, -1);
    expect(tree).toBeNull();
});

test('should not traverse directories beyond maxDepth', async () => {
    const tree = await directoryToTree(testDir, 1);
    const subDirNode = tree.children.find(child => child.name === 'subDir');
    expect(subDirNode.children).toEqual([]);
});