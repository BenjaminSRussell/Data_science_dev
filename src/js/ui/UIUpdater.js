class UIUpdater {
    constructor(game) {
        this.game = game;
    }

    // ... [rest of the class remains unchanged] ...

    updateShopScreen() {
        // ... [rest of the method remains unchanged] ...

        // Update shop items with formatted prices
        const shopItemsEl = document.getElementById('shop-items');
        if (shopItemsEl) {
            shopItemsEl.innerHTML = this.gameState.shop.items.map(item => {
                return `
                    <div class="shop-item">
                        <img src="${item.icon}" alt="${item.name}">
                        <div class="shop-item-name">${item.name}</div>
                        <button class="shop-item-buy-btn" onclick="game.buyShopItem('${item.id}')">
                            Buy for $${item.price.toLocaleString()}
                        </button>
                    </div>
                `;
            }).join('');
        }

        // ... [rest of the method remains unchanged] ...
    }

    // ... [rest of the class remains unchanged] ...

    updateLibraryScreen() {
        // ... [rest of the method remains unchanged] ...

        // Update library with formatted costs
        const libraryItemsEl = document.getElementById('library-items');
        if (libraryItemsEl) {
            libraryItemsEl.innerHTML = this.gameState.library.items.map(lib => {
                return `
                    <div class="library-item">
                        <div class="library-item-name">${lib.name}</div>
                        <div class="library-item-cost">Cost: $${lib.cost.toLocaleString()}</div>
                        <button class="library-item-unlock-btn" onclick="game.unlockLibraryItem('${lib.id}')">
                            Unlock
                        </button>
                    </div>
                `;
            }).join('');
        }

        // ... [rest of the method remains unchanged] ...
    }

    // ... [rest of the class remains unchanged] ...

    updateCareerScreen() {
        // ... [rest of the method remains unchanged] ...

        // Update contracts with formatted rewards
        const contractsEl = document.getElementById('contracts');
        if (contractsEl) {
            contractsEl.innerHTML = this.gameState.career.contracts.map(c => {
                return `
                    <div class="contract">
                        <div class="contract-name">${c.name}</div>
                        <div class="contract-reward">Reward: $${c.reward.toLocaleString()}</div>
                        <button class="contract-accept-btn" onclick="game.acceptContract('${c.id}')">
                            Accept
                        </button>
                    </div>
                `;
            }).join('');
        }

        // ... [rest of the method remains unchanged] ...
    }

    // ... [rest of the class remains unchanged] ...
}