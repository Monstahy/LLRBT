// visualization.js
import { LLRBTree, Node } from './llrbt.js';
import * as d3 from 'https://cdn.skypack.dev/d3@v6';

document.addEventListener('DOMContentLoaded', () => {
    const tree = new LLRBTree();
    const svg = d3.select('#tree-container').append('svg').attr('width', 800).attr('height', 500);
    const logDiv = d3.select('body').append('div').attr('id', 'log-container').style('text-align', 'left').style('margin-left', '20px');

    function updateVisualization(root) {
        svg.selectAll('*').remove();
        if (root) {
            drawTree(root, 400, 50, 200);
        }
    }

    function drawTree(node, x, y, offset) {
        if (!node) return;

        if (node.left) {
            svg.append('line')
                .attr('x1', x).attr('y1', y)
                .attr('x2', x - offset).attr('y2', y + 80)
                .attr('stroke', 'black');
            drawTree(node.left, x - offset, y + 80, offset / 2);
        }

        if (node.right) {
            svg.append('line')
                .attr('x1', x).attr('y1', y)
                .attr('x2', x + offset).attr('y2', y + 80)
                .attr('stroke', 'black');
            drawTree(node.right, x + offset, y + 80, offset / 2);
        }

        svg.append('circle')
            .attr('cx', x).attr('cy', y)
            .attr('r', 20)
            .attr('fill', node.color === 'RED' ? 'red' : 'black');

        svg.append('text')
            .attr('x', x).attr('y', y + 5)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .text(node.value);
    }

    document.getElementById('insert-btn').addEventListener('click', () => {
        const value = parseInt(document.getElementById('insert-value').value);
        if (!isNaN(value) && value >= 0) {
            const tempTree = new LLRBTree();
            tempTree.root = structuredClone(tree.root);
            let insertedNode = new Node(value);

            function insertTempNode(root, newNode) {
                if (!root) {
                    return newNode;
                }
                if (newNode.value < root.value) {
                    root.left = insertTempNode(root.left, newNode);
                } else if (newNode.value > root.value) {
                    root.right = insertTempNode(root.right, newNode);
                }
                return root;
            }

            tempTree.root = insertTempNode(tempTree.root, insertedNode);
            updateVisualization(tempTree.root);

            setTimeout(() => {
                const logs =[];
                let currentNode = structuredClone(tree.root);

                function insertAndBalanceStep(root, value, stepLogs) {
                    if (!root) {
                        return new Node(value);
                    }
                    if (value < root.value) {
                        root.left = insertAndBalanceStep(root.left, value, stepLogs);
                    } else if (value > root.value) {
                        root.right = insertAndBalanceStep(root.right, value, stepLogs);
                    }

                    // Apply balancing here, after the insertion
                    if (tree._isRed(root.right) && !tree._isRed(root.left)) {
                        root = tree._rotateLeft(root, true);
                        stepLogs.push({ node: structuredClone(root), log: tree.logs.pop() });
                    }
                    if (tree._isRed(root.left) && tree._isRed(root.left.left)) {
                        root = tree._rotateRight(root, true);
                        stepLogs.push({ node: structuredClone(root), log: tree.logs.pop() });
                    }
                    if (tree._isRed(root.left) && tree._isRed(root.right)) {
                        tree._flipColors(root, true);
                        stepLogs.push({ node: structuredClone(root), log: tree.logs.pop() });
                    }

                    return root;
                }

                currentNode = insertAndBalanceStep(currentNode, value, logs);

                const balanceSteps =[];
                let stepIndex = 0;
                function animateBalanceStep() {
                    if (stepIndex < balanceSteps.length) {
                        tree.root = balanceSteps[stepIndex].node;
                        updateVisualization(tree.root);
                        logDiv.selectAll('p').remove();
                        logDiv.append('p').text(balanceSteps[stepIndex].log);
                        stepIndex++;
                        setTimeout(animateBalanceStep, 1000)
                    } else {
                        tree.root = currentNode; // Update tree.root here
                        tree.root.color = "black";
                        updateVisualization(tree.root);
                        logDiv.selectAll('p').remove();
                        logs.reverse().forEach(log => {
                            logDiv.append('p').text(log);
                        });
                    }
                }
                animateBalanceStep();

            }, 1000);
        }
    });

    updateVisualization(tree.root);
});