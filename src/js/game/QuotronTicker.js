import { getMarketData, getCompanyData } from '../helpers/StockMarketHelpers';

export class QuotronTicker {
    constructor(containerId, stockMarket) {
        this.containerId = containerId;
        this.stockMarket = stockMarket;
        this.container = document.getElementById(containerId);
        this.scrollWrapper = null;
        this.tickerContent = null;
        this.animationFrame = null;
        this.tickerSpeed = 2; // pixels per frame
        this.dataInterval = null;
        this.data = [];
        this.isPaused = false;

        if (!this.container) {
            console.error(`QuotronTicker: Container ${containerId} not found`);
            return; // Early return to prevent further initialization
        }

        this.init();
    }

    init() {
        this.scrollWrapper = document.createElement('div');
        this.scrollWrapper.className = 'quotron-scroll-wrapper';
        this.container.appendChild(this.scrollWrapper);

        this.tickerContent = document.createElement('div');
        this.tickerContent.className = 'quotron-ticker-content';
        this.scrollWrapper.appendChild(this.tickerContent);

        this.startDataFetching();
        this.start();
    }

    startDataFetching() {
        this.dataInterval = setInterval(() => {
            if (this.isPaused) return;
            this.fetchMarketData();
        }, 10000); // Fetch new data every 10 seconds
    }

    fetchMarketData() {
        const marketData = getMarketData(this.stockMarket);
        if (!marketData) return;

        this.data = marketData.map(symbol => {
            const company = getCompanyData(this.stockMarket, symbol);
            return {
                symbol,
                name: company ? company.name : 'Unknown',
                price: company ? company.price : 0
            };
        });

        this.update();
    }

    start() {
        if (!this.scrollWrapper || !this.tickerContent) {
            console.error('QuotronTicker: scrollWrapper or tickerContent not initialized');
            return;
        }

        this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    }

    animate() {
        if (!this.scrollWrapper || !this.tickerContent) {
            console.error('QuotronTicker: scrollWrapper or tickerContent not initialized');
            return;
        }

        if (this.isPaused) {
            this.animationFrame = requestAnimationFrame(this.animate.bind(this));
            return;
        }

        const scrollLeft = this.scrollWrapper.scrollLeft;
        const scrollWidth = this.scrollWrapper.scrollWidth;
        const clientWidth = this.scrollWrapper.clientWidth;

        if (scrollLeft + clientWidth >= scrollWidth) {
            this.scrollWrapper.scrollLeft = 0;
        }

        this.scrollWrapper.scrollLeft += this.tickerSpeed;
        this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    }

    update() {
        if (!this.tickerContent) {
            console.error('QuotronTicker: tickerContent not initialized');
            return;
        }

        this.tickerContent.innerHTML = '';
        this.data.forEach(item => {
            const tickerItem = document.createElement('div');
            tickerItem.className = 'quotron-ticker-item';
            tickerItem.innerHTML = `<span class="symbol">${item.symbol}</span> <span class="name">${item.name}</span> <span class="price">$${item.price.toFixed(2)}</span>`;
            this.tickerContent.appendChild(tickerItem);
        });
    }

    pause() {
        this.isPaused = true;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    resume() {
        this.isPaused = false;
        this.start();
    }

    stop() {
        this.pause();
        clearInterval(this.dataInterval);
    }

    reset() {
        this.stop();
        this.data = [];
        this.tickerContent.innerHTML = '';
    }

    destroy() {
        this.reset();
        if (this.scrollWrapper) {
            this.scrollWrapper.remove();
        }
        this.container = null;
        this.scrollWrapper = null;
        this.tickerContent = null;
        this.animationFrame = null;
        this.dataInterval = null;
    }
}