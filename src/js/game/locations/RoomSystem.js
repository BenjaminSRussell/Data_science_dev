/**
 * RoomSystem.js
 * Manages rooms within locations
 * Apartment has living room, bedroom, etc.
 * Every location has 1+ rooms
 */

export class RoomSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.rooms = new Map();
        this.initializeRooms();
    }
    
    /**
     * Initialize all location rooms
     */
    initializeRooms() {
        // Apartment rooms
        this.rooms.set('apartment_living_room', {
            id: 'apartment_living_room',
            location: 'home',
            name: 'Living Room',
            description: 'Your shared living space',
            features: [
                { id: 'couch', name: 'Couch', action: 'rest' },
                { id: 'tv', name: 'TV', action: 'entertainment' },
                { id: 'coffee_table', name: 'Coffee Table', action: 'work' },
                { id: 'window', name: 'Window', action: 'view' }
            ]
        });
        
        this.rooms.set('apartment_bedroom', {
            id: 'apartment_bedroom',
            location: 'home',
            name: 'Bedroom',
            description: 'Your private bedroom',
            features: [
                { id: 'bed', name: 'Bed', action: 'sleep' },
                { id: 'desk', name: 'Desk', action: 'work' },
                { id: 'closet', name: 'Closet', action: 'dress' },
                { id: 'window', name: 'Window', action: 'view' }
            ]
        });
        
        this.rooms.set('apartment_kitchen', {
            id: 'apartment_kitchen',
            location: 'home',
            name: 'Kitchen',
            description: 'Shared kitchen area',
            features: [
                { id: 'stove', name: 'Stove', action: 'cook' },
                { id: 'refrigerator', name: 'Refrigerator', action: 'eat' },
                { id: 'sink', name: 'Sink', action: 'clean' },
                { id: 'table', name: 'Dining Table', action: 'eat' }
            ]
        });
        
        this.rooms.set('apartment_bathroom', {
            id: 'apartment_bathroom',
            location: 'home',
            name: 'Bathroom',
            description: 'Shared bathroom',
            features: [
                { id: 'shower', name: 'Shower', action: 'clean' },
                { id: 'sink', name: 'Sink', action: 'clean' },
                { id: 'mirror', name: 'Mirror', action: 'groom' }
            ]
        });
        
        // Coffee Shop rooms
        this.rooms.set('coffee_shop_main', {
            id: 'coffee_shop_main',
            location: 'coffee_shop',
            name: 'Main Area',
            description: 'The main seating area',
            features: [
                { id: 'counter', name: 'Counter', action: 'order' },
                { id: 'table_1', name: 'Table 1', action: 'sit' },
                { id: 'table_2', name: 'Table 2', action: 'sit' },
                { id: 'wifi', name: 'WiFi', action: 'connect' }
            ]
        });
        
        this.rooms.set('coffee_shop_back', {
            id: 'coffee_shop_back',
            location: 'coffee_shop',
            name: 'Back Room',
            description: 'Quiet back area',
            features: [
                { id: 'quiet_table', name: 'Quiet Table', action: 'work' },
                { id: 'outlet', name: 'Power Outlet', action: 'charge' },
                { id: 'bookshelf', name: 'Bookshelf', action: 'read' }
            ]
        });
        
        // Office rooms
        this.rooms.set('office_main', {
            id: 'office_main',
            location: 'office',
            name: 'Main Office',
            description: 'Open office space',
            features: [
                { id: 'workstation', name: 'Your Workstation', action: 'work' },
                { id: 'printer', name: 'Printer', action: 'print' },
                { id: 'whiteboard', name: 'Whiteboard', action: 'plan' }
            ]
        });
        
        this.rooms.set('office_meeting', {
            id: 'office_meeting',
            location: 'office',
            name: 'Meeting Room',
            description: 'Conference room',
            features: [
                { id: 'conference_table', name: 'Conference Table', action: 'meet' },
                { id: 'projector', name: 'Projector', action: 'present' },
                { id: 'whiteboard', name: 'Whiteboard', action: 'plan' }
            ]
        });
        
        // University rooms
        this.rooms.set('university_classroom', {
            id: 'university_classroom',
            location: 'university',
            name: 'Classroom',
            description: 'Lecture hall',
            features: [
                { id: 'desk', name: 'Student Desk', action: 'learn' },
                { id: 'whiteboard', name: 'Whiteboard', action: 'notes' },
                { id: 'projector', name: 'Projector', action: 'watch' }
            ]
        });
        
        this.rooms.set('university_library', {
            id: 'university_library',
            location: 'university',
            name: 'Library',
            description: 'Study area',
            features: [
                { id: 'study_carrel', name: 'Study Carrel', action: 'study' },
                { id: 'books', name: 'Books', action: 'read' },
                { id: 'computer', name: 'Computer', action: 'research' }
            ]
        });
        
        // Bank rooms
        this.rooms.set('bank_lobby', {
            id: 'bank_lobby',
            location: 'bank',
            name: 'Lobby',
            description: 'Main banking area',
            features: [
                { id: 'teller', name: 'Teller', action: 'transact' },
                { id: 'atm', name: 'ATM', action: 'withdraw' },
                { id: 'waiting', name: 'Waiting Area', action: 'wait' }
            ]
        });
        
        this.rooms.set('bank_private', {
            id: 'bank_private',
            location: 'bank',
            name: 'Private Office',
            description: 'Private banking services',
            features: [
                { id: 'advisor', name: 'Financial Advisor', action: 'advice' },
                { id: 'desk', name: 'Desk', action: 'discuss' },
                { id: 'documents', name: 'Documents', action: 'review' }
            ]
        });
    }
    
    /**
     * Get rooms for location
     */
    getLocationRooms(locationId) {
        return Array.from(this.rooms.values()).filter(room => room.location === locationId);
    }
    
    /**
     * Get room by ID
     */
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    
    /**
     * Enter room
     */
    enterRoom(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return null;
        
        return {
            room: room,
            features: room.features,
            canInteract: true
        };
    }
}

