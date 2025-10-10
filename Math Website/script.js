// Initialize JSXGraph board globally
let board = JXG.JSXGraph.initBoard('jxgbox', {
    boundingbox: [-10, 10, 10, -10],
    axis: true,
    showCopyright: false,
    defaultAxes: {
        x: { name: 'x', label: { position: 'rt', offset: [10, -15] } },
        y: { name: 'y', label: { position: 'rt', offset: [15, 10] } }
    },
    // Touch control settings
    pan: {
        enabled: true,
        needTwoFingers: false,  // Allow single finger panning
        needShift: false       // Don't require shift key on desktop
    },
    zoom: {
        enabled: true,
        needShift: false,      // Don't require shift key on desktop
        pinchHorizontal: true, // Enable pinch to zoom
        pinchVertical: true,   // Enable pinch to zoom
        min: 0.1,             // Minimum zoom level
        max: 10               // Maximum zoom level
    },
    showNavigation: true,      // Show navigation buttons
    showZoom: true,           // Show zoom buttons
    keyboard: {
        enabled: true,         // Enable keyboard controls
        pan: true,            // Arrow keys for panning
        zoom: true            // +/- keys for zooming
    }
});

function calculateConic() {
    const equationInput = document.getElementById('equationInput').value.trim();
    
    // Clear previous results
    document.getElementById('equationType').innerHTML = '';
    document.getElementById('center').innerHTML = '';
    document.getElementById('principalAxis').innerHTML = '';
    document.getElementById('vertices').innerHTML = '';
    document.getElementById('coVertices').innerHTML = '';
    document.getElementById('foci').innerHTML = '';
    document.getElementById('majorMinorAxes').innerHTML = '';
    document.getElementById('latusRectum').innerHTML = '';
    document.getElementById('transverseConjugateAxes').innerHTML = '';
    document.getElementById('fundamentalRectangle').innerHTML = '';
    document.getElementById('asymptotes').innerHTML = '';

    let type = '';
    let h = 0, k = 0, a_squared = 0, b_squared = 0;
    let isXMajor = true;

    // Regex patterns
    const termX = `(?:\\(x\\s*([+\\-])\\s*(\\d+)\\)|x)`;
    const termY = `(?:\\(y\\s*([+\\-])\\s*(\\d+)\\)|y)`;
    
    const ellipseRegex = new RegExp(`^\\s*${termX}\\^2\\s*\\/\\s*(\\d+)\\s*\\+\\s*${termY}\\^2\\s*\\/\\s*(\\d+)\\s*=\\s*1\\s*$`, 'i');
    const hyperbolaXMajorRegex = new RegExp(`^\\s*${termX}\\^2\\s*\\/\\s*(\\d+)\\s*-\\s*${termY}\\^2\\s*\\/\\s*(\\d+)\\s*=\\s*1\\s*$`, 'i');
    const hyperbolaYMajorRegex = new RegExp(`^\\s*${termY}\\^2\\s*\\/\\s*(\\d+)\\s*-\\s*${termX}\\^2\\s*\\/\\s*(\\d+)\\s*=\\s*1\\s*$`, 'i');

    let match;

    if (match = equationInput.match(ellipseRegex)) {
        type = 'Ellipse';
        h = match[1] === undefined ? 0 : (match[1] === '-' ? parseFloat(match[2]) : -parseFloat(match[2]));
        const x_denom = parseFloat(match[3]); // Denominator under x term
        k = match[4] === undefined ? 0 : (match[4] === '-' ? parseFloat(match[5]) : -parseFloat(match[5]));
        const y_denom = parseFloat(match[6]); // Denominator under y term

        // Determine orientation and assign a and b
        if (x_denom < y_denom) {
            // Vertical major axis (y term has larger denominator)
            a_squared = y_denom;
            b_squared = x_denom;
            isXMajor = false;
            console.log('Vertical ellipse detected');
        } else {
            // Horizontal major axis (x term has larger or equal denominator)
            a_squared = x_denom;
            b_squared = y_denom;
            isXMajor = true;
            console.log('Horizontal ellipse detected');
        }
    } else if (match = equationInput.match(hyperbolaXMajorRegex)) {
        // Horizontal hyperbola: (x-h)²/a² - (y-k)²/b² = 1
        type = 'Hyperbola';
        isXMajor = true;
        h = match[1] === undefined ? 0 : (match[1] === '-' ? parseFloat(match[2]) : -parseFloat(match[2]));
        a_squared = parseFloat(match[3]); // Transverse axis (x term)
        k = match[4] === undefined ? 0 : (match[4] === '-' ? parseFloat(match[5]) : -parseFloat(match[5]));
        b_squared = parseFloat(match[6]); // Conjugate axis (y term)
        console.log('Horizontal hyperbola detected');
    } else if (match = equationInput.match(hyperbolaYMajorRegex)) {
        // Vertical hyperbola: (y-k)²/a² - (x-h)²/b² = 1
        type = 'Hyperbola';
        isXMajor = false;
        k = match[1] === undefined ? 0 : (match[1] === '-' ? parseFloat(match[2]) : -parseFloat(match[2]));
        a_squared = parseFloat(match[3]); // Transverse axis (y term)
        h = match[4] === undefined ? 0 : (match[4] === '-' ? parseFloat(match[5]) : -parseFloat(match[5]));
        b_squared = parseFloat(match[6]); // Conjugate axis (x term)
        console.log('Vertical hyperbola detected');
    } else {
        alert('Could not parse the equation. Please use a format like (x-h)^2/a^2 + (y-k)^2/b^2 = 1 or its hyperbola equivalents.');
        return;
    }

    const a = Math.sqrt(a_squared);
    const b = Math.sqrt(b_squared);
    let c_squared, c;

    if (type === 'Ellipse') {
        c_squared = a_squared - b_squared;
    } else { // Hyperbola
        c_squared = a_squared + b_squared;
    }
    c = Math.sqrt(Math.abs(c_squared)); // Use Math.abs for c_squared in case of precision issues

    document.getElementById('equationType').innerHTML = `<strong>Equation Type:</strong> ${type}`;
    document.getElementById('center').innerHTML = `<strong>C = Center (h, k):</strong> (${h}, ${k})`;

    let principalAxisText = '';
    let verticesText = '';
    let coVerticesText = '';
    let fociText = '';
    let majorMinorAxesText = '';
    let latusRectumText = '';
    let transverseConjugateAxesText = '';
    let fundamentalRectangleText = '';
    let asymptotesText = '';

    if (type === 'Ellipse') {
        principalAxisText = isXMajor ? '<strong>Principal Axis:</strong> Horizontal (y = k = ' + k + ')' : '<strong>Principal Axis:</strong> Vertical (x = h = ' + h + ')';

        const V1 = isXMajor ? `(${h - a}, ${k})` : `(${h}, ${k - a})`;
        const V2 = isXMajor ? `(${h + a}, ${k})` : `(${h}, ${k + a})`;
        verticesText = `<strong>V1 = Vertex 1:</strong> (${(isXMajor ? h - a : h).toFixed(2)}, ${(isXMajor ? k : k - a).toFixed(2)})<br><strong>V2 = Vertex 2:</strong> (${(isXMajor ? h + a : h).toFixed(2)}, ${(isXMajor ? k : k + a).toFixed(2)})`;

        const W1 = isXMajor ? `(${h}, ${k - b})` : `(${h - b}, ${k})`;
        const W2 = isXMajor ? `(${h}, ${k + b})` : `(${h + b}, ${k})`;
        coVerticesText = `<strong>W1 = Co-Vertex 1:</strong> (${(isXMajor ? h : h - b).toFixed(2)}, ${(isXMajor ? k - b : k).toFixed(2)})<br><strong>W2 = Co-Vertex 2:</strong> (${(isXMajor ? h : h + b).toFixed(2)}, ${(isXMajor ? k + b : k).toFixed(2)})`;
        
        const F1 = isXMajor ? `(${h - c}, ${k})` : `(${h}, ${k - c})`;
        const F2 = isXMajor ? `(${h + c}, ${k})` : `(${h}, ${k + c})`;
        fociText = `<strong>F1 = Focus 1:</strong> (${(isXMajor ? h - c : h).toFixed(2)}, ${(isXMajor ? k : k - c).toFixed(2)})<br><strong>F2 = Focus 2:</strong> (${(isXMajor ? h + c : h).toFixed(2)}, ${(isXMajor ? k : k + c).toFixed(2)})`;

        majorMinorAxesText = `<strong>Major Axis Length:</strong> ${(2 * a).toFixed(2)}<br><strong>Minor Axis Length:</strong> ${(2 * b).toFixed(2)}`;
        
        const latusRectumLength = (2 * b_squared) / a;
        latusRectumText = `<strong>Latus Rectum Length:</strong> ${latusRectumLength.toFixed(2)}`;

    } else { // Hyperbola
        principalAxisText = isXMajor ? '<strong>Transverse Axis:</strong> Horizontal (y = k = ' + k + ')' : '<strong>Transverse Axis:</strong> Vertical (x = h = ' + h + ')';

        const V1 = isXMajor ? `(${h - a}, ${k})` : `(${h}, ${k - a})`;
        const V2 = isXMajor ? `(${h + a}, ${k})` : `(${h}, ${k + a})`;
        verticesText = `<strong>V1 = Vertex 1:</strong> (${(isXMajor ? h - a : h).toFixed(2)}, ${(isXMajor ? k : k - a).toFixed(2)})<br><strong>V2 = Vertex 2:</strong> (${(isXMajor ? h + a : h).toFixed(2)}, ${(isXMajor ? k : k + a).toFixed(2)})`;

        const W1 = isXMajor ? `(${h}, ${k - b})` : `(${h - b}, ${k})`;
        const W2 = isXMajor ? `(${h}, ${k + b})` : `(${h + b}, ${k})`;
        coVerticesText = `<strong>W1 = Co-Vertex 1:</strong> (${(isXMajor ? h : h - b).toFixed(2)}, ${(isXMajor ? k - b : k).toFixed(2)})<br><strong>W2 = Co-Vertex 2:</strong> (${(isXMajor ? h : h + b).toFixed(2)}, ${(isXMajor ? k + b : k).toFixed(2)})`;

        const F1 = isXMajor ? `(${h - c}, ${k})` : `(${h}, ${k - c})`;
        const F2 = isXMajor ? `(${h + c}, ${k})` : `(${h}, ${k + c})`;
        fociText = `<strong>F1 = Focus 1:</strong> (${(isXMajor ? h - c : h).toFixed(2)}, ${(isXMajor ? k : k - c).toFixed(2)})<br><strong>F2 = Focus 2:</strong> (${(isXMajor ? h + c : h).toFixed(2)}, ${(isXMajor ? k : k + c).toFixed(2)})`;

        transverseConjugateAxesText = `<strong>Transverse Axis Length:</strong> ${(2 * a).toFixed(2)}<br><strong>Conjugate Axis Length:</strong> ${(2 * b).toFixed(2)}`;

        const latusRectumLength = (2 * b_squared) / a;
        latusRectumText = `<strong>Latus Rectum Length:</strong> ${latusRectumLength.toFixed(2)}`;

        // Asymptotes equations
        const slope = isXMajor ? b/a : a/b;
        asymptotesText = `<strong>Asymptotes:</strong><br>`;
        if (isXMajor) {
            // For horizontal hyperbola (transverse axis is x-axis)
            asymptotesText += `y = ±${b}/${a}x<br>`;
            asymptotesText += `y = +${b}/${a}x<br>`;
            asymptotesText += `y = -${b}/${a}x`;
        } else {
            // For vertical hyperbola (transverse axis is y-axis)
            asymptotesText += `y = ±${a}/${b}x<br>`;
            asymptotesText += `y = +${a}/${b}x<br>`;
            asymptotesText += `y = -${a}/${b}x`;
        }
        
        // If center is not at origin, add shifted form
        if (h !== 0 || k !== 0) {
            asymptotesText += `<br><br><strong>Shifted Form:</strong><br>`;
            if (isXMajor) {
                asymptotesText += `y - ${k} = ±${(b/a).toFixed(2)}(x - ${h})`;
            } else {
                asymptotesText += `y - ${k} = ±${(a/b).toFixed(2)}(x - ${h})`;
            }
        }
            
        // Fundamental Rectangle
        fundamentalRectangleText = `<strong>Fundamental Rectangle Vertices:</strong><br>` +
            `Top-Left: (${(h - a).toFixed(2)}, ${(k + b).toFixed(2)})<br>` +
            `Top-Right: (${(h + a).toFixed(2)}, ${(k + b).toFixed(2)})<br>` +
            `Bottom-Left: (${(h - a).toFixed(2)}, ${(k - b).toFixed(2)})<br>` +
            `Bottom-Right: (${(h + a).toFixed(2)}, ${(k - b).toFixed(2)})`;
    }

    document.getElementById('principalAxis').innerHTML = principalAxisText;
    document.getElementById('vertices').innerHTML = verticesText;
    document.getElementById('coVertices').innerHTML = coVerticesText;
    document.getElementById('foci').innerHTML = fociText;
    document.getElementById('majorMinorAxes').innerHTML = majorMinorAxesText;
    document.getElementById('latusRectum').innerHTML = latusRectumText;
    document.getElementById('transverseConjugateAxes').innerHTML = transverseConjugateAxesText;
    document.getElementById('fundamentalRectangle').innerHTML = fundamentalRectangleText;
    document.getElementById('asymptotes').innerHTML = asymptotesText;

    drawConic(type, h, k, a, b, isXMajor);
}

