// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function createSVG() {
    const svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    svg.attr('role', 'img')
        .attr('viewBox', '0 0 64 72')
        .attr('width', '1em')
        .attr('height', '1.125em')
        .style('width', '1em')
        .style('height', '1.125em');
    return svg;
}

function createComponent() {
    const g = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
    g.attr('stroke', 'black').attr('fill', 'none').attr('stroke-width', 4).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
    return g;
}

function boundary(svg) {
    svg.append('rect')
        .attr('x', 0).attr('y', 0)
        .attr('width', 64).attr('height', '72')
        .attr('fill', 'none').attr('stroke', 'rgb(0 0 0 / 0.2)').attr('stroke-width', 2)
        .attr('stroke-dasharray', '2,2').attr('stroke-dashoffset', 1);
}

function auxiliaryLine(svg) {
    const g = svg.append('g')
        .attr('fill', 'none').attr('stroke', 'rgb(0 0 0 / 0.2)').attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');

    const p0 = d3.path();
    p0.moveTo(0, 64);
    p0.lineTo(64, 64);
    g.append('path').attr('d', p0);

    const p1 = d3.path();
    p1.moveTo(48, 0);
    p1.lineTo(0, 48);
    g.append('path').attr('d', p1);

    const p2 = d3.path();
    p2.moveTo(64, 16);
    p2.lineTo(16, 64);
    g.append('path').attr('d', p2);

    const p3 = d3.path();
    p3.moveTo(24, 24);
    p3.lineTo(40, 40);
    g.append('path').attr('d', p3);

    svg.append('circle').attr('fill', 'red').attr('cx', 12).attr('cy', 36).attr('r', 1);
    svg.append('circle').attr('fill', 'red').attr('cx', 36).attr('cy', 12).attr('r', 1);

    svg.append('circle').attr('fill', 'red').attr('cx', 52).attr('cy', 28).attr('r', 1);
    svg.append('circle').attr('fill', 'red').attr('cx', 28).attr('cy', 52).attr('r', 1);
}

function createDigitalLT(value) {
    const g = createComponent();

    const b0 = (value & 0x01) != 0;
    const b1 = (value & 0x02) != 0;
    const b2 = (value & 0x04) != 0;
    const b3 = (value & 0x08) != 0;

    if (b0) {
        const p = d3.path();
        p.moveTo(12, 36);
        p.quadraticCurveTo(12, 12, 36, 12);
        g.append('path').attr('d', p);
    }

    if (b1) {
        const p = d3.path();
        p.moveTo(24, 2);
        p.lineTo(2, 24);
        g.append('path').attr('d', p);
    }

    if (b2 && !b3) {
        const p = d3.path();
        p.moveTo(16, 2);
        p.lineTo(24, 24);
        p.lineTo(2, 16);
        g.append('path').attr('d', p);
    }

    if (b3 && !b2) {
        const p = d3.path();
        p.moveTo(24, 2);
        p.lineTo(2, 2);
        p.lineTo(2, 24);
        g.append('path').attr('d', p);
    }

    if (b2 && b3) {
        const p = d3.path();
        p.moveTo(2, 8);
        p.quadraticCurveTo(16, 4, 18, 8);
        p.lineTo(24, 24);
        p.lineTo(8, 18);
        p.quadraticCurveTo(4, 16, 8, 2);
        g.append('path').attr('d', p);
    }

    return g;
}


function createDigitalLB(value) {
    const g = createComponent();

    const b0 = (value & 0x01) != 0;
    const b1 = (value & 0x02) != 0;
    const b2 = (value & 0x04) != 0;
    const b3 = (value & 0x08) != 0;

    if (b0) {
        const p = d3.path();
        p.moveTo(12, 36);
        p.quadraticCurveTo(12, 52, 28, 52);
        g.append('path').attr('d', p);
    }

    if (b1) {
        const p = d3.path();
        p.moveTo(2, 62);
        p.lineTo(24, 40);
        g.append('path').attr('d', p);
    }

    if (b2) {
        const p = d3.path();
        p.moveTo(2, 46);
        p.lineTo(18, 62);
        g.append('path').attr('d', p);
    }

    if (b3) {
        const p = d3.path();
        p.arc(32, 32, 10, Math.PI / 4, Math.PI * 5 / 4, false);
        g.append('path').attr('d', p);
    }

    return g;
}

