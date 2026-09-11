const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '../assets/css/portal.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../mysystem.html'), 'utf8');

console.log('=== VERIFYING MOBILE SYSTEM DETAIL HEADER ===');

// Check HTML structure
const topbarMatch = html.match(/<div class="system-detail-topbar">([\s\S]*?)<\/div>\s*<!-- Layout:/);
if (!topbarMatch) {
    console.error('FAIL: topbar structure not found in HTML');
} else {
    console.log('PASS: Found topbar in HTML');
    const content = topbarMatch[1];
    console.log('- Has back button:', content.includes('id="backToSystemsBtn"'));
    console.log('- Has SVG icon:', content.includes('<svg'));
    console.log('- Has back text span:', content.includes('class="btn-back-text"'));
    console.log('- Has title row:', content.includes('class="system-detail-title-row"'));
    console.log('- Has model title (Home Primary):', content.includes('id="detailModelTitle"'));
    console.log('- Has capacity pill (5.4 kW):', content.includes('id="detailCapacityPill"'));
    console.log('- Has account meta:', content.includes('id="detailAccountMeta"'));
}

// Check CSS rules for mobile system-detail-topbar
const mobileSection = css.match(/@media \(max-width: 768px\) \{([\s\S]*?)(?=@media|\Z)/);
if (!mobileSection) {
    console.error('FAIL: @media (max-width: 768px) block not found');
} else {
    const mobileCss = mobileSection[1];
    
    // Check .system-detail-topbar
    const topbarCssMatch = mobileCss.match(/\.system-detail-topbar\s*\{([^}]+)\}/);
    if (topbarCssMatch) {
        const rules = topbarCssMatch[1];
        console.log('\n.system-detail-topbar mobile rules:');
        console.log('- flex-direction:', rules.includes('flex-direction: row'));
        console.log('- align-items:', rules.includes('align-items: center'));
        console.log('- gap: 12px:', rules.includes('gap: 12px'));
        console.log('- horizontal padding 16px:', rules.includes('16px 16px'));
        console.log('- no box-shadow:', rules.includes('box-shadow: none'));
    }

    // Check .btn-back-systems
    const backBtnMatch = mobileCss.match(/\.btn-back-systems\s*\{([^}]+)\}/);
    if (backBtnMatch) {
        const rules = backBtnMatch[1];
        console.log('\n.btn-back-systems mobile rules:');
        console.log('- width 40px:', rules.includes('width: 40px'));
        console.log('- height 40px:', rules.includes('height: 40px'));
        console.log('- border-radius 50%:', rules.includes('border-radius: 50%'));
        console.log('- display inline-flex / center:', rules.includes('align-items: center') && rules.includes('justify-content: center'));
    }

    // Check .btn-back-systems .btn-back-text
    const backTextMatch = mobileCss.match(/\.btn-back-systems \.btn-back-text\s*\{([^}]+)\}/);
    console.log('\n.btn-back-systems .btn-back-text hidden:', !!backTextMatch && backTextMatch[1].includes('display: none'));

    // Check .system-detail-title
    const titleMatch = mobileCss.match(/\.system-detail-title\s*\{([^}]+)\}/);
    if (titleMatch) {
        const rules = titleMatch[1];
        console.log('\n.system-detail-title mobile rules:');
        console.log('- font-size 18px:', rules.includes('font-size: 18px'));
        console.log('- font-weight 600 (semibold):', rules.includes('font-weight: 600'));
        console.log('- color navy:', rules.includes('color: var(--navy)'));
        console.log('- word-break / wrap:', rules.includes('word-break: break-word'));
    }

    // Check .system-detail-title-row
    const titleRowMatch = mobileCss.match(/\.system-detail-title-row\s*\{([^}]+)\}/);
    if (titleRowMatch) {
        const rules = titleRowMatch[1];
        console.log('\n.system-detail-title-row mobile rules:');
        console.log('- display flex:', rules.includes('display: flex'));
        console.log('- gap 8px:', rules.includes('gap: 8px'));
        console.log('- flex-wrap: wrap:', rules.includes('flex-wrap: wrap'));
    }

    // Check .system-detail-title-block .system-card-capacity-pill
    const pillMatch = mobileCss.match(/\.system-detail-title-block \.system-card-capacity-pill\s*\{([^}]+)\}/);
    if (pillMatch) {
        const rules = pillMatch[1];
        console.log('\nCapacity pill mobile rules:');
        console.log('- align-self center:', rules.includes('align-self: center'));
        console.log('- orange background / color:', rules.includes('#fff7ed') && rules.includes('var(--solar-orange-dark)'));
    }

    // Check .system-detail-account-meta
    const metaMatch = mobileCss.match(/\.system-detail-account-meta\s*\{([^}]+)\}/);
    if (metaMatch) {
        const rules = metaMatch[1];
        console.log('\n.system-detail-account-meta mobile rules:');
        console.log('- font-size 13px:', rules.includes('font-size: 13px'));
        console.log('- muted color:', rules.includes('var(--gray-500)'));
        console.log('- word-break / wrap:', rules.includes('word-break: break-word'));
    }
}

// Check desktop rules are intact
const desktopTopbar = css.match(/\.system-detail-topbar\s*\{([^}]+)\}/);
console.log('\nDesktop .system-detail-topbar intact:', !!desktopTopbar && desktopTopbar[1].includes('justify-content: space-between'));

const desktopTitleRow = css.match(/\.system-detail-title-row\s*\{([^}]+)\}/);
console.log('Desktop .system-detail-title-row intact (display: contents):', !!desktopTitleRow && desktopTitleRow[1].includes('display: contents'));
