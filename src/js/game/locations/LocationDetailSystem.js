/**
 * LocationDetailSystem.js
 * Manages detailed interiors for every location
 * Dozens of interactive features per location
 */

// AssetResolver not currently used - using direct SVG paths
// import { AssetResolver } from '../../utils/AssetResolver.js';

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
                { id: 'bed', name: 'Bed', description: 'Rest to restore energy', action: 'rest', icon: '/assets/icons/features/bed.svg' },
                { id: 'desk', name: 'Desk', description: 'Work on personal projects', action: 'work', icon: '/assets/icons/features/desk.svg' },
                { id: 'computer', name: 'Computer', description: 'Browse job listings, check email', action: 'computer', icon: '/assets/icons/features/computer.svg' },
                { id: 'kitchen', name: 'Kitchen', description: 'Cook meals to save money', action: 'cook', icon: '/assets/icons/features/kitchen.svg' },
                { id: 'bathroom', name: 'Bathroom', description: 'Freshen up', action: 'bathroom', icon: '/assets/icons/features/bathroom.svg' },
                { id: 'window', name: 'Window', description: 'Look outside at the city', action: 'window', icon: '/assets/icons/features/window.svg' },
                { id: 'bookshelf', name: 'Bookshelf', description: 'Read to improve skills', action: 'read', icon: '/assets/icons/features/bookshelf.svg' },
                { id: 'closet', name: 'Closet', description: 'Change clothes', action: 'closet', icon: '/assets/icons/features/closet.svg' },
                { id: 'refrigerator', name: 'Refrigerator', description: 'Check food supplies', action: 'fridge', icon: '/assets/icons/features/refrigerator.svg' },
                { id: 'tv', name: 'TV', description: 'Watch news and entertainment', action: 'tv', icon: '/assets/icons/features/tv.svg' },
                { id: 'plant', name: 'House Plant', description: 'Water your plant', action: 'plant', icon: '/assets/icons/features/plant.svg' },
                { id: 'mailbox', name: 'Mailbox', description: 'Check mail', action: 'mail', icon: '/assets/icons/features/mailbox.svg' },
                { id: 'roommate_door', name: "Roommate's Door", description: 'Talk to your roommate', action: 'roommate', icon: '/assets/icons/features/roommate_door.svg' },
                { id: 'calendar', name: 'Calendar', description: 'Check your schedule', action: 'calendar', icon: '/assets/icons/features/calendar.svg' },
                { id: 'phone', name: 'Phone', description: 'Make calls', action: 'phone', icon: '/assets/icons/features/phone.svg' }
            ]
        });
        
        // Office
        this.locationDetails.set('office', {
            name: 'Your Office',
            description: 'Your workplace',
            features: [
                { id: 'workstation', name: 'Workstation', description: 'Your main work area', action: 'work', icon: '/assets/icons/features/workstation.svg' },
                { id: 'boss_office', name: "Boss's Office", description: 'Meet with your demanding boss', action: 'boss', icon: '/assets/icons/features/boss_office.svg' },
                { id: 'break_room', name: 'Break Room', description: 'Take a break, talk to coworkers', action: 'break', icon: '/assets/icons/features/break_room.svg' },
                { id: 'conference_room', name: 'Conference Room', description: 'Attend meetings', action: 'meeting', icon: '/assets/icons/features/conference_room.svg' },
                { id: 'printer', name: 'Printer', description: 'Print documents', action: 'print', icon: '/assets/icons/features/printer.svg' },
                { id: 'filing_cabinet', name: 'Filing Cabinet', description: 'Access company files', action: 'files', icon: '/assets/icons/features/bookshelf.png' },
                { id: 'whiteboard', name: 'Whiteboard', description: 'Plan projects', action: 'plan', icon: '/assets/icons/features/whiteboard.svg' },
                { id: 'coffee_machine', name: 'Coffee Machine', description: 'Get coffee for energy', action: 'coffee', icon: '/assets/icons/features/coffee_machine.svg' },
                { id: 'water_cooler', name: 'Water Cooler', description: 'Gossip with coworkers', action: 'gossip', icon: '/assets/icons/features/water_cooler.svg' },
                { id: 'elevator', name: 'Elevator', description: 'Move between floors', action: 'elevator', icon: '/assets/icons/features/elevator.svg' },
                { id: 'reception', name: 'Reception', description: 'Check in visitors', action: 'reception', icon: '/assets/icons/features/reception.svg' },
                { id: 'supply_closet', name: 'Supply Closet', description: 'Get office supplies', action: 'supplies', icon: '/assets/icons/features/supply_closet.svg' },
                { id: 'server_room', name: 'Server Room', description: 'Access company servers', action: 'servers', icon: '/assets/icons/features/server_room.svg' },
                { id: 'parking', name: 'Parking Lot', description: 'Your parking spot', action: 'parking', icon: '/assets/icons/features/parking.svg' },
                { id: 'security', name: 'Security Desk', description: 'Check in with security', action: 'security', icon: '/assets/icons/features/security.svg' }
            ]
        });
        
        // Coffee Shop
        this.locationDetails.set('coffee_shop', {
            name: 'Coffee Shop',
            description: 'Local coffee shop',
            features: [
                { id: 'counter', name: 'Counter', description: 'Order coffee and food', action: 'order', icon: '/assets/icons/features/kitchen.svg' },
                { id: 'table_1', name: 'Table 1', description: 'Sit and work', action: 'work', icon: '/assets/icons/features/desk.svg' },
                { id: 'table_2', name: 'Table 2', description: 'Sit and work', action: 'work', icon: '/assets/icons/features/desk.svg' },
                { id: 'table_3', name: 'Table 3', description: 'Sit and work', action: 'work', icon: '/assets/icons/features/desk.svg' },
                { id: 'barista', name: 'Barista', description: 'Talk to the barista', action: 'talk', icon: '/assets/icons/features/barista.svg' },
                { id: 'wifi', name: 'WiFi', description: 'Connect to free WiFi', action: 'wifi', icon: '/assets/icons/features/wifi.svg' },
                { id: 'outlet', name: 'Power Outlet', description: 'Charge your devices', action: 'charge', icon: '/assets/icons/features/outlet.svg' },
                { id: 'bulletin', name: 'Bulletin Board', description: 'Check local postings', action: 'bulletin', icon: '/assets/icons/features/bulletin.svg' },
                { id: 'bathroom', name: 'Bathroom', description: 'Use restroom', action: 'bathroom', icon: '/assets/icons/features/bathroom.svg' },
                { id: 'pastry_case', name: 'Pastry Case', description: 'Browse pastries', action: 'pastry', icon: '/assets/icons/features/pastry.svg' },
                { id: 'newspaper', name: 'Newspaper Stand', description: 'Read local news', action: 'news', icon: '/assets/icons/features/newspaper.svg' },
                { id: 'trash', name: 'Trash Can', description: 'Dispose of trash', action: 'trash', icon: '/assets/icons/features/trash.svg' }
            ]
        });
        
        // University
        this.locationDetails.set('university', {
            name: 'University',
            description: 'Local university campus',
            features: [
                { id: 'library', name: 'Library', description: 'Study and research', action: 'study', icon: '/assets/icons/features/library.svg' },
                { id: 'classroom', name: 'Classroom', description: 'Attend classes', action: 'class', icon: '/assets/icons/features/classroom.svg' },
                { id: 'professor_office', name: "Professor's Office", description: 'Meet with professors', action: 'professor', icon: '/assets/icons/features/professor.svg' },
                { id: 'cafeteria', name: 'Cafeteria', description: 'Eat lunch', action: 'eat', icon: '/assets/icons/features/cafeteria.svg' },
                { id: 'lab', name: 'Computer Lab', description: 'Use lab computers', action: 'lab', icon: '/assets/icons/features/lab.svg' },
                { id: 'quad', name: 'Quad', description: 'Relax outdoors', action: 'relax', icon: '/assets/icons/features/quad.svg' },
                { id: 'bookstore', name: 'Bookstore', description: 'Buy textbooks', action: 'shop', icon: '/assets/icons/features/bookstore.svg' },
                { id: 'gym', name: 'Gym', description: 'Exercise', action: 'exercise', icon: '/assets/icons/features/gym.svg' },
                { id: 'student_center', name: 'Student Center', description: 'Meet other students', action: 'socialize', icon: '/assets/icons/features/student_center.svg' },
                { id: 'parking', name: 'Parking', description: 'Park your car', action: 'park', icon: '/assets/icons/features/parking.png' },
                { id: 'admin', name: 'Administration', description: 'Handle paperwork', action: 'admin', icon: '/assets/icons/features/admin.svg' },
                { id: 'auditorium', name: 'Auditorium', description: 'Attend lectures', action: 'lecture', icon: '/assets/icons/features/auditorium.svg' }
            ]
        });
        
        // Bank
        this.locationDetails.set('bank', {
            name: 'City Bank',
            description: 'Local bank branch',
            features: [
                { id: 'teller', name: 'Teller', description: 'Make transactions', action: 'teller', icon: '/assets/icons/features/teller.svg' },
                { id: 'atm', name: 'ATM', description: 'Withdraw cash', action: 'atm', icon: '/assets/icons/features/atm.svg' },
                { id: 'loan_officer', name: 'Loan Officer', description: 'Apply for loans', action: 'loan', icon: '/assets/icons/features/loan_officer.svg' },
                { id: 'safe_deposit', name: 'Safe Deposit Box', description: 'Access your box', action: 'deposit', icon: '/assets/icons/features/safe_deposit.svg' },
                { id: 'waiting_area', name: 'Waiting Area', description: 'Wait for service', action: 'wait', icon: '/assets/icons/features/waiting_area.svg' },
                { id: 'brochure_stand', name: 'Brochure Stand', description: 'Read about services', action: 'read', icon: '/assets/icons/features/brochure_stand.svg' },
                { id: 'security', name: 'Security Guard', description: 'Talk to security', action: 'security', icon: '/assets/icons/features/security.svg' },
                { id: 'manager', name: "Manager's Office", description: 'Meet with manager', action: 'manager', icon: '/assets/icons/features/manager.svg' }
            ]
        });
        
        // Library
        this.locationDetails.set('library', {
            name: 'Public Library',
            description: 'Quiet study space with books',
            features: [
                { id: 'bookshelf', name: 'Bookshelf', description: 'Browse books', action: 'read', icon: '/assets/icons/features/bookshelf.png' },
                { id: 'study_table', name: 'Study Table', description: 'Study quietly', action: 'study', icon: '/assets/icons/features/desk.svg' },
                { id: 'computer', name: 'Computer', description: 'Use library computers', action: 'computer', icon: '/assets/icons/features/computer.svg' },
                { id: 'librarian', name: 'Librarian Desk', description: 'Ask for help', action: 'talk', icon: '/assets/icons/features/librarian.svg' },
                { id: 'quiet_room', name: 'Quiet Room', description: 'Study in silence', action: 'study', icon: '/assets/icons/features/bookshelf.svg' },
                { id: 'periodicals', name: 'Periodicals', description: 'Read magazines', action: 'read', icon: '/assets/icons/features/bookshelf.svg' },
                { id: 'copy_machine', name: 'Copy Machine', description: 'Make copies', action: 'copy', icon: '/assets/icons/features/printer.svg' }
            ]
        });
        
        // Gym
        this.locationDetails.set('gym', {
            name: 'Fitness Center',
            description: 'Workout facility',
            features: [
                { id: 'weights', name: 'Weight Area', description: 'Lift weights', action: 'workout', icon: '/assets/icons/features/weights.svg' },
                { id: 'cardio', name: 'Cardio Machines', description: 'Run or bike', action: 'cardio', icon: '/assets/icons/features/cardio.svg' },
                { id: 'locker_room', name: 'Locker Room', description: 'Change clothes', action: 'locker', icon: '/assets/icons/features/locker_room.svg' },
                { id: 'water_fountain', name: 'Water Fountain', description: 'Stay hydrated', action: 'water', icon: '/assets/icons/features/water_fountain.svg' },
                { id: 'trainer', name: 'Personal Trainer', description: 'Get training advice', action: 'trainer', icon: '/assets/icons/features/trainer.svg' },
                { id: 'yoga_room', name: 'Yoga Room', description: 'Practice yoga', action: 'yoga', icon: '/assets/icons/features/yoga_room.svg' }
            ]
        });
        
        // Donut Shop
        this.locationDetails.set('donut_shop', {
            name: 'Donut Delights',
            description: 'Sweet treats shop',
            features: [
                { id: 'counter', name: 'Counter', description: 'Order donuts', action: 'order', icon: '/assets/icons/features/kitchen.svg' },
                { id: 'display_case', name: 'Display Case', description: 'Browse donuts', action: 'browse', icon: '/assets/icons/features/kitchen.svg' },
                { id: 'seating', name: 'Seating Area', description: 'Sit and enjoy', action: 'sit', icon: '/assets/icons/features/desk.svg' },
                { id: 'coffee', name: 'Coffee Station', description: 'Get coffee', action: 'coffee', icon: '/assets/icons/features/coffee_machine.svg' }
            ]
        });
        
        // Bagel Shop
        this.locationDetails.set('bagel_shop', {
            name: 'Bagel Bros',
            description: 'Fresh bagels and coffee',
            features: [
                { id: 'counter', name: 'Counter', description: 'Order bagels', action: 'order', icon: '/assets/icons/features/kitchen.svg' },
                { id: 'toaster', name: 'Toaster', description: 'Toast your bagel', action: 'toast', icon: '/assets/icons/features/kitchen.svg' },
                { id: 'seating', name: 'Seating Area', description: 'Eat here', action: 'eat', icon: '/assets/icons/features/desk.svg' },
                { id: 'coffee', name: 'Coffee', description: 'Get coffee', action: 'coffee', icon: '/assets/icons/features/coffee_machine.svg' }
            ]
        });
        
        // Flower Store
        this.locationDetails.set('flower_store', {
            name: 'Flower Shop',
            description: 'Flower and plant shop',
            features: [
                { id: 'counter', name: 'Counter', description: 'Buy flowers', action: 'buy', icon: '/assets/icons/features/kitchen.svg' },
                { id: 'display', name: 'Flower Display', description: 'Browse flowers', action: 'browse', icon: '/assets/icons/features/showroom.png' },
                { id: 'plants', name: 'Plant Section', description: 'Buy plants', action: 'buy', icon: '/assets/icons/features/plant.svg' },
                { id: 'vases', name: 'Vases', description: 'Buy vases', action: 'buy', icon: '/assets/icons/features/showroom.png' }
            ]
        });
        
        // Networking Bar
        this.locationDetails.set('networking_bar', {
            name: 'The Data Lounge',
            description: 'Upscale networking bar',
            features: [
                { id: 'bar', name: 'Bar', description: 'Order drinks', action: 'drink', icon: '/assets/icons/features/counter.png' },
                { id: 'booth', name: 'Booth', description: 'Private seating', action: 'sit', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'networking_area', name: 'Networking Area', description: 'Meet professionals', action: 'network', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'bartender', name: 'Bartender', description: 'Talk to bartender', action: 'talk', icon: '/assets/icons/features/barista.svg' }
            ]
        });
        
        // Stock Exchange
        this.locationDetails.set('stock_exchange', {
            name: 'Stock Exchange',
            description: 'Trading floor',
            features: [
                { id: 'trading_floor', name: 'Trading Floor', description: 'Watch trading', action: 'watch', icon: '/assets/icons/features/workstation.svg' },
                { id: 'terminal', name: 'Trading Terminal', description: 'Trade stocks', action: 'trade', icon: '/assets/icons/features/workstation.svg' },
                { id: 'analyst_desk', name: 'Analyst Desk', description: 'Get market analysis', action: 'analyze', icon: '/assets/icons/features/workstation.svg' },
                { id: 'meeting_room', name: 'Meeting Room', description: 'Private meetings', action: 'meet', icon: '/assets/icons/features/conference_room.svg' }
            ]
        });
        
        // City Hall
        this.locationDetails.set('city_hall', {
            name: 'City Hall',
            description: 'Government building',
            features: [
                { id: 'reception', name: 'Reception', description: 'Check in', action: 'checkin', icon: '/assets/icons/features/reception.svg' },
                { id: 'license_office', name: 'License Office', description: 'Get licenses', action: 'license', icon: '/assets/icons/features/workstation.svg' },
                { id: 'waiting_room', name: 'Waiting Room', description: 'Wait for service', action: 'wait', icon: '/assets/icons/features/desk.svg' },
                { id: 'records', name: 'Records Office', description: 'Access records', action: 'records', icon: '/assets/icons/features/bookshelf.svg' }
            ]
        });
        
        // Mall
        this.locationDetails.set('mall', {
            name: 'Shopping Mall',
            description: 'Large shopping center',
            features: [
                { id: 'clothing_store', name: 'Clothing Store', description: 'Buy clothes', action: 'shop', icon: '/assets/icons/features/showroom.png' },
                { id: 'electronics', name: 'Electronics Store', description: 'Buy electronics', action: 'shop', icon: '/assets/icons/features/showroom.png' },
                { id: 'food_court', name: 'Food Court', description: 'Eat food', action: 'eat', icon: '/assets/icons/features/counter.png' },
                { id: 'gift_shop', name: 'Gift Shop', description: 'Buy gifts', action: 'shop', icon: '/assets/icons/features/showroom.png' }
            ]
        });
        
        // Car Dealership
        this.locationDetails.set('car_dealership', {
            name: 'Auto World',
            description: 'Car dealership',
            features: [
                { id: 'showroom', name: 'Showroom', description: 'Browse cars', action: 'browse', icon: '/assets/icons/features/showroom.png' },
                { id: 'sales_office', name: 'Sales Office', description: 'Talk to salesperson', action: 'talk', icon: '/assets/icons/features/showroom.png' },
                { id: 'finance', name: 'Finance Office', description: 'Discuss financing', action: 'finance', icon: '/assets/icons/ui/money.png' },
                { id: 'test_drive', name: 'Test Drive Area', description: 'Test drive cars', action: 'test', icon: '/assets/icons/vehicles/used_car.png' }
            ]
        });
        
        // Downtown
        this.locationDetails.set('downtown', {
            name: 'Downtown District',
            description: 'Business district',
            features: [
                { id: 'office_tower', name: 'Office Tower', description: 'Premium offices', action: 'office', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'restaurant', name: 'Restaurant', description: 'Fine dining', action: 'eat', icon: '/assets/icons/features/counter.png' },
                { id: 'meeting_space', name: 'Meeting Space', description: 'Business meetings', action: 'meet', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'parking', name: 'Parking Garage', description: 'Park your car', action: 'park', icon: '/assets/icons/features/parking.png' }
            ]
        });
        
        // Tech Hub
        this.locationDetails.set('tech_hub', {
            name: 'Innovation Hub',
            description: 'Startup accelerator',
            features: [
                { id: 'coworking', name: 'Co-working Space', description: 'Work space', action: 'work', icon: '/assets/icons/items/computer.png' },
                { id: 'pitch_room', name: 'Pitch Room', description: 'Pitch to investors', action: 'pitch', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'networking', name: 'Networking Lounge', description: 'Meet founders', action: 'network', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'mentor_office', name: "Mentor's Office", description: 'Meet with mentors', action: 'mentor', icon: '/assets/icons/features/analyst_desk.png' }
            ]
        });
        
        // Luxury District
        this.locationDetails.set('luxury_district', {
            name: 'Platinum Heights',
            description: 'Elite district',
            features: [
                { id: 'luxury_office', name: 'Luxury Office', description: 'Premium workspace', action: 'work', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'gala_hall', name: 'Gala Hall', description: 'Exclusive events', action: 'event', icon: '/assets/icons/features/showroom.png' },
                { id: 'private_club', name: 'Private Club', description: 'VIP access', action: 'club', icon: '/assets/icons/features/showroom.png' },
                { id: 'yacht_club', name: 'Yacht Club', description: 'Exclusive networking', action: 'network', icon: '/assets/icons/features/showroom.png' }
            ]
        });
        
        // Real Estate
        this.locationDetails.set('real_estate', {
            name: 'Property Investments',
            description: 'Real estate office',
            features: [
                { id: 'listing_desk', name: 'Listing Desk', description: 'Browse properties', action: 'browse', icon: '/assets/icons/features/showroom.png' },
                { id: 'agent_office', name: "Agent's Office", description: 'Meet with agent', action: 'talk', icon: '/assets/icons/features/showroom.png' },
                { id: 'viewing_room', name: 'Viewing Room', description: 'View property photos', action: 'view', icon: '/assets/icons/features/showroom.png' },
                { id: 'finance_desk', name: 'Finance Desk', description: 'Discuss financing', action: 'finance', icon: '/assets/icons/ui/money.png' }
            ]
        });

        // End-game locations
        // Executive Tower
        this.locationDetails.set('executive_tower', {
            name: 'Executive Tower',
            description: 'The pinnacle of corporate power',
            features: [
                { id: 'penthouse_office', name: 'Penthouse Office', description: 'Your corner office at the top', action: 'work', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'boardroom', name: 'Boardroom', description: 'Make major decisions', action: 'meeting', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'executive_lounge', name: 'Executive Lounge', description: 'Network with other executives', action: 'network', icon: '/assets/icons/features/showroom.png' },
                { id: 'helicopter_pad', name: 'Helicopter Pad', description: 'Quick travel anywhere', action: 'travel', icon: '/assets/icons/features/parking.png' },
                { id: 'private_elevator', name: 'Private Elevator', description: 'Direct access to your office', action: 'elevator', icon: '/assets/icons/features/elevator.svg' }
            ]
        });

        // Private Club
        this.locationDetails.set('private_club', {
            name: 'The Platinum Club',
            description: 'Exclusive members-only club',
            features: [
                { id: 'members_lounge', name: "Member's Lounge", description: 'Relax with other elites', action: 'relax', icon: '/assets/icons/features/showroom.png' },
                { id: 'fine_dining', name: 'Fine Dining', description: 'Exquisite cuisine', action: 'eat', icon: '/assets/icons/features/counter.png' },
                { id: 'wine_cellar', name: 'Wine Cellar', description: 'Rare vintages', action: 'drink', icon: '/assets/icons/features/counter.png' },
                { id: 'private_room', name: 'Private Room', description: 'Exclusive meetings', action: 'meet', icon: '/assets/icons/features/showroom.png' },
                { id: 'concierge', name: 'Concierge', description: 'Personal assistance', action: 'talk', icon: '/assets/icons/features/reception.svg' }
            ]
        });

        // Research Center
        this.locationDetails.set('research_center', {
            name: 'Advanced Research Center',
            description: 'Cutting-edge data science research facility',
            features: [
                { id: 'ai_lab', name: 'AI Laboratory', description: 'Work on breakthrough AI', action: 'research', icon: '/assets/icons/items/computer.png' },
                { id: 'quantum_computer', name: 'Quantum Computer', description: 'Access quantum computing', action: 'compute', icon: '/assets/icons/items/computer.png' },
                { id: 'data_vault', name: 'Data Vault', description: 'Secure data storage', action: 'access', icon: '/assets/icons/ui/lock.png' },
                { id: 'conference_hall', name: 'Conference Hall', description: 'Present your research', action: 'present', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'library', name: 'Research Library', description: 'Access academic papers', action: 'read', icon: '/assets/icons/features/bookshelf.png' }
            ]
        });

        // Venture Capital
        this.locationDetails.set('venture_capital', {
            name: 'Venture Capital Firm',
            description: 'Invest in the next big thing',
            features: [
                { id: 'investment_desk', name: 'Investment Desk', description: 'Review investment opportunities', action: 'invest', icon: '/assets/icons/features/finance_desk.png' },
                { id: 'pitch_room', name: 'Pitch Room', description: 'Hear startup pitches', action: 'pitch', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'portfolio_room', name: 'Portfolio Room', description: 'Manage your investments', action: 'manage', icon: '/assets/icons/features/finance_desk.png' },
                { id: 'partner_office', name: "Partner's Office", description: 'Meet with partners', action: 'meet', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'deal_room', name: 'Deal Room', description: 'Close major deals', action: 'deal', icon: '/assets/icons/ui/money.png' }
            ]
        });

        // Mansion District
        this.locationDetails.set('mansion_district', {
            name: 'Mansion District',
            description: 'Where the ultra-wealthy live',
            features: [
                { id: 'your_mansion', name: 'Your Mansion', description: 'Your luxurious home', action: 'rest', icon: '/assets/icons/locations/home.png' },
                { id: 'private_garden', name: 'Private Garden', description: 'Relax in your garden', action: 'relax', icon: '/assets/icons/features/plant.svg' },
                { id: 'wine_cellar', name: 'Wine Cellar', description: 'Your collection', action: 'drink', icon: '/assets/icons/features/counter.png' },
                { id: 'home_office', name: 'Home Office', description: 'Work from home', action: 'work', icon: '/assets/icons/features/analyst_desk.png' },
                { id: 'garage', name: 'Garage', description: 'Your luxury vehicles', action: 'view', icon: '/assets/icons/features/parking.png' }
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

