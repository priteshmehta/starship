/**
 * Star Ship - Collision Detection Utilities
 * Helper functions for detecting collisions between game objects
 */

/**
 * Check if two axis-aligned bounding boxes (AABB) overlap
 * @param {Object} a - First bounding box {x, y, width, height}
 * @param {Object} b - Second bounding box {x, y, width, height}
 * @returns {boolean} True if boxes overlap
 */
export function checkAABBCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/**
 * Check if two circles overlap
 * @param {Object} a - First circle {x, y, radius}
 * @param {Object} b - Second circle {x, y, radius}
 * @returns {boolean} True if circles overlap
 */
export function checkCircleCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
}

/**
 * Check if a circle and rectangle overlap
 * @param {Object} circle - Circle {x, y, radius}
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @returns {boolean} True if they overlap
 */
export function checkCircleRectCollision(circle, rect) {
    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Calculate distance from circle center to closest point
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distanceSquared = dx * dx + dy * dy;

    return distanceSquared < circle.radius * circle.radius;
}

/**
 * Check collision between spaceship and asteroid using circle-rect hybrid
 * More accurate than pure AABB for rotating asteroids
 * @param {Object} spaceship - Spaceship object with getBounds()
 * @param {Object} asteroid - Asteroid object with getCircularBounds()
 * @returns {boolean} True if collision detected
 */
export function checkSpaceshipAsteroidCollision(spaceship, asteroid) {
    const shipBounds = spaceship.getBounds();
    const asteroidCircle = asteroid.getCircularBounds();

    return checkCircleRectCollision(asteroidCircle, shipBounds);
}

/**
 * Check collision between spaceship and coin
 * @param {Object} spaceship - Spaceship object with getBounds()
 * @param {Object} coin - Coin object with getBounds()
 * @returns {boolean} True if collision detected
 */
export function checkSpaceshipCoinCollision(spaceship, coin) {
    const shipBounds = spaceship.getBounds();
    const coinBounds = coin.getBounds();

    return checkAABBCollision(shipBounds, coinBounds);
}