function drawConic(type, h, k, a, b, isXMajor) {
    // Clear the board and reinitialize
    JXG.JSXGraph.freeBoard(board);
    board = JXG.JSXGraph.initBoard('jxgbox', {
        boundingbox: [-10, 10, 10, -10],
        axis: true,
        showCopyright: false,
        defaultAxes: {
            x: { name: 'x', label: { position: 'rt', offset: [10, -15] } },
            y: { name: 'y', label: { position: 'rt', offset: [15, 10] } }
        },
        // Touch control settings
        pan: {
            enabled: true,
            needTwoFingers: false,
            needShift: false
        },
        zoom: {
            enabled: true,
            needShift: false,
            pinchHorizontal: true,
            pinchVertical: true,
            min: 0.1,
            max: 10
        },
        showNavigation: true,
        showZoom: true,
        keyboard: {
            enabled: true,
            pan: true,
            zoom: true
        }
    });

    // Calculate focal points
    const c = Math.sqrt(type === 'Ellipse' ? a * a - b * b : a * a + b * b);
    
    // Plot center point (green)
    const center = board.create('point', [h, k], {
        name: `C(${h}, ${k})`,
        size: 4,
        face: 'circle',
        color: 'green',
        fixed: true
    });

    // Plot vertices (red)
    const v1 = board.create('point', 
        isXMajor ? [h - a, k] : [h, k - a], {
        name: 'V₁',
        size: 4,
        face: 'cross',
        color: 'red',
        fixed: true
    });
    const v2 = board.create('point',
        isXMajor ? [h + a, k] : [h, k + a], {
        name: 'V₂',
        size: 4,
        face: 'cross',
        color: 'red',
        fixed: true
    });

    // Plot co-vertices (orange)
    const w1 = board.create('point',
        isXMajor ? [h, k - b] : [h - b, k], {
        name: 'W₁',
        size: 4,
        face: 'diamond',
        color: 'orange',
        fixed: true
    });
    const w2 = board.create('point',
        isXMajor ? [h, k + b] : [h + b, k], {
        name: 'W₂',
        size: 4,
        face: 'diamond',
        color: 'orange',
        fixed: true
    });

    // Plot foci (purple)
    const f1 = board.create('point',
        isXMajor ? [h - c, k] : [h, k - c], {
        name: 'F₁',
        size: 4,
        face: 'plus',
        color: 'purple',
        fixed: true
    });
    const f2 = board.create('point',
        isXMajor ? [h + c, k] : [h, k + c], {
        name: 'F₂',
        size: 4,
        face: 'plus',
        color: 'purple',
        fixed: true
    });

    // Plot the conic section
    if (type === 'Ellipse') {
        // Create parametric functions for the ellipse
        const ellipseCurve = board.create('curve', [
            t => h + (isXMajor ? a * Math.cos(t) : b * Math.cos(t)),
            t => k + (isXMajor ? b * Math.sin(t) : a * Math.sin(t)),
            0, 2 * Math.PI
        ], {
            strokeColor: 'blue',
            strokeWidth: 2
        });

        // Add directrix lines for the ellipse
        const e = c/a; // eccentricity
        const d = a/e; // distance from center to directrix
        if (isXMajor) {
            board.create('line', [[h - d, k - 10], [h - d, k + 10]], {
                dash: 1,
                strokeColor: '#999999',
                strokeWidth: 1,
                name: 'Left Directrix',
                withLabel: false
            });
            board.create('line', [[h + d, k - 10], [h + d, k + 10]], {
                dash: 1,
                strokeColor: '#999999',
                strokeWidth: 1,
                name: 'Right Directrix',
                withLabel: false
            });
        } else {
            board.create('line', [[h - 10, k - d], [h + 10, k - d]], {
                dash: 1,
                strokeColor: '#999999',
                strokeWidth: 1,
                name: 'Bottom Directrix',
                withLabel: false
            });
            board.create('line', [[h - 10, k + d], [h + 10, k + d]], {
                dash: 1,
                strokeColor: '#999999',
                strokeWidth: 1,
                name: 'Top Directrix',
                withLabel: false
            });
        }
    } else {
        // Create parametric functions for the hyperbola branches
        if (isXMajor) {
            // Right branch
            board.create('curve', [
                t => h + a * Math.cosh(t),
                t => k + b * Math.sinh(t),
                -2, 2
            ], {
                strokeColor: 'blue',
                strokeWidth: 2
            });
            // Left branch
            board.create('curve', [
                t => h - a * Math.cosh(t),
                t => k - b * Math.sinh(t),
                -2, 2
            ], {
                strokeColor: 'blue',
                strokeWidth: 2
            });
        } else {
            // Upper branch
            board.create('curve', [
                t => h + b * Math.sinh(t),
                t => k + a * Math.cosh(t),
                -2, 2
            ], {
                strokeColor: 'blue',
                strokeWidth: 2
            });
            // Lower branch
            board.create('curve', [
                t => h - b * Math.sinh(t),
                t => k - a * Math.cosh(t),
                -2, 2
            ], {
                strokeColor: 'blue',
                strokeWidth: 2
            });
        }

        // Add directrix lines for the hyperbola
        const e = c/a; // eccentricity
        const d = a/e; // distance from center to directrix
        if (isXMajor) {
            board.create('line', [[h - d, k - 10], [h - d, k + 10]], {
                dash: 1,
                strokeColor: '#999999',
                strokeWidth: 1,
                name: 'Left Directrix',
                withLabel: false
            });
            board.create('line', [[h + d, k - 10], [h + d, k + 10]], {
                dash: 1,
                strokeColor: '#999999',
                strokeWidth: 1,
                name: 'Right Directrix',
                withLabel: false
            });
        } else {
            board.create('line', [[h - 10, k - d], [h + 10, k - d]], {
                dash: 1,
                strokeColor: '#999999',
                strokeWidth: 1,
                name: 'Bottom Directrix',
                withLabel: false
            });
            board.create('line', [[h - 10, k + d], [h + 10, k + d]], {
                dash: 1,
                strokeColor: '#999999',
                strokeWidth: 1,
                name: 'Top Directrix',
                withLabel: false
            });
        }

        // Plot asymptotes
        const slope = isXMajor ? b/a : a/b;
        board.create('line', [
            [h, k], [h + 1, k + slope]], 
            {dash: 2, strokeColor: 'gray'}
        );
        board.create('line', [
            [h, k], [h + 1, k - slope]], 
            {dash: 2, strokeColor: 'gray'}
        );

        // Plot fundamental rectangle for hyperbola
        const rectPoints = [
            board.create('point', [h - a, k + b], {visible: false}),
            board.create('point', [h + a, k + b], {visible: false}),
            board.create('point', [h + a, k - b], {visible: false}),
            board.create('point', [h - a, k - b], {visible: false})
        ];
        board.create('polygon', rectPoints, {
            borders: {strokeColor: 'gray', dash: 2},
            fillColor: 'transparent'
        });
    }

    // Plot latus rectum points
    const latusRectumLength = (2 * b * b) / a;
    const lr1 = board.create('point',
        isXMajor ? [h - c, k + latusRectumLength/2] : [h + latusRectumLength/2, k - c],
        {name: 'LR₁', size: 3, face: 'square', color: 'blue', fixed: true}
    );
    const lr2 = board.create('point',
        isXMajor ? [h - c, k - latusRectumLength/2] : [h - latusRectumLength/2, k - c],
        {name: 'LR₂', size: 3, face: 'square', color: 'blue', fixed: true}
    );
    const lr3 = board.create('point',
        isXMajor ? [h + c, k + latusRectumLength/2] : [h + latusRectumLength/2, k + c],
        {name: 'LR₃', size: 3, face: 'square', color: 'blue', fixed: true}
    );
    const lr4 = board.create('point',
        isXMajor ? [h + c, k - latusRectumLength/2] : [h - latusRectumLength/2, k + c],
        {name: 'LR₄', size: 3, face: 'square', color: 'blue', fixed: true}
    );

    // Adjust the viewing window to fit the conic section with padding
    const maxExtent = Math.max(Math.abs(a), Math.abs(b), Math.abs(c)) * 1.5;
    board.setBoundingBox([
        h - maxExtent,
        k + maxExtent,
        h + maxExtent,
        k - maxExtent
    ]);

    // Update HTML display with information
    // Display basic information
    document.getElementById('equationType').innerHTML = `<strong>Equation Type:</strong> ${type} (${isXMajor ? 'Horizontal' : 'Vertical'})`;
    document.getElementById('center').innerHTML = `<strong>Center (h,k):</strong> (${h}, ${k})`;
    
    // Display axis information with equation
    if (type === 'Ellipse') {
        document.getElementById('principalAxis').innerHTML = 
            `<strong>Principal Axis:</strong> ${isXMajor ? 
                `Horizontal (y = ${k}) - Major axis along x-axis` : 
                `Vertical (x = ${h}) - Major axis along y-axis`}`;
    } else {
        document.getElementById('principalAxis').innerHTML = 
            `<strong>Transverse Axis:</strong> ${isXMajor ? 
                `Horizontal (y = ${k}) - Opens left/right` : 
                `Vertical (x = ${h}) - Opens up/down`}`;
    }
    
    // Display vertices with clear labeling based on orientation
    document.getElementById('vertices').innerHTML = 
        `<strong>Vertices:</strong> ${isXMajor ? '(on x-axis)' : '(on y-axis)'}<br>` +
        `V₁(${v1.X().toFixed(2)}, ${v1.Y().toFixed(2)})<br>` +
        `V₂(${v2.X().toFixed(2)}, ${v2.Y().toFixed(2)})`;

    // Display co-vertices with clear labeling based on orientation
    document.getElementById('coVertices').innerHTML = 
        `<strong>Co-vertices:</strong> ${isXMajor ? '(on y-axis)' : '(on x-axis)'}<br>` +
        `W₁(${w1.X().toFixed(2)}, ${w1.Y().toFixed(2)})<br>` +
        `W₂(${w2.X().toFixed(2)}, ${w2.Y().toFixed(2)})`;

    // Display foci with clear labeling based on orientation and focal distance calculation
    document.getElementById('foci').innerHTML = 
        `<strong>Foci:</strong> ${isXMajor ? '(on x-axis)' : '(on y-axis)'}<br>` +
        `F₁(${f1.X().toFixed(2)}, ${f1.Y().toFixed(2)})<br>` +
        `F₂(${f2.X().toFixed(2)}, ${f2.Y().toFixed(2)})<br>` +
        `<strong>Distance from center to focus (c):</strong> ${c.toFixed(2)}<br>` +
        `c = √(${type === 'Hyperbola' ? 'a² + b²' : 'a² - b²'}) = √(${a}² ${type === 'Hyperbola' ? '+' : '-'} ${b}²)`;
    
    if (type === 'Ellipse') {
        document.getElementById('majorMinorAxes').innerHTML = 
            `<strong>Major Axis Length:</strong> ${(2*a).toFixed(2)} (a = ${a})<br>` +
            `<strong>Minor Axis Length:</strong> ${(2*b).toFixed(2)} (b = ${b})`;
    } else {
        document.getElementById('transverseConjugateAxes').innerHTML = 
            `<strong>Transverse Axis Length:</strong> ${(2*a).toFixed(2)} (a = ${a})<br>` +
            `<strong>Conjugate Axis Length:</strong> ${(2*b).toFixed(2)} (b = ${b})`;
        
        document.getElementById('asymptotes').innerHTML = 
            `<strong>Asymptotes:</strong><br>`;
        if (isXMajor) {
            document.getElementById('asymptotes').innerHTML += 
                `y = ±${b}/${a}x<br>` +
                `y = +${b}/${a}x<br>` +
                `y = -${b}/${a}x`;
        } else {
            document.getElementById('asymptotes').innerHTML += 
                `y = ±${a}/${b}x<br>` +
                `y = +${a}/${b}x<br>` +
                `y = -${a}/${b}x`;
        }
        
        // Add shifted form if not at origin
        if (h !== 0 || k !== 0) {
            document.getElementById('asymptotes').innerHTML += 
                `<br><br><strong>Shifted Form:</strong><br>`;
            if (isXMajor) {
                document.getElementById('asymptotes').innerHTML += 
                    `y - ${k} = ±${b}/${a}(x - ${h})`;
            } else {
                document.getElementById('asymptotes').innerHTML += 
                    `y - ${k} = ±${a}/${b}(x - ${h})`;
            }
        }
            
        document.getElementById('fundamentalRectangle').innerHTML = 
            `<strong>Fundamental Rectangle Vertices:</strong><br>` +
            `Top-Left: (${(h - a).toFixed(2)}, ${(k + b).toFixed(2)})<br>` +
            `Top-Right: (${(h + a).toFixed(2)}, ${(k + b).toFixed(2)})<br>` +
            `Bottom-Left: (${(h - a).toFixed(2)}, ${(k - b).toFixed(2)})<br>` +
            `Bottom-Right: (${(h + a).toFixed(2)}, ${(k - b).toFixed(2)})`;
    }

    document.getElementById('latusRectum').innerHTML = `<strong>Latus Rectum Points:</strong><br>` +
        `LR₁(${lr1.X().toFixed(2)}, ${lr1.Y().toFixed(2)})<br>` +
        `LR₂(${lr2.X().toFixed(2)}, ${lr2.Y().toFixed(2)})<br>` +
        `LR₃(${lr3.X().toFixed(2)}, ${lr3.Y().toFixed(2)})<br>` +
        `LR₄(${lr4.X().toFixed(2)}, ${lr4.Y().toFixed(2)})`;
}