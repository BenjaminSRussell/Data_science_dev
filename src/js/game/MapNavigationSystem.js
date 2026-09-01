/**
 * MapNavigationSystem - Handles pathfinding on the game map
 */

export class MapNavigationSystem {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * A* Pathfinding Algorithm
     * @param startX - Starting X coordinate
     * @param startY - Starting Y coordinate
     * @param endX - Ending X coordinate
     * @param endY - Ending Y coordinate
     * @returns {Array|null} - Path or null if no path found
     */
    findPath(startX, startY, endX, endY) {
        const openMap = new Map();
        const closedMap = new Map();
        const start = { x: startX, y: startY, g: 0, h: 0, f: 0, parent: null };
        const end = { x: endX, y: endY };

        openMap.set(`${startX},${startY}`, start);

        while (openMap.size > 0) {
            // Find node with the lowest f score
            let lowestFScoreNode = null;
            for (const [key, node] of openMap) {
                if (!lowestFScoreNode || node.f < lowestFScoreNode.f) {
                    lowestFScoreNode = node;
                }
            }

            // Move the current node from open to closed set
            openMap.delete(`${lowestFScoreNode.x},${lowestFScoreNode.y}`);
            closedMap.set(`${lowestFScoreNode.x},${lowestFScoreNode.y}`, lowestFScoreNode);

            // Found the goal
            if (lowestFScoreNode.x === end.x && lowestFScoreNode.y === end.y) {
                return this.reconstructPath(lowestFScoreNode);
            }

            // Explore neighbors
            const neighbors = this.getNeighbors(lowestFScoreNode.x, lowestFScoreNode.y);
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (closedMap.has(key)) continue; // Ignore the neighbor which is already evaluated.

                const g = lowestFScoreNode.g + 1;
                const h = this.heuristic(neighbor.x, neighbor.y, endX, endY);
                const f = g + h;
                const existing = openMap.get(key);

                if (existing) {
                    if (g < existing.g) {
                        existing.g = g;
                        existing.h = h;
                        existing.f = f;
                        existing.parent = lowestFScoreNode;
                    }
                } else {
                    const newNode = { x: neighbor.x, y: neighbor.y, g, h, f, parent: lowestFScoreNode };
                    openMap.set(key, newNode);
                }
            }
        }

        return null; // No path found
    }

    /**
     * Reconstruct path from goal node to start node
     * @param goal - Goal node
     * @returns {Array} - Path as array of coordinates
     */
    reconstructPath(goal) {
        const path = [];
        let current = goal;
        while (current) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }
        return path;
    }

    /**
     * Get neighboring tiles (up, down, left, right)
     * @param x - Current X coordinate
     * @param y - Current Y coordinate
     * @returns {Array} - Array of neighbor coordinates
     */
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -1 }, // up
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }  // left
        ];

        for (const direction of directions) {
            const nx = x + direction.dx;
            const ny = y + direction.dy;
            // Add boundary checks if needed
            neighbors.push({ x: nx, y: ny });
        }

        return neighbors;
    }

    /**
     * Heuristic function (Manhattan distance)
     * @param x1 - First X coordinate
     * @param y1 - First Y coordinate
     * @param x2 - Second X coordinate
     * @param y2 - Second Y coordinate
     * @returns {number} - Heuristic distance
     */
    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
}