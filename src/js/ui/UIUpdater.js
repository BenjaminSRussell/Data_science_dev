/**
 * UIUpdater - Updates all UI elements based on game state
 * Phase 2: Now uses LitUIManager for component-based updates
 * Cleanup: Uses centralized utilities
 */

import { RANKS } from '../data/ranks.js';
import { SHOP_ITEMS } from '../data/shopItems.js';
import { LIBRARY_CONTENT, CATEGORIES } from '../game/LibraryDatabase.js';
import { OFFICE_LOCATIONS } from '../data/locations.js';
import { LOCATIONS } from '../game/WorldMap.js';
import { HARDWARE_PARTS, HARDWARE_TYPES } from '../game/HardwareSystems.js';
import { LitUIManager } from './LitUIManager.js';
import { DOMUtils } from '../utils/DOMUtils.js';
import { CommonUtils } from '../utils/CommonUtils.js';
import { EconomySystem } from '../game/EconomySystem.js';
import { GameState } from '../game/GameState.js';
import { insightHint } from '../game/EconomySystem.js';
import { logger } from '../utils/Logger.js';
import { NEWS_CATEGORIES } from '../game/NewsManager.js';

export class UIUpdater {
    /**
     * Icon markup: image paths become <img>, anything else is text. Shop
     * cards printed image paths as text (#1482, #1129)
     */
    static iconHTML(icon, alt = '') {
        if (!icon) return '';
        const safeAlt = String(alt).replace(/"/g, '&quot;');
        return String(icon).startsWith('/')
            ? `<img src="${icon}" alt="${safeAlt}" style="width: 24px; height: 24px; object-fit: contain; object-position: center center;">`
            : icon;
    }

    /**
     * Whether the player's rank meets a library's reqLevel (1-based)
     */
    static libraryRankMet(lib, rankIndex) {
        return (Number(rankIndex) || 0) >= ((Number(lib?.reqLevel) || 1) - 1);
    }

    constructor(game) {
        this.game = game;
        // Phase 2: Use LitUIManager for component-based UI
        this.litUIManager = new LitUIManager(game);
        this.litUIManager.initialize();
    }

    // Helper to get gameState safely
    get gameState() {
        return this.game?.gameState;
    }

    /**
     * Update all UI elements
     */
    updateAllUI() {
        this.updateTopBar();
        this.updateRankProgress();
        this.updateChartTypeGrid();
        this.updateSoftwareDisplay();
        this.updateBankScreen();
    }

    /**
     * Update top bar stats (money / reputation / rank).
     * LitUIManager renders them from the live GameState: into the Lit
     * <top-bar> when it is mounted, otherwise straight into the existing
     * #money-value / #reputation-value / #rank-value markup. The store-backed
     * branches that used to live here could never run (#55, #1638).
     */
    updateTopBar() {
        this.litUIManager?.updateTopBar();
    }

    /**
     * Update rank progress display, same GameState-backed path (#55, #1638)
     */
    updateRankProgress() {
        this.litUIManager?.updateRankProgress();
    }

    /**
     * Update chart type availability in studio
     */
    updateChartTypeGrid() {
        DOMUtils.queryAll('.chart-type-btn').forEach(btn => {
            const type = btn.dataset.type;
            const iconEl = btn.querySelector('.chart-icon');

            if (this.gameState.isChartTypeUnlocked(type)) {
                DOMUtils.toggleClass(btn, 'locked', false);
                if (iconEl) {
                    const src = this.getChartIcon(type);
                    iconEl.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = type;
                    img.width = 24; img.height = 24;
                    img.onerror = () => { iconEl.textContent = type[0]?.toUpperCase() || '?'; };
                    iconEl.appendChild(img);
                }
            } else {
                DOMUtils.toggleClass(btn, 'locked', true);
                if (iconEl) {
                    iconEl.textContent = '';
                }
            }
        });
    }

    /**
     * Get icon for chart type
     */
    getChartIcon(type) {
        // Return icon path instead of emoji
        const iconPaths = {
            bar: '/assets/icons/charts/bar.png',
            line: '/assets/icons/charts/line.png',
            pie: '/assets/icons/charts/pie.png',
            scatter: '/assets/icons/charts/scatter.png',
            doughnut: '/assets/icons/charts/doughnut.png',
            area: '/assets/icons/charts/area.png'
        };
        return iconPaths[type] || '/assets/icons/charts/bar.png';
    }

    /**
     * Update software display in chart studio
     */
    updateSoftwareDisplay() {
        const softwareList = DOMUtils.query('#software-list');
        if (!softwareList) return;

        const purchasedSoftware = SHOP_ITEMS.filter(item => 
            item.type === 'software' && this.gameState.purchasedItems?.includes(item.id)
        );

        if (purchasedSoftware.length === 0) {
            DOMUtils.updateElement(softwareList, {
                innerHTML: '<p class="software-none">No software purchased</p>'
            });
            return;
        }

        const softwareHTML = purchasedSoftware.map(item => {
            // Same table the scoring uses (#1484)
            const bonuses = GameState.describeSoftwareEffects(item.id);

            const iconHTML = UIUpdater.iconHTML(item.icon, item.name);

            return `
                <div class="software-item">
                    <span class="software-icon">${iconHTML}</span>
                    <div class="software-info">
                        <div class="software-name">${item.name}</div>
                        <div class="software-bonuses">${bonuses.join(', ')}</div>
                    </div>
                </div>
            `;
        }).join('');

        DOMUtils.updateElement(softwareList, {
            innerHTML: softwareHTML
        });
    }

    /**
     * Update task display
     */
    updateTaskDisplay() {
        const task = this.gameState.currentTask;
        if (!task) return;

        // Update task description
        if (task.template) {
            DOMUtils.updateElement('#task-content .task-description', {
                textContent: task.template.description || 'Create a visualization for your boss.'
            });
        }

        // Update task requirements
        const requirementsContainer = DOMUtils.query('.task-requirements');
        if (requirementsContainer && task.requirements) {
            const hint = insightHint(this.gameState, task);
            const requirementsHTML = task.requirements.map(req => {
                return `<span class="requirement-tag">${req}</span>`;
            }).join('') + (hint ? `<span class="requirement-tag insight-hint">${hint}</span>` : '');
            DOMUtils.updateElement(requirementsContainer, {
                innerHTML: requirementsHTML
            });
        }

        // Update task reward
        if (task.potentialReward) {
            DOMUtils.updateElement('#task-reward', {
                textContent: EconomySystem.rewardRangeText(task.potentialReward)
            });
        }

        // Update boss info
        if (task.boss) {
            DOMUtils.updateElement('#boss-name', {
                textContent: task.boss.name || 'Mr. Anderson'
            });
            DOMUtils.updateElement('#boss-title', {
                textContent: task.boss.title || 'Department Head'
            });
            // bosses.js defines taskIntro (not greeting) — #2615
            const greeting = task.boss.greeting || task.boss.taskIntro || task.boss.intro;
            if (greeting) {
                const bossDialogue = DOMUtils.query('#boss-dialogue');
                if (bossDialogue) {
                    const p = bossDialogue.querySelector('p');
                    if (p) p.textContent = greeting;
                }
            }
        }

        // Note: TaskSystem.updateBossDialogue() already calls updateDataTable() which sets up sorting/filtering
        // So we don't need to update the table here - it's already done
        // But we can call it again if needed for safety
        if (this.game && this.game.taskSystem && task.data) {
            // Ensure table data is stored for sorting/filtering
            if (!this.game.taskSystem.currentTableData) {
                this.game.taskSystem.currentTableData = JSON.parse(JSON.stringify(task.data));
                this.game.taskSystem.originalTableData = JSON.parse(JSON.stringify(task.data));
                if (typeof this.game.taskSystem.updateDataTable === 'function') {
                    this.game.taskSystem.updateDataTable(task.data);
                }
            }
        } else {
            // Fallback to simple update if TaskSystem not available
            this.updateDataTableSimple(task.data);
        }
    }

    /**
     * Update data table with task data (simple version without sorting/filtering)
     */
    updateDataTableSimple(data) {
        const tableBody = document.querySelector('#data-table tbody');
        const tableHead = document.querySelector('#data-table thead tr');
        if (!tableBody || !data) return;

        // Clear existing rows
        tableBody.innerHTML = '';

        // Handle TaskSystem data format (has columns and rows)
        if (data.columns && data.rows) {
            // Update table headers
            if (tableHead) {
                DOMUtils.updateElement(tableHead, {
                    innerHTML: data.columns.map(col => `<th>${col}</th>`).join('')
                });
            }

            // Add data rows
            data.rows?.forEach(row => {
                const tr = document.createElement('tr');
                row?.forEach((value, i) => {
                    const td = document.createElement('td');
                    if (typeof value === 'number') {
                        // Format numbers with commas and $ if it's likely currency
                        if (i > 0 && (data.columns[i]?.includes('Revenue') || data.columns[i]?.includes('Expenses') || data.columns[i]?.includes('Profit') || data.columns[i]?.includes('Sales'))) {
                            td.textContent = `$${value.toLocaleString()}`;
                        } else {
                            td.textContent = value.toLocaleString();
                        }
                    } else {
                        td.textContent = value;
                    }
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        } else if (Array.isArray(data)) {
            // Array of objects
            data.forEach(row => {
                const tr = document.createElement('tr');
                Object.values(row).forEach(value => {
                    const td = document.createElement('td');
                    td.textContent = typeof value === 'number' ? value.toLocaleString() : value;
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        } else if (data.labels && data.datasets) {
            // Chart.js format - convert to table
            const labels = data.labels;
            const dataset = data.datasets[0];
            labels.forEach((label, i) => {
                const tr = document.createElement('tr');
                const td1 = document.createElement('td');
                td1.textContent = label;
                tr.appendChild(td1);
                
                const td2 = document.createElement('td');
                td2.textContent = dataset.data[i]?.toLocaleString() || '0';
                tr.appendChild(td2);
                tableBody.appendChild(tr);
            });
        }
    }

    /**
     * Update career screen
     */
    updateCareerScreen() {
        const ps = this.gameState.projectSystem;
        if (!ps) return;

        // --- Active Project View --- (every DOM lookup is null-guarded, #1132)
        const activeContainer = document.getElementById('active-project-container');
        const contractsGrid = document.getElementById('contracts-grid');
        if (!activeContainer || !contractsGrid) return;
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        const currentStage = ps.activeProject?.stages?.[ps.activeProject.currentStageIndex];
        if (ps.activeProject && currentStage) {
            activeContainer.classList.remove('hidden');
            contractsGrid.previousElementSibling?.classList.add('hidden'); // Hide AVAILABLE CONTRACTS only
            contractsGrid.classList.add('hidden');

            // Update Active Project UI
            setText('active-project-title', ps.activeProject.title);
            setText('active-project-stage', `Stage ${ps.activeProject.currentStageIndex + 1}/${ps.activeProject.stages.length}`);
            setText('current-stage-name', currentStage.name);
            setText('current-stage-desc', currentStage.description);

            const pct = currentStage.maxProgress > 0
                ? Math.min(100, (ps.activeProject.stageProgress / currentStage.maxProgress) * 100)
                : 0;
            const fill = document.getElementById('project-progress-fill');
            if (fill) fill.style.width = `${pct}%`;

            // Work / abandon buttons
            const workBtn = document.getElementById('btn-work-project');
            if (workBtn) workBtn.onclick = () => this.game.handleWorkOnProject();
            const cancelBtn = document.getElementById('btn-cancel-project');
            if (cancelBtn) cancelBtn.onclick = () => this.game.handleCancelProject?.();

        } else {
            activeContainer.classList.add('hidden');
            contractsGrid.previousElementSibling?.classList.remove('hidden');
            contractsGrid.classList.remove('hidden');

            // Re-evaluate eligibility against current stats/reputation (#1116, #1515)
            ps.refreshContracts?.();

            // --- Available Contracts View ---
            if (!ps.availableContracts || ps.availableContracts.length === 0) {
                contractsGrid.innerHTML = '<div class="no-contracts">No contracts available right now. Improve your skills!</div>';
            } else {
                contractsGrid.innerHTML = ps.availableContracts.map(c => `
                    <div class="contract-card ascii-box">
                        <div class="contract-header">
                            <span class="contract-client">${c.client}</span>
                            <span class="contract-difficulty">${'*'.repeat(c.difficulty)}</span>
                        </div>
                        <h4 class="contract-title">${c.title}</h4>
                        <p class="contract-desc">${c.description}</p>
                        <div class="contract-rewards">
                            <span class="reward-money">$${c.reward.toLocaleString()}</span>
                            <span class="reward-xp">${Object.keys(c.xpReward || {}).join(', ')} XP</span>
                        </div>
                        <button class="btn btn-sm btn-primary btn-accept-contract" 
                                onclick="game.handleStartProject('${c.id}')">
                            Accept Contract
                        </button>
                    </div>
                `).join('');
            }
        }
    }

    /**
     * Update shop screen
     */
    updateShopScreen(category = 'tools') {
        const grid = document.getElementById('shop-grid');
        if (!grid) return;

        const items = SHOP_ITEMS.filter(item => item.category === category);

        const shopHTML = items.map(item => {
            const owned = this.gameState.purchasedItems?.includes(item.id) || false;
            const price = this.game?.economySystem?.getItemPrice?.(item) ?? item.price;
            const canAfford = this.gameState.canAfford?.(price) || false;

            return `
                <div class="shop-item-card ${owned ? 'owned' : ''}" data-id="${item.id}">
                    <div class="shop-item-icon">${UIUpdater.iconHTML(item.icon, item.name)}</div>
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.description}</div>
                    ${owned
                    ? '<div class="shop-item-price">Owned</div>'
                    : `<button class="btn ${canAfford ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                            onclick="game.purchaseItem('${item.id}')"
                            ${!canAfford ? 'disabled' : ''}>
                            $${price.toLocaleString()}
                        </button>`
                }
                </div>
            `;
        }).join('');
        grid.innerHTML = shopHTML;
    }

    /**
     * Announce a rank promotion to assistive technology.
     * Rank promotions are significant progression milestones, so they get a
     * dedicated assertive live region (separate from the polite top-bar region
     * that handles routine money/reputation ticks).
     */
    announceRankPromotion(rank) {
        const el = document.getElementById('rank-announcement');
        if (!el || !rank) return;
        // Clear first so repeated promotions of the same rank are re-announced
        el.textContent = '';
        setTimeout(() => {
            el.textContent = `Promoted to ${rank.title}. Salary now ${rank.salaryMultiplier}x.`;
        }, 50);
    }

    /**
     * Show promotion animation
     */
    showPromotionAnimation(rank) {
        // Create promotion overlay
        const overlay = document.createElement('div');
        overlay.className = 'promotion-overlay';
        overlay.innerHTML = `
            <div class="promotion-content animate-scale-in">
                <div class="promotion-icon"></div>
                <h2>Promotion!</h2>
                <p>You've been promoted to</p>
                <div class="new-rank">${rank.title}</div>
                <p class="salary-bonus">Salary now ${rank.salaryMultiplier}x!</p>
                <button class="btn btn-primary" onclick="this.closest('.promotion-overlay').remove()">
                    Continue
                </button>
            </div>
        `;

        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        document.body.appendChild(overlay);
    }
    updateLibraryScreen(category) {
        const grid = document.getElementById('library-grid');
        if (!grid) return;
        // Called with no argument (e.g. after learning a library) keeps the
        // tab the player was on instead of snapping back to "all" (#1995)
        category = category || this.currentLibraryCategory || 'all';
        this.currentLibraryCategory = category;

        let items = LIBRARY_CONTENT;
        if (category !== 'all') {
            items = items.filter(i => i.category === category);
        }

        // Update tabs
        document.querySelectorAll('.lib-cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat === category);
            btn.onclick = () => this.updateLibraryScreen(btn.dataset.cat);
        });

        const libraryHTML = items.map(lib => {
            const owned = (this.gameState.unlockedLibraries || []).includes(lib.id);
            const canAfford = this.gameState.money >= lib.cost;
            const currentRank = this.gameState.rankIndex || 0;
            const reqMet = UIUpdater.libraryRankMet(lib, currentRank);
            // Say why Learn is disabled (#1271)
            const reqRank = RANKS[Math.max(0, (lib.reqLevel || 1) - 1)];
            const reqText = !owned && !reqMet
                ? `<div class="lib-req">Requires ${reqRank?.title || `rank ${lib.reqLevel}`}</div>`
                : '';

            return `
                <div class="library-card ascii-box ${owned ? 'owned' : ''}">
                    <div class="lib-header">
                        <h4 class="lib-name">${lib.name}</h4>
                        <span class="lib-cat-badge">${CATEGORIES[lib.category] || lib.category}</span>
                    </div>
                    <p class="lib-desc">${lib.description}</p>
                    <div class="lib-effect">
                        <strong>Effect:</strong> ${lib.gameEffect}
                    </div>
                    ${reqText}
                    <div class="lib-footer">
                        <div class="lib-cost">$${lib.cost.toLocaleString()}</div>
                        ${owned
                    ? '<button class="btn btn-sm btn-ghost disabled">Learned</button>'
                    : `<button class="btn btn-sm btn-primary" 
                                      onclick="game.handleLearnLibrary('${lib.id}')" 
                                      ${(!canAfford || !reqMet) ? 'disabled' : ''}>
                                    Learn
                               </button>`
                }
                    </div>
                </div>
            `;
        }).join('');
        grid.innerHTML = libraryHTML;
    }

    /**
     * Update Newspaper Screen
     */
    updateNewspaperScreen() {
        const paper = this.game?.newsManager?.getDailyPaper();
        if (!paper) {
            logger.warn("No paper found!");
            return;
        }

        // Force visibility check (just in case ScreenManager didn't catch it or for debugging)
        const screen = document.getElementById('screen-newspaper');
        if (screen) screen.classList.remove('hidden');

        const dateEl = document.getElementById('paper-date');
        const headlineEl = document.getElementById('paper-headline');
        const storyEl = document.getElementById('paper-story');
        const weatherEl = document.getElementById('paper-weather');
        const horoscopeEl = document.getElementById('paper-horoscope');

        if (dateEl) dateEl.textContent = paper.date;
        // Items carry title/description; fall back to text for old saves (#1365)
        if (headlineEl) {
            headlineEl.textContent = paper.headline?.title || paper.headline?.text || 'Breaking News';
            // Category colour from NEWS_CATEGORIES (#2459)
            headlineEl.style.color = NEWS_CATEGORIES[paper.headline?.category]?.color || '';
        }
        if (storyEl) storyEl.textContent = paper.headline?.description || '...';
        if (weatherEl) weatherEl.textContent = paper.weather || 'Clear';
        if (horoscopeEl) horoscopeEl.textContent = paper.horoscope || 'Stars align.';

        // Side stories
        // Side stories: fill the two slots, blank any slot without an article
        for (let index = 0; index < 2; index++) {
            const article = paper?.articles?.[index];
            const titleEl = document.getElementById(`paper-sub-${index + 1}-title`);
            const textEl = document.getElementById(`paper-sub-${index + 1}-text`);
            if (titleEl) {
                titleEl.textContent = article ? (article.title || article.text || '') : '';
                titleEl.style.color = NEWS_CATEGORIES[article?.category]?.color || '';
            }
            if (textEl) textEl.textContent = article?.description || '';
        }

        // Mark headline and articles as read when newspaper is displayed
        if (paper.headline) {
            this.game?.newsManager?.markAsRead(paper.headline.id);
        }
        paper?.articles?.forEach(article => {
            this.game?.newsManager?.markAsRead(article.id);
        });

        // Update the news badge
        if (this.game?.updateNewsBadge) {
            this.game.updateNewsBadge();
        }

        // Close button is wired once in MainGame.setupEventListeners(); assigning
        // onclick here raced that listener and sent the player to two screens (#2392)
    }

    /**
     * Update Location Layout (Visuals)
     */
    updateLocationLayout(locationId) {
        // Find visual theme
        const theme = OFFICE_LOCATIONS.find(l => l.id === locationId) || OFFICE_LOCATIONS[0];

        // Find map data for activities
        let locationData = null;
        if (this.game && this.game.worldMap) {
            locationData = this.game.worldMap?.getLocation(locationId);
        }
        
        // If no location data, create minimal fallback
        if (!locationData) {
            locationData = {
                id: locationId,
                name: locationId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: 'Welcome!',
                icon: '',
                activities: []
            };
        }

        // Update Background
        const officeBg = document.querySelector('.office-background');
        if (officeBg && theme.background) {
            officeBg.style.background = theme.background;
        }

        // DOM Elements
        const officeBadge = document.querySelector('.office-badge');
        const officeDesk = document.querySelector('.office-desk');
        const officeChair = document.querySelector('.office-chair');
        const officeCharacter = document.querySelector('.office-character');

        const equipmentSection = document.getElementById('office-equipment-section');
        const upgradeSection = document.querySelector('.office-upgrade-section');
        const interactionsSection = document.getElementById('location-interactions');
        const aiSection = document.querySelector('.ai-console-section');

        // Logic: Is this a functional office or a visitable shop?
        // 'home_office', 'startup_office', etc. are offices.
        // 'donut_shop', 'bagel_shop' are shops.
        // Hidden OFFICE_LOCATIONS entries are visitable shops too, whatever
        // their map type (coffee_shop is typed 'social') (#2432)
        const isShop = (locationData && locationData.type === 'shop') ||
            (theme.id === locationId && theme.hidden === true);

        if (isShop) {
            // SHOP MODE: Hide office furniture, show shop interaction

            // 1. Hide Office Visuals
            if (officeDesk) officeDesk.classList.add('hidden');
            if (officeChair) officeChair.classList.add('hidden');
            if (officeCharacter) officeCharacter.classList.add('hidden');
            if (officeBadge) officeBadge.classList.add('hidden'); // Hide "Your Office" badge

            // 2. Hide Office Functional Sections
            if (equipmentSection) equipmentSection.classList.add('hidden');
            if (upgradeSection) upgradeSection.classList.add('hidden');
            if (aiSection) aiSection.classList.add('hidden');

            // 3. Show Shop Interactions
            if (interactionsSection) {
                interactionsSection.classList.remove('hidden');

                // Update Shop Header
                const titleEl = document.getElementById('location-name-title');
                const descEl = document.getElementById('location-desc');
                const avatarEl = document.getElementById('shop-keeper-avatar');

                if (titleEl) titleEl.textContent = locationData.name || 'Location';
                if (descEl) {
                    // Ensure description is not an icon path
                    const desc = locationData.description || '';
                    if (desc && !desc.startsWith('/') && !desc.startsWith('http')) {
                        descEl.textContent = desc;
                    } else {
                        // Fallback description if description is missing or is a path
                        const fallbackDesc = {
                            'donut_shop': 'Sweet treats to boost your mood and energy.',
                            'bagel_shop': 'Hearty bagels for serious work sessions.',
                            'flower_store': 'Fresh flowers. Perfect for gifts.',
                            'coffee_shop': 'Grab coffee, meet people, boost focus.'
                        };
                        descEl.textContent = fallbackDesc[locationId] || 'Welcome!';
                    }
                }
                if (avatarEl) {
                    // Use icon image if it's a path, otherwise use emoji
                    if (locationData.icon && locationData.icon.startsWith('/')) {
                        avatarEl.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = locationData.icon;
                        img.alt = locationData.name;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'contain';
                        img.style.objectPosition = 'center center';
                        img.onerror = () => {
                            avatarEl.textContent = '';
                        };
                        avatarEl.appendChild(img);
                    } else {
                        avatarEl.textContent = locationData.icon || '';
                    }
                }

                // Update shop keeper saying
                const sayingEl = document.getElementById('shop-keeper-saying');
                if (sayingEl) {
                    const sayings = {
                        'donut_shop': 'Fresh donuts!',
                        'bagel_shop': 'Hearty bagels for serious work sessions!',
                        'flower_store': 'Beautiful flowers for any occasion!',
                        'coffee_shop': 'Best coffee in town!'
                    };
                    sayingEl.textContent = sayings[locationId] || 'Welcome!';
                }

                // Populate Interaction Buttons
                const grid = document.getElementById('interaction-grid');
                if (grid) {
                    grid.innerHTML = (locationData.activities || []).map(activity => {
                        return `
                            <button class="btn btn-secondary location-action-btn" onclick="game.handleLocationAction('${activity}')">
                                ${this.getActivityName(activity)}
                            </button>
                        `;
                    }).join('');
                }
            }
        } else {
            // OFFICE MODE: Show furniture, hide shop interactions

            // 1. Show Office Visuals
            if (officeDesk) officeDesk.classList.remove('hidden');
            if (officeChair) officeChair.classList.remove('hidden');
            if (officeCharacter) officeCharacter.classList.remove('hidden');

            // Update and Show Badge
            if (officeBadge) {
                officeBadge.classList.remove('hidden');
                const badgeName = document.getElementById('current-office-name');
                if (badgeName) badgeName.textContent = theme.name;
            }

            // 2. Show Office Functional Sections
            if (equipmentSection) equipmentSection.classList.remove('hidden');
            if (upgradeSection) upgradeSection.classList.remove('hidden');
            if (aiSection) aiSection.classList.remove('hidden');

            if (interactionsSection) interactionsSection.classList.add('hidden');

            // Update Equipment Grid
            this.updateOfficeEquipment();
        }
    }

    /**
     * Update Office Equipment Grid
     */
    updateOfficeEquipment() {
        const grid = document.getElementById('equipment-grid');
        if (!grid || !this.gameState.hardwareManager) return;

        const hm = this.gameState.hardwareManager;
        const equipped = hm.equippedParts;

        // Map through hardware types to show current status and upgrade options
        const types = [HARDWARE_TYPES.COOLING, HARDWARE_TYPES.CASE, HARDWARE_TYPES.MONITOR, HARDWARE_TYPES.GPU];

        const equipmentHTML = types.map(type => {
            const currentPartId = equipped[type];
            const partList = HARDWARE_PARTS[type];
            const currentPart = partList.find(p => p.id === currentPartId) || partList[0];
            const owned = hm.ownedParts[type] || [];

            // Next upgrade: the first part not owned yet. Locked parts show
            // their rank requirement instead of a buy button (#991)
            const nextPart = partList.find(p => !owned.includes(p.id));
            const nextUnlocked = nextPart && (hm.isUnlocked?.(nextPart) ?? true);
            const nextRank = nextPart ? Math.min(nextPart.unlockRank || 0, RANKS.length - 1) : 0;

            // Owned parts can be re-equipped (#1331)
            const equipSelect = owned.length > 1
                ? `<select class="equipment-equip-select" aria-label="Equip ${this.getHardwareName(type)}"
                        onchange="game.handleEquipHardware('${type}', this.value)">
                        ${owned.map(id => {
                            const p = partList.find(x => x.id === id);
                            return `<option value="${id}" ${id === currentPartId ? 'selected' : ''}>${p?.name || id}</option>`;
                        }).join('')}
                   </select>`
                : '';

            return `
                <div class="equipment-card" data-type="${type}">
                    <div class="equipment-icon">${this.getHardwareIcon(type)}</div>
                    <div class="equipment-name">${this.getHardwareName(type)}</div>
                    <div class="equipment-level">${currentPart.name}</div>
                    
                    ${this.renderPartStats(currentPart)}
                    ${equipSelect}

                    ${!nextPart
                    ? `<button class="equipment-upgrade-btn" disabled>Maxed Out</button>`
                    : nextUnlocked
                        ? `<button class="equipment-upgrade-btn" onclick="game.handleBuyHardware('${type}', '${nextPart.id}')">
                             Upgrade: ${nextPart.name} ($${nextPart.price.toLocaleString()})
                           </button>`
                        : `<button class="equipment-upgrade-btn" disabled>
                             ${nextPart.name}: requires ${RANKS[nextRank]?.title || `rank ${nextRank + 1}`}
                           </button>`
                }
                </div>
            `;
        }).join('');
        grid.innerHTML = equipmentHTML;
    }

    getHardwareIcon(type) {
        // Text glyphs; the old table had an empty string for every type (#1333)
        const icons = {
            [HARDWARE_TYPES.COOLING]: '≋',
            [HARDWARE_TYPES.CASE]: '▣',
            [HARDWARE_TYPES.MONITOR]: '▭',
            [HARDWARE_TYPES.GPU]: '▦',
            [HARDWARE_TYPES.CPU]: '▤',
            [HARDWARE_TYPES.RAM]: '≡',
            [HARDWARE_TYPES.STORAGE]: '◫'
        };
        return icons[type] || '';
    }

    getHardwareName(type) {
        // Acronyms stay upper case: "GPU", not "Gpu" (#1485)
        const acronyms = { gpu: 'GPU', cpu: 'CPU', ram: 'RAM' };
        const t = String(type || '');
        return acronyms[t.toLowerCase()] || (t.charAt(0).toUpperCase() + t.slice(1));
    }

    renderPartStats(part) {
        if (!part?.stats) return '';
        const s = part.stats;
        const text = [];
        const has = (k) => Object.prototype.hasOwnProperty.call(s, k) && s[k] != null;
        if (has('cooling')) text.push(`Cooling: +${s.cooling}`);
        if (has('noise')) text.push(`Noise: ${s.noise}dB`);
        if (has('compute')) text.push(`Compute: ${s.compute} TFLOPS`);
        if (has('vram')) text.push(`VRAM: ${s.vram}GB`); // include vram: 0
        if (has('resolution')) text.push(`Res: Level ${s.resolution}`);
        if (has('refresh_rate')) text.push(`${s.refresh_rate}Hz`);
        if (has('productivity')) text.push(`Prod: x${s.productivity}`);
        if (has('reliability')) text.push(`Rel: x${s.reliability}`);
        if (has('power_draw')) text.push(`${s.power_draw}W`);
        // Case hardware
        if (has('aesthetics')) text.push(`Aesthetics: ${s.aesthetics}`);
        if (has('airflow')) text.push(`Airflow: ${s.airflow}`);
        if (has('noise_dampening')) text.push(`Dampening: ${s.noise_dampening}`);
        if (has('style')) text.push(`Style: +${s.style}`);

        return text.length ? `<div class="equipment-bonus">${text.join(', ')}</div>` : '';
    }

    getActivityName(activity) {
        const names = {
            'buy_donut': 'Buy Donut ($5)',
            'eat_donut': 'Eat Donut',
            'buy_coffee': 'Buy Coffee ($4)',
            'buy_bagel': 'Buy Bagel ($6)',
            'eat_bagel': 'Eat Bagel',
            'coffee_network': 'Network over Coffee',
            'buy_flowers': 'Buy Flowers ($15)',
            'buy_plant': 'Buy Office Plant ($25)',
            'browse_cars': 'Browse Vehicles',
            'buy_car': 'Buy Vehicle',
            'sell_car': 'Sell Vehicle'
        };
        return names[activity] || activity;
    }

    /**
     * Update Bank Screen
     */
    updateBankScreen() {
        if (!this.gameState.bank) return;

        // Elements
        const savingsEl = document.getElementById('bank-savings-balance');
        const loanEl = document.getElementById('bank-loan-balance');
        const creditScoreEl = document.getElementById('bank-credit-score');
        const loanLimitEl = document.getElementById('bank-loan-limit');
        const netWorthEl = document.getElementById('bank-net-worth');

        const savings = this.gameState.bank?.savings || 0;
        const loan = this.gameState.bank?.loan || 0;
        const creditScore = this.gameState.bank?.creditScore || 500;

        // Use the enforced formula, and show the remaining room (#1691, #938)
        const bankSystem = this.game?.bankSystem || this.gameState.bankSystem;
        let available;
        if (bankSystem?.getAvailableCredit) {
            available = bankSystem.getAvailableCredit();
        } else {
            const limit = 1000 + ((this.gameState.reputation || 0) * 100);
            available = Math.max(0, Math.floor(limit * (creditScore / 500)) - loan);
        }

        const netWorth = (this.gameState.money || 0) + savings - loan;

        if (savingsEl) savingsEl.textContent = `$${savings.toLocaleString()}`;
        if (loanEl) loanEl.textContent = `$${loan.toLocaleString()}`;
        if (creditScoreEl) creditScoreEl.textContent = creditScore;
        if (loanLimitEl) loanLimitEl.textContent = `$${available.toLocaleString()}`;
        if (netWorthEl) netWorthEl.textContent = `$${netWorth.toLocaleString()}`;

        this.renderBankTransactions();
    }

    /**
     * Show the recorded bank transaction history (#1383)
     */
    renderBankTransactions() {
        const list = document.getElementById('bank-transactions');
        if (!list) return;
        const history = this.gameState.bank?.transactionHistory || [];
        list.textContent = '';
        if (history.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'bank-transaction-empty';
            empty.textContent = 'No transactions yet.';
            list.appendChild(empty);
            return;
        }
        history.slice(0, 20).forEach(tx => {
            const row = document.createElement('div');
            row.className = 'bank-transaction';
            row.style.cssText = 'display:flex;justify-content:space-between;gap:0.5rem;padding:2px 0;border-bottom:1px dotted #333;';
            const amount = Number(tx.amount) || 0;
            const when = tx.day ? `Day ${tx.day}` : '';
            const cells = [when, tx.type, `${amount >= 0 ? '+' : '-'}$${Math.abs(amount).toLocaleString()}`];
            cells.forEach(text => {
                const span = document.createElement('span');
                span.textContent = text;
                row.appendChild(span);
            });
            list.appendChild(row);
        });
    }

    /**
     * Update the heat meter on the stock market and jail screens
     */
    updateHeatMeter() {
        const crime = this.gameState?.crimeSystem;
        const heat = Math.max(0, Math.min(100, Math.floor(crime?.heat || 0)));

        const heatValue = document.getElementById('heat-value');
        if (heatValue) heatValue.textContent = heat;

        const bar = document.getElementById('heat-meter-bar');
        if (bar) bar.setAttribute('aria-valuenow', String(heat));

        const fill = document.getElementById('heat-meter-fill');
        if (fill) fill.style.width = `${heat}%`;

        const investigation = document.getElementById('heat-investigation');
        if (investigation) investigation.classList.toggle('hidden', !crime?.isUnderInvestigation);

        const jailHeat = document.getElementById('jail-heat-value');
        if (jailHeat) jailHeat.textContent = heat;
    }
}
