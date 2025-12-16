/**
 * LocationDetailSystem.js
 * Manages detailed interiors for every location
 * Dozens of interactive features per location
 */

export class LocationDetailSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.locationDetails = new Map();
        this.initializeLocations();
    }
    
    /**
     * Initialize all location details
     */
    initializeLocations() {
        // Apartment/Home
        this.locationDetails.set('home', {
            name: 'Your Apartment',
            description: 'A small apartment in the city',
            features: [
                { id: 'bed', name: 'Bed', description: 'Rest to restore energy', action: 'rest', icon: '🛏️' },
                { id: 'desk', name: 'Desk', description: 'Work on personal projects', action: 'work', icon: '🪑' },
                { id: 'computer', name: 'Computer', description: 'Browse job listings, check email', action: 'computer', icon: '💻' },
                { id: 'kitchen', name: 'Kitchen', description: 'Cook meals to save money', action: 'cook', icon: '🍳' },
                { id: 'bathroom', name: 'Bathroom', description: 'Freshen up', action: 'bathroom', icon: '🚿' },
                { id: 'window', name: 'Window', description: 'Look outside at the city', action: 'window', icon: '🪟' },
                { id: 'bookshelf', name: 'Bookshelf', description: 'Read to improve skills', action: 'read', icon: '📚' },
                { id: 'closet', name: 'Closet', description: 'Change clothes', action: 'closet', icon: '👔' },
                { id: 'refrigerator', name: 'Refrigerator', description: 'Check food supplies', action: 'fridge', icon: '❄️' },
                { id: 'tv', name: 'TV', description: 'Watch news and entertainment', action: 'tv', icon: '📺' },
                { id: 'plant', name: 'House Plant', description: 'Water your plant', action: 'plant', icon: '🌱' },
                { id: 'mailbox', name: 'Mailbox', description: 'Check mail', action: 'mail', icon: '📬' },
                { id: 'roommate_door', name: "Roommate's Door", description: 'Talk to your roommate', action: 'roommate', icon: '🚪' },
                { id: 'calendar', name: 'Calendar', description: 'Check your schedule', action: 'calendar', icon: '📅' },
                { id: 'phone', name: 'Phone', description: 'Make calls', action: 'phone', icon: '📱' }
            ]
        });
        
        // Office
        this.locationDetails.set('office', {
            name: 'Your Office',
            description: 'Your workplace',
            features: [
                { id: 'workstation', name: 'Workstation', description: 'Your main work area', action: 'work', icon: '🖥️' },
                { id: 'boss_office', name: "Boss's Office", description: 'Meet with your demanding boss', action: 'boss', icon: '🚪' },
                { id: 'break_room', name: 'Break Room', description: 'Take a break, talk to coworkers', action: 'break', icon: '☕' },
                { id: 'conference_room', name: 'Conference Room', description: 'Attend meetings', action: 'meeting', icon: '👥' },
                { id: 'printer', name: 'Printer', description: 'Print documents', action: 'print', icon: '🖨️' },
                { id: 'filing_cabinet', name: 'Filing Cabinet', description: 'Access company files', action: 'files', icon: '🗄️' },
                { id: 'whiteboard', name: 'Whiteboard', description: 'Plan projects', action: 'plan', icon: '📋' },
                { id: 'coffee_machine', name: 'Coffee Machine', description: 'Get coffee for energy', action: 'coffee', icon: '☕' },
                { id: 'water_cooler', name: 'Water Cooler', description: 'Gossip with coworkers', action: 'gossip', icon: '💧' },
                { id: 'elevator', name: 'Elevator', description: 'Move between floors', action: 'elevator', icon: '🛗' },
                { id: 'reception', name: 'Reception', description: 'Check in visitors', action: 'reception', icon: '📞' },
                { id: 'supply_closet', name: 'Supply Closet', description: 'Get office supplies', action: 'supplies', icon: '📦' },
                { id: 'server_room', name: 'Server Room', description: 'Access company servers', action: 'servers', icon: '🖥️' },
                { id: 'parking', name: 'Parking Lot', description: 'Your parking spot', action: 'parking', icon: '🚗' },
                { id: 'security', name: 'Security Desk', description: 'Check in with security', action: 'security', icon: '🛡️' }
            ]
        });
        
        // Coffee Shop
        this.locationDetails.set('coffee_shop', {
            name: 'Coffee Shop',
            description: 'Local coffee shop',
            features: [
                { id: 'counter', name: 'Counter', description: 'Order coffee and food', action: 'order', icon: '☕' },
                { id: 'table_1', name: 'Table 1', description: 'Sit and work', action: 'work', icon: '🪑' },
                { id: 'table_2', name: 'Table 2', description: 'Sit and work', action: 'work', icon: '🪑' },
                { id: 'table_3', name: 'Table 3', description: 'Sit and work', action: 'work', icon: '🪑' },
                { id: 'barista', name: 'Barista', description: 'Talk to the barista', action: 'talk', icon: '👤' },
                { id: 'wifi', name: 'WiFi', description: 'Connect to free WiFi', action: 'wifi', icon: '📶' },
                { id: 'outlet', name: 'Power Outlet', description: 'Charge your devices', action: 'charge', icon: '🔌' },
                { id: 'bulletin', name: 'Bulletin Board', description: 'Check local postings', action: 'bulletin', icon: '📌' },
                { id: 'bathroom', name: 'Bathroom', description: 'Use restroom', action: 'bathroom', icon: '🚿' },
                { id: 'pastry_case', name: 'Pastry Case', description: 'Browse pastries', action: 'pastry', icon: '🥐' },
                { id: 'newspaper', name: 'Newspaper Stand', description: 'Read local news', action: 'news', icon: '📰' },
                { id: 'trash', name: 'Trash Can', description: 'Dispose of trash', action: 'trash', icon: '🗑️' }
            ]
        });
        
        // University
        this.locationDetails.set('university', {
            name: 'University',
            description: 'Local university campus',
            features: [
                { id: 'library', name: 'Library', description: 'Study and research', action: 'study', icon: '📚' },
                { id: 'classroom', name: 'Classroom', description: 'Attend classes', action: 'class', icon: '🎓' },
                { id: 'professor_office', name: "Professor's Office", description: 'Meet with professors', action: 'professor', icon: '🚪' },
                { id: 'cafeteria', name: 'Cafeteria', description: 'Eat lunch', action: 'eat', icon: '🍽️' },
                { id: 'lab', name: 'Computer Lab', description: 'Use lab computers', action: 'lab', icon: '💻' },
                { id: 'quad', name: 'Quad', description: 'Relax outdoors', action: 'relax', icon: '🌳' },
                { id: 'bookstore', name: 'Bookstore', description: 'Buy textbooks', action: 'shop', icon: '📖' },
                { id: 'gym', name: 'Gym', description: 'Exercise', action: 'exercise', icon: '🏋️' },
                { id: 'student_center', name: 'Student Center', description: 'Meet other students', action: 'socialize', icon: '👥' },
                { id: 'parking', name: 'Parking', description: 'Park your car', action: 'park', icon: '🚗' },
                { id: 'admin', name: 'Administration', description: 'Handle paperwork', action: 'admin', icon: '📋' },
                { id: 'auditorium', name: 'Auditorium', description: 'Attend lectures', action: 'lecture', icon: '🎤' }
            ]
        });
        
        // Bank
        this.locationDetails.set('bank', {
            name: 'City Bank',
            description: 'Local bank branch',
            features: [
                { id: 'teller', name: 'Teller', description: 'Make transactions', action: 'teller', icon: '👤' },
                { id: 'atm', name: 'ATM', description: 'Withdraw cash', action: 'atm', icon: '🏧' },
                { id: 'loan_officer', name: 'Loan Officer', description: 'Apply for loans', action: 'loan', icon: '💰' },
                { id: 'safe_deposit', name: 'Safe Deposit Box', description: 'Access your box', action: 'deposit', icon: '🔒' },
                { id: 'waiting_area', name: 'Waiting Area', description: 'Wait for service', action: 'wait', icon: '🪑' },
                { id: 'brochure_stand', name: 'Brochure Stand', description: 'Read about services', action: 'read', icon: '📄' },
                { id: 'security', name: 'Security Guard', description: 'Talk to security', action: 'security', icon: '🛡️' },
                { id: 'manager', name: "Manager's Office", description: 'Meet with manager', action: 'manager', icon: '🚪' }
            ]
        });
    }
    
    /**
     * Get details for a location
     */
    getLocationDetails(locationId) {
        return this.locationDetails.get(locationId) || null;
    }
    
    /**
     * Get all features for a location
     */
    getLocationFeatures(locationId) {
        const details = this.getLocationDetails(locationId);
        return details ? details.features : [];
    }
    
    /**
     * Interact with a location feature
     */
    interactWithFeature(locationId, featureId) {
        const details = this.getLocationDetails(locationId);
        if (!details) return null;
        
        const feature = details.features.find(f => f.id === featureId);
        if (!feature) return null;
        
        return {
            feature: feature,
            action: feature.action,
            result: this.executeAction(feature.action, locationId, featureId)
        };
    }
    
    /**
     * Execute feature action
     */
    executeAction(action, locationId, featureId) {
        switch (action) {
            case 'rest':
                return { energy: 50, message: 'You rest and restore energy' };
            case 'work':
                return { skill: 1, message: 'You work on improving your skills' };
            case 'computer':
                return { info: true, message: 'You check your computer' };
            case 'cook':
                return { money: -5, energy: 10, message: 'You cook a meal' };
            case 'read':
                return { skill: 2, message: 'You read and learn' };
            case 'coffee':
                return { energy: 20, money: -3, message: 'You get coffee' };
            case 'gossip':
                return { relationship: 1, message: 'You chat with coworkers' };
            case 'boss':
                return { meeting: true, message: 'You meet with your boss' };
            default:
                return { message: 'You interact with ' + featureId };
        }
    }
}

