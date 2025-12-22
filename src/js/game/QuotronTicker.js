/**
 * QuotronTicker.js
 * Creates a real-time scrolling ticker display for stock market quotes
 * Inspired by Bloomberg terminals and financial news tickers
 */

export class QuotronTicker {
    constructor(containerId, stockMarket) {
        this.container = document.getElementById(containerId);
        this.stockMarket = stockMarket;
        this.tickerItems = [];
        this.scrollPosition = 0;
        this.animationFrame = null;
        this.isRunning = false;
        
        if (!this.container) {
            console.error(`QuotronTicker: Container ${containerId} not found`);
            return;
        }
        
        this.init();
    }
    
    init() {
        // Create ticker container
        this.container.innerHTML = '';
        this.container.className = 'quotron-ticker-container';
        
        // Create scrolling wrapper
        this.scrollWrapper = document.createElement('div');
        this.scrollWrapper.className = 'quotron-ticker-scroll';
        this.container.appendChild(this.scrollWrapper);
        
        // Create ticker content
        this.tickerContent = document.createElement('div');
        this.tickerContent.className = 'quotron-ticker-content';
        this.scrollWrapper.appendChild(this.tickerContent);
        
        // Initial update
        this.update();
    }
    
    /**
     * Update ticker with latest stock data
     */
    update() {
        if (!this.stockMarket) return;
        
        const recentChanges = this.stockMarket.getRecentChanges(30);
        this.tickerItems = recentChanges;
        
        // Clear and rebuild ticker content
        this.tickerContent.innerHTML = '';
        
        // Create duplicate content for seamless loop
        const createTickerItems = (items) => {
            items.forEach(item => {
                const tickerItem = document.createElement('div');
                tickerItem.className = 'quotron-ticker-item';
                
                const changeClass = item.changePct >= 0 ? 'positive' : 'negative';
                const changeSymbol = item.changePct >= 0 ? '▲' : '▼';
                const changeColor = item.changePct >= 0 ? '#00ff88' : '#ff4444';
                
                tickerItem.innerHTML = `
                    <span class="ticker-ticker">${item.ticker}</span>
                    <span class="ticker-price">$${item.price.toFixed(2)}</span>
                    <span class="ticker-change ${changeClass}" style="color: ${changeColor}">
                        ${changeSymbol} ${Math.abs(item.changePct * 100).toFixed(2)}%
                    </span>
                    <span class="ticker-market">${item.market}</span>
                `;
                
                this.tickerContent.appendChild(tickerItem);
            });
        };
        
        // Add items multiple times for seamless scrolling
        createTickerItems(this.tickerItems);
        createTickerItems(this.tickerItems); // Duplicate for seamless loop
        
        // Reset scroll position if needed
        if (this.scrollPosition >= this.tickerContent.scrollWidth / 2) {
            this.scrollPosition = 0;
        }
    }
    
    /**
     * Start the scrolling animation
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }
    
    /**
     * Stop the scrolling animation
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    /**
     * Animation loop for smooth scrolling
     */
    animate() {
        if (!this.isRunning) return;
        
        this.scrollPosition += 1; // Scroll speed
        
        // Reset position when we've scrolled through one set of items
        if (this.scrollPosition >= this.tickerContent.scrollWidth / 2) {
            this.scrollPosition = 0;
        }
        
        this.scrollWrapper.scrollLeft = this.scrollPosition;
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Update ticker data and restart animation
     */
    refresh() {
        this.update();
        if (!this.isRunning) {
            this.start();
        }
    }
}
