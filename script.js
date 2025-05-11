document.addEventListener('DOMContentLoaded', () => {
    // --- Helper Functions ---
    function createMatrixHTML(matrix, elementId, col1Class = '', col2Class = '') {
        const container = document.getElementById(elementId);
        if (!container) {
            console.error("Element not found for matrix:", elementId);
            return;
        }
        const format = (n) => Number.isInteger(n) ? n : parseFloat(n.toFixed(2));
        
        let tableHTML = '<table>';
        tableHTML += `<tr><td class="${col1Class}">${format(matrix[0][0])}</td><td class="${col2Class}">${format(matrix[0][1])}</td></tr>`;
        tableHTML += `<tr><td class="${col1Class}">${format(matrix[1][0])}</td><td class="${col2Class}">${format(matrix[1][1])}</td></tr>`;
        tableHTML += '</table>';
        container.innerHTML = tableHTML;
    }

    function multiplyMatrices(m1, m2) {
        const m2_col1 = [m2[0][0], m2[1][0]];
        const m2_col2 = [m2[0][1], m2[1][1]];
        const new_col1 = multiplyMatrixVector(m1, m2_col1);
        const new_col2 = multiplyMatrixVector(m1, m2_col2);
        return [
            [new_col1[0], new_col2[0]],
            [new_col1[1], new_col2[1]]
        ];
    }

    function multiplyMatrixVector(matrix, vector) {
        return [
            matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
            matrix[1][0] * vector[0] + matrix[1][1] * vector[1]
        ];
    }

    function calculateDeterminant2x2(matrix) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    function drawGridAndVectors(canvasId, iHat, jHat, transformationMatrix = [[1,0],[0,1]], showUnitSquare = true) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with ID "${canvasId}" not found.`);
            return;
        }
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const scale = 30; 
        const originX = width / 2;
        const originY = height / 2;

        ctx.clearRect(0, 0, width, height);

        const transformPoint = (x, y) => {
            const newX = transformationMatrix[0][0] * x + transformationMatrix[0][1] * y;
            const newY = transformationMatrix[1][0] * x + transformationMatrix[1][1] * y;
            return [originX + newX * scale, originY - newY * scale];
        };
        
        // Draw grid lines
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 0.5;
        for (let xVal = -Math.floor(width / (2 * scale)); xVal <= Math.floor(width / (2 * scale)); xVal++) {
            const [startX, startY] = transformPoint(xVal, -height / (2 * scale));
            const [endX, endY] = transformPoint(xVal, height / (2 * scale));
            ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
        }
        for (let yVal = -Math.floor(height / (2 * scale)); yVal <= Math.floor(height / (2 * scale)); yVal++) {
            const [startX, startY] = transformPoint(-width / (2 * scale), yVal);
            const [endX, endY] = transformPoint(width / (2 * scale), yVal);
            ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
        }

        // Draw transformed unit square before axes and vectors, so they are on top
        if (showUnitSquare) {
            ctx.beginPath();
            const p0_transformed = transformPoint(0,0); // origin
            const p1_transformed = transformPoint(1,0); // transformed (1,0)
            const p2_transformed = transformPoint(1,1); // transformed (1,1)
            const p3_transformed = transformPoint(0,1); // transformed (0,1)
            
            ctx.moveTo(p0_transformed[0], p0_transformed[1]);
            ctx.lineTo(p1_transformed[0], p1_transformed[1]);
            ctx.lineTo(p2_transformed[0], p2_transformed[1]);
            ctx.lineTo(p3_transformed[0], p3_transformed[1]);
            ctx.closePath();
            
            const det = calculateDeterminant2x2(transformationMatrix);
            if (Math.abs(det) < 0.001) { // Squished to line or point
                ctx.fillStyle = 'rgba(128, 128, 128, 0.6)'; // Gray
            } else if (det < 0) {
                ctx.fillStyle = 'rgba(255, 70, 70, 0.4)'; // Light Red for flipped
            } else {
                ctx.fillStyle = 'rgba(255, 255, 100, 0.5)'; // Light Yellow for normal
            }
            ctx.fill();
            ctx.strokeStyle = '#FFD700'; // Gold outline for the square
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Draw axes (thicker)
        ctx.strokeStyle = '#777'; 
        ctx.lineWidth = 1.5;
        const [axisStartXNeg, axisStartYNeg] = transformPoint(-width / (2*scale), 0);
        const [axisEndXPos, axisEndYPos] = transformPoint(width / (2*scale), 0);
        ctx.beginPath(); ctx.moveTo(axisStartXNeg, axisStartYNeg); ctx.lineTo(axisEndXPos, axisEndYPos); ctx.stroke(); // X-axis

        const [axisStartYNseg, axisStartYNsegY] = transformPoint(0, -height / (2*scale));
        const [axisEndYNseg, axisEndYNsegY] = transformPoint(0, height / (2*scale));
        ctx.beginPath(); ctx.moveTo(axisStartYNseg, axisStartYNsegY); ctx.lineTo(axisEndYNseg, axisEndYNsegY); ctx.stroke(); // Y-axis

        function drawVector(vx, vy, color, label) {
            const [endX, endY] = [originX + vx * scale, originY - vy * scale];
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();

            const headlen = 10;
            const angle = Math.atan2(endY - originY, endX - originX);
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.fillStyle = color;
            ctx.font = 'bold 14px Manifold';
            ctx.fillText(label, endX + 5, endY - 5);
        }

        drawVector(iHat[0], iHat[1], '#32CD32', 'î'); 
        drawVector(jHat[0], jHat[1], '#FF6347', 'ĵ'); 
    }
    
    function displayVectorCoords(vector, elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = `[${vector[0].toFixed(2)}, ${vector[1].toFixed(2)}]T`;
        } else {
            console.warn(`Element with ID "${elementId}" not found for displayVectorCoords.`);
        }
    }

    function displayDeterminant(matrix, elementId) {
        const el = document.getElementById(elementId);
        if(el) {
            el.textContent = calculateDeterminant2x2(matrix).toFixed(2);
        } else {
            console.warn(`Element with ID "${elementId}" not found for displayDeterminant.`);
        }
    }

    // --- Animation Helper ---
    function animateTransformation({
        canvasId,
        fromMatrix,
        toMatrix,
        fromIHat,
        toIHat,
        fromJHat,
        toJHat,
        duration = 500,
        showUnitSquare = true,
        onUpdate = () => {},
        onComplete = () => {}
    }) {
        const start = performance.now();
        function lerp(a, b, t) { return a + (b - a) * t; }
        function lerpVec(v1, v2, t) { return [lerp(v1[0], v2[0], t), lerp(v1[1], v2[1], t)]; }
        function lerpMat(m1, m2, t) {
            return [
                [lerp(m1[0][0], m2[0][0], t), lerp(m1[0][1], m2[0][1], t)],
                [lerp(m1[1][0], m2[1][0], t), lerp(m1[1][1], m2[1][1], t)]
            ];
        }
        function frame(now) {
            let t = (now - start) / duration;
            if (t > 1) t = 1;
            const curMatrix = lerpMat(fromMatrix, toMatrix, t);
            const curIHat = lerpVec(fromIHat, toIHat, t);
            const curJHat = lerpVec(fromJHat, toJHat, t);
            drawGridAndVectors(canvasId, curIHat, curJHat, curMatrix, showUnitSquare);
            onUpdate(curMatrix, curIHat, curJHat, t);
            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                onComplete(curMatrix, curIHat, curJHat);
            }
        }
        requestAnimationFrame(frame);
    }

    // --- Recap Section ---
    const recapMatrix = [[1.5, 0.5], [0.5, 1]]; 
    createMatrixHTML(recapMatrix, 'recap-matrix', 'i-hat-color', 'j-hat-color');
    displayDeterminant(recapMatrix, 'recap-matrix-determinant');
    const recapIHat = multiplyMatrixVector(recapMatrix, [1,0]);
    const recapJHat = multiplyMatrixVector(recapMatrix, [0,1]);
    drawGridAndVectors('recapCanvas', recapIHat, recapJHat, recapMatrix, true);

    // --- Determinant Demo Section ---
    const demoDetMatrix = [[2, 1], [0.5, 1.5]]; // Example matrix for demo
    createMatrixHTML(demoDetMatrix, 'demo-det-matrix');
    displayDeterminant(demoDetMatrix, 'demo-det-value');
    drawGridAndVectors('determinantDemoCanvas', 
        multiplyMatrixVector(demoDetMatrix, [1,0]), 
        multiplyMatrixVector(demoDetMatrix, [0,1]), 
        demoDetMatrix, true);


    // --- Composition Section (M_S * M_R) ---
    const M_R = [[0, -1], [1, 0]]; // 90 deg CCW Rotation
    const M_S = [[1, 1], [0, 1]]; // Shear
    
    createMatrixHTML(M_R, 'matrix-R');
    displayDeterminant(M_R, 'det-M_R');
    createMatrixHTML(M_S, 'matrix-S');
    displayDeterminant(M_S, 'det-M_S');

    let iHat_current_SR = [1, 0]; 
    let jHat_current_SR = [0, 1];
    let currentGridTransform_SR = [[1,0],[0,1]]; 

    drawGridAndVectors('compositionCanvas', iHat_current_SR, jHat_current_SR, currentGridTransform_SR, true);
    // Initially, determinant of Identity matrix
    if(document.getElementById('det-M_C_SR')) {
      displayDeterminant(currentGridTransform_SR, 'det-M_C_SR');
    }


    document.getElementById('resetComposition').addEventListener('click', () => {
        iHat_current_SR = [1,0];
        jHat_current_SR = [0,1];
        currentGridTransform_SR = [[1,0],[0,1]];
        drawGridAndVectors('compositionCanvas', iHat_current_SR, jHat_current_SR, currentGridTransform_SR, true);
        document.getElementById('i-hat-after-R').textContent = "";
        document.getElementById('j-hat-after-R').textContent = "";
        document.getElementById('i-hat-after-SR').textContent = "";
        document.getElementById('j-hat-after-SR').textContent = "";
        if (document.getElementById('matrix-composition-SR')) document.getElementById('matrix-composition-SR').innerHTML = "";
        if (document.getElementById('det-M_C_SR')) displayDeterminant(currentGridTransform_SR, 'det-M_C_SR');
    });

    document.getElementById('applyRotation').addEventListener('click', () => {
        // Rotation is applied to standard basis
        const fromIHat = iHat_current_SR;
        const fromJHat = jHat_current_SR;
        const fromMatrix = currentGridTransform_SR;
        const toIHat = multiplyMatrixVector(M_R, [1,0]);
        const toJHat = multiplyMatrixVector(M_R, [0,1]);
        const toMatrix = M_R;
        animateTransformation({
            canvasId: 'compositionCanvas',
            fromMatrix,
            toMatrix,
            fromIHat,
            toIHat,
            fromJHat,
            toJHat,
            duration: 500,
            showUnitSquare: true,
            onUpdate: (curMatrix, curIHat, curJHat, t) => {},
            onComplete: (curMatrix, curIHat, curJHat) => {
                iHat_current_SR = toIHat;
                jHat_current_SR = toJHat;
                currentGridTransform_SR = toMatrix;
                displayVectorCoords(iHat_current_SR, 'i-hat-after-R');
                displayVectorCoords(jHat_current_SR, 'j-hat-after-R');
                document.getElementById('i-hat-after-SR').textContent = "";
                document.getElementById('j-hat-after-SR').textContent = "";
            }
        });
    });

    document.getElementById('applyShearToRotation').addEventListener('click', () => {
        let iHat_after_R, jHat_after_R;
        // Check if rotation was the immediately preceding transformation state for the canvas
        // This logic attempts to ensure M_R was the basis for applying M_S
        if (JSON.stringify(currentGridTransform_SR) !== JSON.stringify(M_R)) {
             // If not, or if it's some other state, assume we start by applying M_R
             iHat_after_R = multiplyMatrixVector(M_R, [1,0]);
             jHat_after_R = multiplyMatrixVector(M_R, [0,1]);
             // Update text for i-hat/j-hat after M_R, as it's being implicitly applied now.
             displayVectorCoords(iHat_after_R, 'i-hat-after-R');
             displayVectorCoords(jHat_after_R, 'j-hat-after-R');
        } else {
            // Rotation was the last step, iHat_current_SR and jHat_current_SR are the rotated vectors
            iHat_after_R = [...iHat_current_SR]; // These are already M_R * basis_vector
            jHat_after_R = [...jHat_current_SR];
        }

        const fromIHat = iHat_after_R;
        const fromJHat = jHat_after_R;
        const fromMatrix = M_R;
        const toIHat = multiplyMatrixVector(M_S, iHat_after_R); 
        const toJHat = multiplyMatrixVector(M_S, jHat_after_R);
        const toMatrix = multiplyMatrices(M_S, M_R);
        animateTransformation({
            canvasId: 'compositionCanvas',
            fromMatrix,
            toMatrix,
            fromIHat,
            toIHat,
            fromJHat,
            toJHat,
            duration: 500,
            showUnitSquare: true,
            onUpdate: (curMatrix, curIHat, curJHat, t) => {},
            onComplete: (curMatrix, curIHat, curJHat) => {
                iHat_current_SR = toIHat;
                jHat_current_SR = toJHat;
                currentGridTransform_SR = toMatrix;
                displayVectorCoords(iHat_current_SR, 'i-hat-after-SR'); 
                displayVectorCoords(jHat_current_SR, 'j-hat-after-SR');
            }
        });
    });

    document.getElementById('showCompositionSR').addEventListener('click', () => {
        const M_C_SR = multiplyMatrices(M_S, M_R);
        const fromIHat = iHat_current_SR;
        const fromJHat = jHat_current_SR;
        const fromMatrix = currentGridTransform_SR;
        const toIHat = [M_C_SR[0][0], M_C_SR[1][0]];
        const toJHat = [M_C_SR[0][1], M_C_SR[1][1]];
        const toMatrix = M_C_SR;
        animateTransformation({
            canvasId: 'compositionCanvas',
            fromMatrix,
            toMatrix,
            fromIHat,
            toIHat,
            fromJHat,
            toJHat,
            duration: 500,
            showUnitSquare: true,
            onUpdate: (curMatrix, curIHat, curJHat, t) => {},
            onComplete: (curMatrix, curIHat, curJHat) => {
                iHat_current_SR = toIHat;
                jHat_current_SR = toJHat;
                currentGridTransform_SR = toMatrix;
                const iHat_after_R_intermediate = multiplyMatrixVector(M_R, [1,0]);
                const jHat_after_R_intermediate = multiplyMatrixVector(M_R, [0,1]);
                displayVectorCoords(iHat_after_R_intermediate, 'i-hat-after-R'); 
                displayVectorCoords(jHat_after_R_intermediate, 'j-hat-after-R');
                displayVectorCoords(iHat_current_SR, 'i-hat-after-SR'); 
                displayVectorCoords(jHat_current_SR, 'j-hat-after-SR');
            }
        });
    });


    // --- Order Matters Section (M_R * M_S) ---
    let iHat_current_RS = [1,0]; 
    let jHat_current_RS = [0,1];
    let currentGridTransform_RS = [[1,0],[0,1]];
    drawGridAndVectors('orderCanvas', iHat_current_RS, jHat_current_RS, currentGridTransform_RS, true);
    if(document.getElementById('det-M_C_RS')) displayDeterminant(currentGridTransform_RS, 'det-M_C_RS');


    document.getElementById('resetOrder').addEventListener('click', () => {
        iHat_current_RS = [1,0];
        jHat_current_RS = [0,1];
        currentGridTransform_RS = [[1,0],[0,1]];
        drawGridAndVectors('orderCanvas', iHat_current_RS, jHat_current_RS, currentGridTransform_RS, true);
        document.getElementById('i-hat-after-S').textContent = "";
        document.getElementById('j-hat-after-S').textContent = "";
        document.getElementById('i-hat-after-RS').textContent = "";
        document.getElementById('j-hat-after-RS').textContent = "";
        if(document.getElementById('matrix-composition-RS')) document.getElementById('matrix-composition-RS').innerHTML = "";
        if(document.getElementById('det-M_C_RS')) displayDeterminant(currentGridTransform_RS, 'det-M_C_RS');
    });

    document.getElementById('applyShearOrder').addEventListener('click', () => {
        const fromIHat = iHat_current_RS;
        const fromJHat = jHat_current_RS;
        const fromMatrix = currentGridTransform_RS;
        const toIHat = multiplyMatrixVector(M_S, [1,0]);
        const toJHat = multiplyMatrixVector(M_S, [0,1]);
        const toMatrix = M_S;
        animateTransformation({
            canvasId: 'orderCanvas',
            fromMatrix,
            toMatrix,
            fromIHat,
            toIHat,
            fromJHat,
            toJHat,
            duration: 500,
            showUnitSquare: true,
            onUpdate: (curMatrix, curIHat, curJHat, t) => {},
            onComplete: (curMatrix, curIHat, curJHat) => {
                iHat_current_RS = toIHat;
                jHat_current_RS = toJHat;
                currentGridTransform_RS = toMatrix;
                displayVectorCoords(iHat_current_RS, 'i-hat-after-S');
                displayVectorCoords(jHat_current_RS, 'j-hat-after-S');
                document.getElementById('i-hat-after-RS').textContent = "";
                document.getElementById('j-hat-after-RS').textContent = "";
            }
        });
    });
    
    document.getElementById('applyRotationToShearOrder').addEventListener('click', () => {
        let iHat_after_S, jHat_after_S;
        if (JSON.stringify(currentGridTransform_RS) !== JSON.stringify(M_S)) {
             iHat_after_S = multiplyMatrixVector(M_S, [1,0]);
             jHat_after_S = multiplyMatrixVector(M_S, [0,1]);
             displayVectorCoords(iHat_after_S, 'i-hat-after-S');
             displayVectorCoords(jHat_after_S, 'j-hat-after-S');
        } else {
            iHat_after_S = [...iHat_current_RS];
            jHat_after_S = [...jHat_current_RS];
        }
        
        const fromIHat = iHat_after_S;
        const fromJHat = jHat_after_S;
        const fromMatrix = M_S;
        const toIHat = multiplyMatrixVector(M_R, iHat_after_S);
        const toJHat = multiplyMatrixVector(M_R, jHat_after_S);
        const toMatrix = multiplyMatrices(M_R, M_S); 
        animateTransformation({
            canvasId: 'orderCanvas',
            fromMatrix,
            toMatrix,
            fromIHat,
            toIHat,
            fromJHat,
            toJHat,
            duration: 500,
            showUnitSquare: true,
            onUpdate: (curMatrix, curIHat, curJHat, t) => {},
            onComplete: (curMatrix, curIHat, curJHat) => {
                iHat_current_RS = toIHat;
                jHat_current_RS = toJHat;
                currentGridTransform_RS = toMatrix;
                displayVectorCoords(iHat_current_RS, 'i-hat-after-RS');
                displayVectorCoords(jHat_current_RS, 'j-hat-after-RS');
            }
        });
    });
    
    document.getElementById('showCompositionRS').addEventListener('click', () => {
        const M_C_RS = multiplyMatrices(M_R, M_S);
        const fromIHat = iHat_current_RS;
        const fromJHat = jHat_current_RS;
        const fromMatrix = currentGridTransform_RS;
        const toIHat = [M_C_RS[0][0], M_C_RS[1][0]];
        const toJHat = [M_C_RS[0][1], M_C_RS[1][1]];
        const toMatrix = M_C_RS;
        animateTransformation({
            canvasId: 'orderCanvas',
            fromMatrix,
            toMatrix,
            fromIHat,
            toIHat,
            fromJHat,
            toJHat,
            duration: 500,
            showUnitSquare: true,
            onUpdate: (curMatrix, curIHat, curJHat, t) => {},
            onComplete: (curMatrix, curIHat, curJHat) => {
                iHat_current_RS = toIHat;
                jHat_current_RS = toJHat;
                currentGridTransform_RS = toMatrix;
                const iHat_after_S_intermediate = multiplyMatrixVector(M_S, [1,0]);
                const jHat_after_S_intermediate = multiplyMatrixVector(M_S, [0,1]);
                displayVectorCoords(iHat_after_S_intermediate, 'i-hat-after-S'); 
                displayVectorCoords(jHat_after_S_intermediate, 'j-hat-after-S');
                displayVectorCoords(iHat_current_RS, 'i-hat-after-RS');
                displayVectorCoords(jHat_current_RS, 'j-hat-after-RS');
            }
        });
    });

    // --- Associativity Section ---
    const M_assoc_initial = [[1.2, -0.5], [0.3, 0.8]]; 
    drawGridAndVectors('associativityCanvas', 
        multiplyMatrixVector(M_assoc_initial, [1,0]), 
        multiplyMatrixVector(M_assoc_initial, [0,1]), 
        M_assoc_initial, true);
});
