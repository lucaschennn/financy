export function setLocationByGrid(x, y) {
    const NUM_CELLS = 3;

    if (typeof window === 'undefined') {
        return { x: 0, y: 0 }; // Return default values for SSR
    }

    const width_increment = window.innerWidth / NUM_CELLS;
    const height_increment = window.innerHeight / NUM_CELLS;

    return { x: width_increment * x, y: height_increment * y };
}