function createDigitalRT(value) {
    const g = createComponent();

    const b0 = (value & 0x01) != 0;
    const b1 = (value & 0x02) != 0;
    const b2 = (value & 0x04) != 0;
    const b3 = (value & 0x08) != 0;

    if (b0) {
        const p = d3.path();
        p.moveTo(36, 12);
        p.quadraticCurveTo(52, 12, 52, 28);
        g.append('path').attr('d', p);
    }

    if (b1) {
        const p = d3.path();
        p.moveTo(62, 2);
        p.lineTo(40, 24);
        g.append('path').attr('d', p);
    }

    if (b2) {
        const p = d3.path();
        p.moveTo(46, 2);
        p.lineTo(62, 18);
        g.append('path').attr('d', p);
    }

    if (b3) {
        const p = d3.path();
        p.arc(32, 32, 10, Math.PI / 4, Math.PI * 5 / 4, true);
        g.append('path').attr('d', p);
    }

    return g;
}

function createDigitalRB(value) {
    const g = createComponent();

    const b0 = (value & 0x01) != 0;
    const b1 = (value & 0x02) != 0;
    const b2 = (value & 0x04) != 0;
    const b3 = (value & 0x08) != 0;

    if (b0) {
        const p = d3.path();
        p.moveTo(28, 52);
        p.quadraticCurveTo(52, 52, 52, 28);
        g.append('path').attr('d', p);
    }

    if (b1) {
        const p = d3.path();
        p.moveTo(62, 40);
        p.lineTo(40, 62);
        g.append('path').attr('d', p);
    }

    if (b2) {
        const p = d3.path();
        p.moveTo(28, 62);
        p.lineTo(62, 62);
        g.append('path').attr('d', p);
    }

    if (b3) {
        const p = d3.path();
        p.moveTo(62, 28);
        p.lineTo(62, 62);
        g.append('path').attr('d', p);
    }

    return g;
}

function createBottom(value) {
    const g = createComponent();

    const b0 = (value & 0x01) != 0;
    const b1 = (value & 0x02) != 0;
    const b2 = (value & 0x04) != 0;
    const b3 = (value & 0x08) != 0;

    if (value == 0x10) {
        g.append('circle').attr('cx', 8).attr('cy', 68).attr('r', 1);
        g.append('circle').attr('cx', 24).attr('cy', 68).attr('r', 1);
        g.append('circle').attr('cx', 40).attr('cy', 68).attr('r', 1);
        g.append('circle').attr('cx', 56).attr('cy', 68).attr('r', 1);
        return g;
    }

    if (b0) {
        const p = d3.path();
        p.moveTo(8, 68);
        p.lineTo(24, 68);
        g.append('path').attr('d', p);
    }

    if (b1) {
        const p = d3.path();
        p.moveTo(40, 68);
        p.lineTo(56, 68);
        g.append('path').attr('d', p);
    }

    if (b2) {
        const p = d3.path();
        p.moveTo(18, 66);
        p.lineTo(14, 70);
        g.append('path').attr('d', p);
    }

    if (b3) {
        const p = d3.path();
        p.moveTo(46, 66);
        p.lineTo(50, 70);
        g.append('path').attr('d', p);
    }

    return g;
}

function makeCharImpl(svg, value, debug) {
    if (debug)
        boundary(svg);

    let byteArray = [0, 0, 0, 0];

    for (let i = 0; i < 16; i++) {
        const it = i >> 2;
        byteArray[(i - it + 4) % 4] |= ((value & (1 << i)) != 0 ? 1 : 0) << it;
    }

    svg.node().append(createDigitalLT(byteArray[0]).node());
    svg.node().append(createDigitalLB(byteArray[1]).node());
    svg.node().append(createDigitalRT(byteArray[2]).node());
    svg.node().append(createDigitalRB(byteArray[3]).node());
    svg.node().append(createBottom((value >> 16) & 0x1f).node());

    if (debug)
        auxiliaryLine(svg);
}

function makeChar(value, debug) {
    const svg = createSVG();
    makeCharImpl(svg, value, debug);
    return svg;
}
