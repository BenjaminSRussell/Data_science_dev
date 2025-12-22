/**
 * LocationViewComponent.js
 * Location view component using Lit
 * Phase 2: Replaces DOM manipulation in LocationView
 */

import { BaseComponent } from './BaseComponent.js';
import { html, css } from 'lit';

export class LocationViewComponent extends BaseComponent {
    static properties = {
        locationId: { type: String },
        locationDetails: { type: Object },
        timeOfDay: { type: String },
        backgroundImage: { type: String }
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }

        .location-background {
            position: relative;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }

        .location-content {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.7);
            padding: 16px;
            border-radius: 8px;
            color: white;
        }

        .location-title {
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: 700;
        }

        .location-description {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
        }

        .location-features {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }

        .location-feature {
            position: absolute;
            width: 64px;
            height: 64px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            pointer-events: all;
            transition: transform 0.2s;
        }

        .location-feature:hover {
            transform: scale(1.1);
        }

        .character-container {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }
    `;

    constructor() {
        super();
        this.locationId = '';
        this.locationDetails = null;
        this.timeOfDay = 'noon';
        this.backgroundImage = '';
    }

    render() {
        if (!this.locationDetails) {
            return html`<div>Loading location...</div>`;
        }

        const backgroundStyle = this.backgroundImage 
            ? `background-image: url('${this.backgroundImage}');`
            : '';

        return html`
            <div class="location-background ${this.locationId} time-${this.timeOfDay}" 
                 style="${backgroundStyle}">
                <div class="location-content">
                    <h2 class="location-title">${this.locationDetails.name}</h2>
                    <p class="location-description">${this.locationDetails.description}</p>
                </div>
                <div class="location-features">
                    ${this.renderFeatures()}
                </div>
                <div class="character-container" id="location-characters"></div>
            </div>
        `;
    }

    renderFeatures() {
        if (!this.locationDetails?.features) return html``;

        return this.locationDetails.features.map((feature, index) => {
            const left = 20 + (index % 5) * 15;
            const top = 30 + Math.floor(index / 5) * 20;

            return html`
                <div class="location-feature" 
                     style="left: ${left}%; top: ${top}%;"
                     @click=${() => this.handleFeatureClick(feature)}>
                    ${feature.icon && feature.icon.startsWith('/')
                        ? html`<img src="${feature.icon}" alt="${feature.name}" style="width: 32px; height: 32px;">`
                        : html`<span style="font-size: 32px;">${feature.icon || ''}</span>`
                    }
                </div>
            `;
        });
    }

    handleFeatureClick(feature) {
        this.dispatchGameEvent('feature-click', { feature });
    }

    /**
     * Update location
     */
    updateLocation(locationId, locationDetails, backgroundImage, timeOfDay) {
        this.locationId = locationId;
        this.locationDetails = locationDetails;
        this.backgroundImage = backgroundImage || '';
        this.timeOfDay = timeOfDay || 'noon';
    }
}

customElements.define('location-view-component', LocationViewComponent);
