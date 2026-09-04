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
import { useGameStore } from '../store/gameStore.js';
import { DOMUtils } from '../utils/DOMUtils.js';
import { CommonUtils } from '../utils/CommonUtils.js';
import { logger } from '../utils/Logger.js';

export class UIUpdater {
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
     * Update top bar stats
     * Phase 2: Uses LitUIManager (with fallback to DOM)
     * Phase 4: Uses Zustand store
     */
    updateTopBar() {
        // Phase 4: Get state from Zustand store
        const gameStore = this.game?.gameStore || useGameStore;
        const state = gameStore.getState();
        
        // Try Lit component first
        if (this.litUIManager) {
            this.litUIManager.updateTopBar();
        } else {
            // Fallback to DOM manipulation (using DOMUtils)
            DOMUtils.updateElement('#money-value', {
                textContent: CommonUtils.formatCurrency(state.money ?? 0)
            });
            DOMUtils.updateElement('#reputation-value', {
                textContent: CommonUtils.formatNumber(state.reputation ?? 0)
            });
            if (state.currentRank) {
                DOMUtils.updateElement('#rank-value', {
                    textContent: state.currentRank.title
                });
            }
        }
    }


    /**
     * Update rank progress display
     * Phase 2: Uses LitUIManager (with fallback to DOM)
     * Phase 4: Uses Zustand store
     */
    updateRankProgress() {
        // Phase 4: Get state from Zustand store
        const gameStore = this.game?.gameStore || useGameStore;
        const state = gameStore.getState();
        
        // Try Lit component first
        if (this.litUIManager) {
            this.litUIManager.updateRankProgress();
        } else {
            // Fallback to DOM manipulation
            const currentRankEl = document.getElementById('current-rank');
            const progressEl = document.getElementById('rank-progress');
            const nextRankEl = document.querySelector('.next-rank');

            if (currentRankEl && state.currentRank) {
                currentRankEl.textContent = state.currentRank.title || 'None';
            }

            if (progressEl) {
                progressEl.style.width = `${state.progressToNextRank || 0}%`;
            }

            if (nextRankEl) {
                if (state.nextRank) {
                    nextRankEl.textContent = `Next: ${state.nextRank.title}`;
                } else {
                    nextRankEl.textContent = 'Max Rank Achieved!';
                }
            }
        }
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
                    iconEl.textContent = this.getChartIcon(type);
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

        const multipliers = this.gameState.getSoftwareQualityMultiplier?.() || {};
        
        const softwareHTML = purchasedSoftware.map(item => {
            const bonuses = [];
            if (item.id === 'soft_ide_pro') {
                bonuses.push('+5% Visual Clarity', '+3% Data Accuracy');
            } else if (item.id === 'soft_automl') {
                bonuses.push('+10% Speed', '+3% Chart Appropriateness');
            } else if (item.id === 'soft_cloud_basic') {
                bonuses.push('+5% Data Accuracy', '+5% Speed');
            } else if (item.id === 'soft_enterprise_db') {
                bonuses.push('+8% Data Accuracy', '+2% Chart Appropriateness');
            } else if (item.id === 'soft_neural_arch') {
                bonuses.push('+10% Visual Clarity', '+8% Chart Appropriateness', '+5% Data Accuracy');
            }

            const iconHTML = item.icon && item.icon.startsWith('/') 
                ? `<img src="${item.icon}" alt="${item.name}" style="width: 24px; height: 24px; object-fit: contain; object-position: center center;">` 
                : item.icon;

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
            const requirementsHTML = task.requirements.map(req => {
                return `<span class="requirement-tag">${req}</span>`;
            }).join('');
            DOMUtils.updateElement(requirementsContainer, {
                innerHTML: requirementsHTML
            });
        }

        // Update task reward
        if (task.potentialReward) {
            DOMUtils.updateElement('#task-reward', {
                textContent: CommonUtils.formatCurrency(task.potentialReward)
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
            if (task.boss.greeting) {
                const bossDialogue = DOMUtils.query('#boss-dialogue');
                if (bossDialogue) {
                    const p = bossDialogue.querySelector('p');
                    if (p) p.textContent = task.boss.greeting;
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

        // --- Active Project View ---
        const activeContainer = document.getElementById('active-project-container');
        const contractsGrid = document.getElementById('contracts-grid');

        if (ps.activeProject) {
            activeContainer.classList.remove('hidden');
            contractsGrid.parentElement.querySelector('h3').classList.add('hidden'); // Hide "Available Contracts" header
            contractsGrid.classList.add('hidden');

            // Update Active Project UI
            document.getElementById('active-project-title').textContent = ps.activeProject.title;
            const currentStage = ps.activeProject.stages[ps.activeProject.currentStageIndex];

            document.getElementById('active-project-stage').textContent = `Stage ${ps.activeProject.currentStageIndex + 1}/${ps.activeProject.stages.length}`;
            document.getElementById('current-stage-name').textContent = currentStage.name;
            document.getElementById('current-stage-desc').textContent = currentStage.description;

            const pct = (ps.activeProject.stageProgress / currentStage.maxProgress) * 100;
            document.getElementById('project-progress-fill').style.width = `${pct}%`;

            // Work Button State
            const workBtn = document.getElementById('btn-work-project');
            workBtn.onclick = () => {
                // Call main game work handler
                game.handleWorkOnProject();
            };

        } else {
            activeContainer.classList.add('hidden');
            contractsGrid.parentElement.querySelector('h3').classList.remove('hidden');
            contractsGrid.classList.remove('hidden');

            // --- Available Contracts View ---
            if (ps.availableContracts.length === 0) {
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
                            <span class="reward-money">$${c.reward}</span>
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
            const canAfford = this.gameState.canAfford?.(item.price) || false;

            return `
                <div class="shop-item-card ${owned ? 'owned' : ''}" data-id="${item.id}">
                    <div class="shop-item-icon">${item.icon}</div>
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.description}</div>
                    ${owned
                    ? '<div class="shop-item-price">Owned</div>'
                    : `<button class="btn ${canAfford ? 'btn-primary' : 'btn-secondary'} btn-sm" 
                            onclick="game.purchaseItem('${item.id}')"
                            ${!canAfford ? 'disabled' : ''}>
                            $${item.price.toLocaleString()}
                        </button>`
                }
                </div>
            `;
        }).join('');
        grid.innerHTML = shopHTML;
    }

    /**
     * Animate money change
     */
    animateMoneyChange(amount) {
        const moneyEl = document.getElementById('money-value');
        if (!moneyEl) return;

        moneyEl.classList.add('counter-animate', 'counting');

        setTimeout(() => {
            moneyEl.classList.remove('counting');
        }, 300);
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
    updateLibraryScreen(category = 'all') {
        const grid = document.getElementById('library-grid');
        if (!grid) return;

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
            const reqMet = currentRank >= (lib.reqLevel - 1);

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
                    <div class="lib-footer">
                        <div class="lib-cost">$${lib.cost}</div>
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
        grid.innerHTML = libraryHTML;
    }

    /**
     * Update Newspaper Screen
     */
    updateNewspaperScreen() {
        const paper = this.game?.newsManager?.getDailyPaper();
        if (!paper) {
            console.warn("No paper found!");
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
        if (headlineEl) headlineEl.textContent = paper.headline?.title || 'Breaking News';
        if (storyEl) storyEl.textContent = paper.headline?.description || '...';
        if (weatherEl) weatherEl.textContent = paper.weather || 'Clear';
        if (horoscopeEl) horoscopeEl.textContent = paper.horoscope || 'Stars align.';

        // Side stories
        paper?.articles?.forEach((article, index) => {
            const titleEl = document.getElementById(`paper-sub-${index + 1}-title`);
            const textEl = document.getElementById(`paper-sub-${index + 1}-text`);
            if (titleEl) titleEl.textContent = article.title;
            if (textEl) textEl.textContent = article.description;
        });

        // Close button
        const closeBtn = document.getElementById('btn-close-paper');
        if (closeBtn) {
            closeBtn.onclick = () => {
                this.game.screenManager.showScreen('screen-office'); // Or previous screen
            };
        }
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
        const isShop = locationData && locationData.type === 'shop';

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

            // Find next upgrade (first unowned part with higher rank)
            const nextPart = partList.find(p => !hm.ownedParts[type].includes(p.id) && p.unlockRank <= (this.gameState.currentRank?.level || 0) + 2);
            // Limit upgrades shown to slightly above rank

            return `
                <div class="equipment-card" data-type="${type}">
                    <div class="equipment-icon">${this.getHardwareIcon(type)}</div>
                    <div class="equipment-name">${this.getHardwareName(type)}</div>
                    <div class="equipment-level">${currentPart.name}</div>
                    
                    ${this.renderPartStats(currentPart)}

                    ${nextPart
                    ? `<button class="equipment-upgrade-btn" onclick="game.handleBuyHardware('${type}', '${nextPart.id}')">
                             Upgrade: ${nextPart.name} ($${nextPart.price})
                           </button>`
                    : `<button class="equipment-upgrade-btn" disabled>Maxed Out</button>`
                }
                </div>
            `;
        }).join('');
        grid.innerHTML = equipmentHTML;
    }

    getHardwareIcon(type) {
        const icons = {
            [HARDWARE_TYPES.COOLING]: '',
            [HARDWARE_TYPES.CASE]: '',
            [HARDWARE_TYPES.MONITOR]: '',
            [HARDWARE_TYPES.GPU]: '',
            [HARDWARE_TYPES.CPU]: '',
            [HARDWARE_TYPES.RAM]: '',
            [HARDWARE_TYPES.STORAGE]: ''
        };
        return icons[type] || '';
    }

    getHardwareName(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    renderPartStats(part) {
        let text = [];
        if (part.stats.cooling) text.push(`Cooling: +${part.stats.cooling}`);
        if (part.stats.noise) text.push(`Noise: ${part.stats.noise}dB`);
        if (part.stats.compute) text.push(`Compute: ${part.stats.compute} TFLOPS`);
        if (part.stats.vram) text.push(`VRAM: ${part.stats.vram}GB`);
        if (part.stats.resolution) text.push(`Res: Level ${part.stats.resolution}`);

        return `<div class="equipment-bonus">${text.join(', ')}</div>`;
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
            'buy_plant': 'Buy Office Plant ($25)'
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

        // Calculate dynamic loan limit
        const limit = 1000 + (this.gameState.reputation * 100);
        const creditMultiplier = creditScore / 500;
        const maxLoan = Math.floor(limit * creditMultiplier);

        const netWorth = this.gameState.money + savings - loan;

        if (savingsEl) savingsEl.textContent = `$${savings.toLocaleString()}`;
        if (loanEl) loanEl.textContent = `$${loan.toLocaleString()}`;
        if (creditScoreEl) creditScoreEl.textContent = creditScore;
        if (loanLimitEl) loanLimitEl.textContent = `$${Math.max(0, maxLoan - loan).toLocaleString()}`;
        if (netWorthEl) netWorthEl.textContent = `$${netWorth.toLocaleString()}`;
    }
}
