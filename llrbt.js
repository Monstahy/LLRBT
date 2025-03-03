// llrbt.js
export class Node {
    constructor(value, color = 'RED') {
        this.value = value;
        this.color = color;
        this.left = null;
        this.right = null;
    }
}

export class LLRBTree {
    constructor() {
        this.root = null;
        this.logs = [];
    }

    insert(value) {
        this.logs = [];
        this.root = this._insert(this.root, value);
        if (this.root) {
            this.root.color = 'BLACK';
        }
        return this.logs;
    }

    _insert(node, value) {
        if (!node) {
            return new Node(value);
        }

        if (value < node.value) {
            node.left = this._insert(node.left, value);
        } else if (value > node.value) {
            node.right = this._insert(node.right, value);
        } else {
            return node; // Duplicate values not allowed
        }

        return this._balance(node);
    }

    _balance(node) {
        if (this._isRed(node.right) && !this._isRed(node.left)) {
            node = this._rotateLeft(node, true);
        }
        if (this._isRed(node.left) && this._isRed(node.left.left)) {
            node = this._rotateRight(node, true);
        }
        if (this._isRed(node.left) && this._isRed(node.right)) {
            this._flipColors(node, true);
        }

        return node;
    }

    _rotateLeft(node, log = false) {
        const x = node.right;
        node.right = x.left;
        x.left = node;
        x.color = node.color;
        node.color = 'RED';
        if (log) {
            this.logs.push(`Rotate Left at node ${node.value}`);
        }
        return x;
    }

    _rotateRight(node, log = false) {
        const x = node.left;
        node.left = x.right;
        x.right = node;
        x.color = node.color;
        node.color = 'RED';
        if (log) {
            this.logs.push(`Rotate Right at node ${node.value}`);
        }
        return x;
    }

    _flipColors(node, log = false) {
        node.color = node.color === 'RED' ? 'BLACK' : 'RED';
        if (node.left) node.left.color = node.left.color === 'RED' ? 'BLACK' : 'RED';
        if (node.right) node.right.color = node.right.color === 'RED' ? 'BLACK' : 'RED';
        if (log) {
            this.logs.push(`Flip Colors at node ${node.value}`);
        }
    }

    _isRed(node) {
        return node !== null && node.color === 'RED';
    }
}