/**
 * NPC System - Non-player characters with relationships and dialogue
 * Dynamic conversations based on relationship level and player choices
 */

import { getNPCImage, getNPCFallback } from '../utils/NPCImageMapper.js';
import { dialogueTreeSystem } from './dialogue/DialogueTreeSystem.js';

// Initialize all NPC images - ensures every NPC has a visual
function initializeNPCImages() {
    // This will be called after NPCs array is defined
    if (typeof NPCs !== 'undefined' && Array.isArray(NPCs)) {

        // Explicit map for 3D Assets (ID -> Folder Name)
        // If value is null, use convention: id -> folder (underscored)
        const assetMap = {
            'professor_higgins': 'professor_higgins',
            'sarah_martinez': 'sarah_martinez',
            'mike_johnson': 'mike_johnson',
            'lisa_wong': 'lisa_wong',
            'david_chen': 'david_chen',
            'victoria_sterling': 'victoria_sterling',
            'donna_delight': 'bagel_lady', // Best guess
            'bob_bagel': 'chef', // Best guess
            'flora_bloom': 'flora_florist',
            'alex_rivera': 'alex_kim', // Best guess
            'jordan_kim': 'tech_bro', // Best guess, or null for 2D
            'brad_sterling': 'brad',
            'carlos_tech': 'carlos_martinez',
            'emma_bloom': 'emma_bloom',
            'bella_lux': 'bella_lux',
            'dr_amara_patel': 'dr._amara_patel',
            'marcus_thompson': 'marcus_thompson',
            'rachel_green': 'rachel_green',
            'james_wilson': 'james_wilson',
            'priya_sharma': 'priya_sharma',
            'casey_lee': 'casey',
            'sophia_zhang': 'sophia_zhang',
            'tyler_rival': 'tyler',
            'dr. amara patel': 'dr._amara_patel',
            'robert_kim': 'robert_kim',
            'maya_engineer': 'maya_chen',
            'mr_anderson': 'mr._anderson',
            'linda': 'linda',
            'lawyer': 'lawyer',
            'bartender': 'bartender',
            'receptionist': 'receptionist',
            'scientist': 'scientist',
            'musician': 'musician',
            'pilot': 'pilot',

            // Integrated Previously Unused Assets
            'luna_bookstore': 'linda', // Gentle look
            'chloe_competitor': 'dr_sarah_chen', // Professional Rival
            'judge_roberts': 'dr._james_williams', // Distinguished older man
            'the_broker': 'professor', // Distinguished look
            'taylor_morgan': 'patricia_johnson', // Developer/Casual
            'shadow_broker': 'bartender', // Mysterious/Service vibe

            // Mappings for missing characters (Best-fit fallbacks)
            'vinnie_shark': 'lawyer', // Suit
            'zero_cool': 'tech_bro', // Hoodie/Casual
            'sam_taylor': 'casey', // Casual
            'noah_artist': 'musician', // Creative vibe
            'agent_smith': 'mr._anderson', // Men in Black look
            'dr_wellness': 'scientist', // Lab coat/Clean
            'coach_motivation': 'pilot' // Uniform/Active
        };

        NPCs.forEach(npc => {
            if (!npc.image) {
                npc.image = getNPCImage(npc);
            }
            if (!npc.fallbackIcon) {
                npc.fallbackIcon = getNPCFallback(npc);
            }

            // Determine 3D Model Path
            let folderName = assetMap[npc.id];

            // If not in map, try convention (name to snake_case)
            if (!folderName) {
                // Try simple name match
                const simpleName = npc.name.toLowerCase().replace(/ /g, '_').replace(/\./g, '');
                // Basic fallback
                if (simpleName === 'tyler_brooks') folderName = 'tyler';
            }

            if (folderName) {
                // Standard Path
                let modelFile = 'Meshy_AI_biped/Meshy_AI_Animation_Walking_withSkin.fbx';

                // Exceptions
                if (folderName === 'tyler') {
                    modelFile = 'Meshy_AI_tyler_0107222328_texture_fbx/Meshy_AI_tyler_0107222328_texture.fbx';
                }

                npc.modelPath = `/assets/characters/3d/${folderName}/${modelFile}`;
            }
        });
    }
}

// NPC personality traits
export const PERSONALITY_TRAITS = {
    friendly: { relationshipGain: 1.2, dialogueTone: 'warm' },
    professional: { relationshipGain: 1.0, dialogueTone: 'formal' },
    competitive: { relationshipGain: 0.8, dialogueTone: 'challenging' },
    mysterious: { relationshipGain: 0.9, dialogueTone: 'cryptic' },
    generous: { relationshipGain: 1.1, dialogueTone: 'helpful' }
};

// Base NPC definitions
export const NPCs = [
    // Mentors
    {
        id: 'professor_higgins',
        name: 'Professor Higgins',
        title: 'University Professor',
        icon: '',
        image: '/assets/characters/bosses/anderson.png', // Temporary high-quality replacement
        type: 'mentor',
        personality: 'generous',
        location: 'university',
        unlockRequirement: null,
        gifts: ['books', 'coffee'],
        dialogueTopics: ['data_science', 'career', 'research'],
        benefits: { statBoost: 'intelligence', referrals: true },
        backstory: 'A veteran data scientist who teaches at the university. Known for mentoring successful analysts.',
        description: 'Distinguished professor with decades of experience in statistical analysis and machine learning. Always willing to share knowledge with eager students.',
        age: 58,
        interests: ['academic research', 'statistics', 'mentoring'],
        favoriteTopics: ['Bayesian inference', 'neural networks', 'career advice']
    },
    {
        id: 'sarah_martinez',
        name: 'Sarah Martinez',
        title: 'Senior Data Analyst',
        icon: '',
        image: '/assets/characters/bosses/chen.png', // Temporary high-quality replacement
        type: 'mentor',
        personality: 'professional',
        location: 'coffee_shop',
        unlockRequirement: { day: 5 },
        gifts: ['coffee', 'tech_gadgets'],
        dialogueTopics: ['industry', 'career', 'visualization'],
        benefits: { statBoost: 'analytics', clientReferrals: true },
        backstory: 'Works at a top tech company. Loves helping newcomers break into the field.',
        description: 'Experienced analyst at a Fortune 500 company. Known for her clear communication and ability to translate complex data into actionable insights.',
        age: 34,
        interests: ['data visualization', 'career development', 'coffee'],
        favoriteTopics: ['Tableau', 'Python', 'industry trends']
    },

    // Business Contacts
    {
        id: 'mike_johnson',
        name: 'Mike Johnson',
        title: 'Marketing Director',
        icon: '',
        image: '/assets/characters/bosses/martinez.png', // Temporary high-quality replacement
        type: 'business',
        personality: 'friendly',
        location: 'networking_bar',
        unlockRequirement: { stat: 'charisma', value: 20 },
        gifts: ['drinks', 'business_cards'],
        dialogueTopics: ['marketing', 'data', 'business'],
        benefits: { clientReferrals: true, premiumClients: true },
        backstory: 'Runs marketing for a Fortune 500. Always looking for good analysts.',
        description: 'A charismatic marketing executive who understands the power of data-driven decisions. Known for his extensive network and ability to connect the right people.',
        age: 41,
        interests: ['networking', 'marketing analytics', 'golf'],
        favoriteTopics: ['brand strategy', 'customer insights', 'business opportunities']
    },
    {
        id: 'lisa_wong',
        name: 'Lisa Wong',
        title: 'Startup Founder',
        icon: '',
        image: '/assets/characters/bosses/kim.png', // Temporary high-quality replacement
        type: 'business',
        personality: 'competitive',
        location: 'tech_hub',
        unlockRequirement: { reputation: 500 },
        gifts: ['tech_gadgets', 'investment_tips'],
        dialogueTopics: ['startups', 'funding', 'growth'],
        benefits: { startupOpportunities: true, investorIntros: true },
        backstory: 'Founded two successful startups. Now runs an accelerator program.'
    },

    // Investors
    {
        id: 'david_chen',
        name: 'David Chen',
        title: 'Angel Investor',
        icon: '',
        image: '/assets/characters/bosses/williams.png', // Temporary high-quality replacement
        type: 'investor',
        personality: 'mysterious',
        location: 'downtown',
        unlockRequirement: { reputation: 1000, stat: 'charisma', value: 40 },
        gifts: ['fine_wine', 'art'],
        dialogueTopics: ['investments', 'startups', 'market'],
        benefits: { seedFunding: true, vcIntros: true },
        backstory: 'Made millions in tech. Now invests in promising data-driven startups.',
        description: 'A wealthy investor who made his fortune in the tech boom. Speaks in riddles but has an eye for promising ventures. Very selective about who he works with.',
        age: 52,
        interests: ['venture capital', 'fine art', 'cryptocurrency'],
        favoriteTopics: ['market trends', 'startup valuations', 'exit strategies']
    },
    {
        id: 'victoria_sterling',
        name: 'Victoria Sterling',
        title: 'VC Partner',
        icon: '',
        image: '/downloaded_assets/ui/elements/generated_low_poly_panel_0241.png',
        type: 'investor',
        personality: 'professional',
        location: 'luxury_district',
        unlockRequirement: { reputation: 5000, relationship: { david_chen: 50 } },
        gifts: ['fine_wine', 'luxury_watch'],
        dialogueTopics: ['global_markets', 'acquisitions', 'leverage'],
        benefits: { seriesAFunding: true, boardSeat: true },
        backstory: 'A tough-as-nails VC who demands excellence. Her endorsement guarantees success.'
    },

    // Shopkeepers
    {
        id: 'donna_delight',
        name: 'Donna',
        title: 'Donut Shop Owner',
        icon: '',
        image: '/downloaded_assets/misc/placeholders/placeholder_placeholders_043.png',
        type: 'shopkeeper',
        personality: 'friendly',
        location: 'donut_shop',
        unlockRequirement: null,
        gifts: ['tips', 'compliments'],
        dialogueTopics: ['baking', 'sugar', 'mornings'],
        benefits: { free_donuts: true },
        backstory: 'Bakes the best donuts in the city. Always has a smile ready.',
        description: 'The cheerful owner of Donut Delights. Her donuts are legendary, and her positive energy is infectious. Knows all the regulars by name.',
        age: 42,
        interests: ['baking', 'customer service', 'morning routines'],
        favoriteTopics: ['new recipes', 'customer stories', 'sweet treats']
    },
    {
        id: 'bob_bagel',
        name: 'Bob',
        title: 'Bagel Expert',
        icon: '',
        image: '/downloaded_assets/misc/placeholders/placeholder_placeholders_042.png',
        type: 'shopkeeper',
        personality: 'generous',
        location: 'bagel_shop',
        unlockRequirement: null,
        gifts: ['tips', 'coffee'],
        dialogueTopics: ['yeast', 'nyc', 'cream_cheese'],
        benefits: { extra_cream_cheese: true },
        backstory: 'Takes bagels very seriously. Claims to import water from NYC.',
        description: 'A passionate bagel maker who moved from Brooklyn to start his own shop. Extremely knowledgeable about traditional bagel-making techniques.',
        age: 48,
        interests: ['baking', 'NYC culture', 'food traditions'],
        favoriteTopics: ['bagel history', 'yeast fermentation', 'perfect cream cheese ratios']
    },
    {
        id: 'flora_bloom',
        name: 'Flora',
        title: 'Florist',
        icon: '',
        image: '/downloaded_assets/misc/placeholders/placeholder_placeholders_040.png',
        type: 'shopkeeper',
        personality: 'friendly',
        location: 'flower_store',
        unlockRequirement: null,
        gifts: ['water', 'sunshine'],
        dialogueTopics: ['gardening', 'nature', 'design'],
        action: 'buy_flowers',
        backstory: 'Loves plants more than people. Makes beautiful arrangements.',
        description: 'A gentle florist who finds peace in nature. Her flower arrangements are works of art, and she has a deep understanding of plant care.',
        age: 35,
        interests: ['botany', 'floral design', 'sustainability'],
        favoriteTopics: ['plant care', 'seasonal flowers', 'arrangement techniques']
    },


    // Friends
    {
        id: 'alex_rivera',
        name: 'Alex Rivera',
        title: 'Fellow Freelancer',
        icon: '',
        image: '/assets/characters/bosses/kim.png', // Temporary high-quality replacement
        type: 'friend',
        personality: 'friendly',
        location: 'coffee_shop',
        unlockRequirement: null,
        gifts: ['coffee', 'snacks'],
        dialogueTopics: ['freelancing', 'life', 'hobbies'],
        benefits: { moralBoost: true, jobSharing: true },
        backstory: 'Started freelancing the same time as you. Currently struggling to find steady work.',
        description: 'A fellow freelancer trying to make it in the data science world. Shares your struggles and dreams. Always up for a coffee chat.',
        age: 26,
        interests: ['coding', 'startups', 'coffee shops'],
        favoriteTopics: ['freelance life', 'side projects', 'mutual support']
    },
    {
        id: 'jordan_kim',
        name: 'Jordan Kim',
        title: 'Gym Buddy',
        icon: '',
        image: '/downloaded_assets/misc/placeholders/placeholder_placeholders_021.png',
        type: 'friend',
        personality: 'friendly',
        location: 'gym',
        unlockRequirement: { stat: 'stamina', value: 15 },
        gifts: ['protein', 'sports_gear'],
        dialogueTopics: ['fitness', 'motivation', 'life'],
        benefits: { staminaBoost: true, workoutPartner: true },
        backstory: 'Personal trainer who believes in work-life balance.',
        description: 'An enthusiastic personal trainer who combines fitness expertise with motivational support. Believes that physical health enhances mental performance.',
        age: 29,
        interests: ['weightlifting', 'nutrition', 'mental health'],
        favoriteTopics: ['workout routines', 'protein intake', 'recovery strategies']
    },

    // Rivals
    {
        id: 'brad_sterling',
        name: 'Brad Sterling',
        title: 'Competing Analyst',
        icon: '',
        image: '/assets/characters/bosses/anderson.png', // Temporary high-quality replacement
        type: 'rival',
        personality: 'competitive',
        location: 'networking_bar',
        unlockRequirement: { reputation: 200 },
        gifts: [], // Rivals don't accept gifts easily
        dialogueTopics: ['competition', 'achievements', 'clients'],
        benefits: { competitionEvents: true, motivationBoost: true },
        backstory: 'Started around the same time as you. Always trying to one-up you.'
    },

    // Shady Characters (Evil Playthrough)
    {
        id: 'vinnie_shark',
        name: 'Vinnie "The Shark"',
        title: 'Loan Consultant',
        icon: '',
        image: '/assets/characters/bosses/johnson.png', // Temporary high-quality replacement
        type: 'criminal',
        personality: 'aggressive',
        location: 'downtown', // Or secluded alley
        unlockRequirement: { ethics: -10 },
        gifts: ['cash', 'fancy_cigar'],
        dialogueTopics: ['quick_cash', 'debt', 'protection'],
        benefits: { loanShark: true, debtCollection: true },
        backstory: 'Runs a "consulting" business. Lending money at high rates.'
    },
    {
        id: 'the_broker',
        name: 'Gordon "The Broker"',
        title: 'Stock Operator',
        icon: '',
        image: '/downloaded_assets/ui/elements/generated_low_poly_panel_0296.png',
        type: 'criminal',
        personality: 'greedy',
        location: 'stock_exchange',
        unlockRequirement: { ethics: -20, netWorth: 100000 },
        gifts: ['cocaine', 'insider_info'], // cocaine might be too much, let's say "expensive_champagne"
        dialogueTopics: ['penny_stocks', 'ratholes', 'sec_evasion'],
        benefits: { pumpDump: true, ratholes: true },
        backstory: 'Former wall street legend, now operating in the shadows.'
    },
    {
        id: 'zero_cool',
        name: 'Zero',
        title: 'Info Broker',
        icon: '',
        image: '/assets/npcs/the_hacker.png',
        type: 'criminal',
        personality: 'mysterious',
        location: 'coffee_shop', // or internet cafe
        unlockRequirement: { ethics: -40 },
        gifts: ['crypto', 'exploits'],
        dialogueTopics: ['corporate_espionage', 'data_leaks', 'security_flaws'],
        benefits: { insiderTrading: true, sabotage: true },
        backstory: 'A ghost in the machine. Can find dirt on anyone.'
    },
    // Love Interests
    {
        id: 'emma_bloom',
        name: 'Emma Bloom',
        title: 'Librarian & Teacher',
        icon: '',
        image: '/assets/characters/bosses/chen.png', // Temporary high-quality replacement
        type: 'romance',
        personality: 'friendly',
        location: 'library',
        unlockRequirement: { ethics: 20 }, // Needs good ethics
        romanceOptions: { minEthics: 10 },
        gifts: ['books', 'flowers'],
        dialogueTopics: ['books', 'education', 'future'],
        benefits: { studyBoost: true, ethicsBoost: true },
        backstory: 'Passionate about education. Looking for someone kind and stable.',
        description: 'A gentle soul who finds joy in books and helping others learn. Values integrity and intellectual curiosity above all else.',
        age: 28,
        interests: ['literature', 'education', 'gardening'],
        favoriteTopics: ['classic novels', 'teaching methods', 'personal growth']
    },
    {
        id: 'bella_lux',
        name: 'Bella Lux',
        title: 'Influencer',
        icon: '',
        image: '/assets/characters/bosses/martinez.png', // Temporary high-quality replacement
        type: 'romance',
        personality: 'high_maintenance', // Custom handling
        location: 'luxury_district',
        unlockRequirement: { netWorth: 100000 },
        romanceOptions: { maxEthics: -10 }, // Prefers bad boys/girls
        gifts: ['jewelry', 'designer_bags'],
        dialogueTopics: ['parties', 'fame', 'money'],
        benefits: { popularityBoost: true, expensiveTastes: true },
        backstory: 'Always chasing the spotlight. Wants a partner who can fund her lifestyle.'
    },

    // Additional Mentors
    {
        id: 'dr_amara_patel',
        name: 'Dr. Amara Patel',
        title: 'Machine Learning Expert',
        icon: '',
        type: 'mentor',
        personality: 'professional',
        location: 'university',
        unlockRequirement: { stat: 'intelligence', value: 30 },
        gifts: ['research_papers', 'coffee'],
        dialogueTopics: ['machine_learning', 'neural_networks', 'research'],
        benefits: { statBoost: 'intelligence', mlProjects: true },
        backstory: 'Leading researcher in deep learning. Published dozens of papers.'
    },
    {
        id: 'marcus_thompson',
        name: 'Marcus Thompson',
        title: 'Data Engineering Lead',
        icon: '',
        image: '/downloaded_assets/ui/elements/generated_low_poly_star_0279.png',
        type: 'mentor',
        personality: 'generous',
        location: 'tech_hub',
        unlockRequirement: { reputation: 300 },
        gifts: ['tech_gadgets', 'books'],
        dialogueTopics: ['data_pipelines', 'infrastructure', 'scalability'],
        benefits: { statBoost: 'analytics', systemDesign: true },
        backstory: 'Built data infrastructure for major tech companies. Knows everything about scale.'
    },

    // Additional Business Contacts
    {
        id: 'rachel_green',
        name: 'Rachel Green',
        title: 'Product Manager',
        icon: '',
        type: 'business',
        personality: 'friendly',
        location: 'coffee_shop',
        unlockRequirement: { day: 10 },
        gifts: ['coffee', 'notebooks'],
        dialogueTopics: ['product_development', 'user_experience', 'roadmaps'],
        benefits: { productInsights: true, clientReferrals: true },
        backstory: 'Manages products at a growing startup. Always looking for data-driven insights.'
    },
    {
        id: 'james_wilson',
        name: 'James Wilson',
        title: 'Consulting Director',
        icon: '',
        type: 'business',
        personality: 'professional',
        location: 'downtown',
        unlockRequirement: { reputation: 800 },
        gifts: ['fine_wine', 'business_cards'],
        dialogueTopics: ['consulting', 'strategy', 'enterprise'],
        benefits: { premiumClients: true, consultingGigs: true },
        backstory: 'Runs a top consulting firm. Clients pay premium for his team\'s insights.'
    },
    {
        id: 'priya_sharma',
        name: 'Priya Sharma',
        title: 'Data Privacy Officer',
        icon: '',
        type: 'business',
        personality: 'professional',
        location: 'city_hall',
        unlockRequirement: { reputation: 400 },
        gifts: ['books', 'coffee'],
        dialogueTopics: ['privacy', 'compliance', 'ethics'],
        benefits: { complianceHelp: true, ethicsBoost: true },
        backstory: 'Ensures companies follow data privacy laws. Very ethical and principled.'
    },

    // Additional Friends
    {
        id: 'sam_taylor',
        name: 'Sam Taylor',
        title: 'Freelance Designer',
        icon: '',
        type: 'friend',
        personality: 'friendly',
        location: 'coffee_shop',
        unlockRequirement: { day: 3 },
        gifts: ['art_supplies', 'coffee'],
        dialogueTopics: ['design', 'creativity', 'freelancing'],
        benefits: { designHelp: true, creativeBoost: true },
        backstory: 'Works on visual design projects. Great at making charts look beautiful.'
    },
    {
        id: 'taylor_morgan',
        name: 'Taylor Morgan',
        title: 'Software Developer',
        icon: '',
        type: 'friend',
        personality: 'friendly',
        location: 'coffee_shop',
        unlockRequirement: null,
        gifts: ['coffee', 'keyboard'],
        dialogueTopics: ['coding', 'tech', 'startups'],
        benefits: { codingHelp: true, techInsights: true },
        backstory: 'Full-stack developer. Always working on side projects.'
    },
    {
        id: 'casey_lee',
        name: 'Casey Lee',
        title: 'Marketing Specialist',
        icon: '',
        type: 'friend',
        personality: 'friendly',
        location: 'coffee_shop',
        unlockRequirement: { day: 7 },
        gifts: ['coffee', 'social_media_tips'],
        dialogueTopics: ['marketing', 'social_media', 'branding'],
        benefits: { marketingHelp: true, clientReferrals: true },
        backstory: 'Helps businesses grow through digital marketing. Very social.'
    },

    // Additional Shopkeepers
    {
        id: 'carlos_tech',
        name: 'Carlos',
        title: 'Tech Store Owner',
        icon: '',
        type: 'shopkeeper',
        personality: 'friendly',
        location: 'mall',
        unlockRequirement: { money: 2000 },
        gifts: ['tips', 'tech_reviews'],
        dialogueTopics: ['hardware', 'gadgets', 'tech'],
        benefits: { hardwareDiscounts: true },
        backstory: 'Runs the best tech store in town. Knows all the latest gear.'
    },
    {
        id: 'luna_bookstore',
        name: 'Luna',
        title: 'Bookstore Owner',
        icon: '',
        type: 'shopkeeper',
        personality: 'generous',
        location: 'library',
        unlockRequirement: null,
        gifts: ['bookmarks', 'coffee'],
        dialogueTopics: ['books', 'learning', 'knowledge'],
        benefits: { bookDiscounts: true, studyBoost: true },
        backstory: 'Loves books more than anything. Always recommends great reads.'
    },

    // Additional Investors
    {
        id: 'robert_kim',
        name: 'Robert Kim',
        title: 'Seed Investor',
        icon: '',
        type: 'investor',
        personality: 'professional',
        location: 'tech_hub',
        unlockRequirement: { reputation: 800, stat: 'charisma', value: 30 },
        gifts: ['business_plans', 'fine_wine'],
        dialogueTopics: ['startups', 'funding', 'valuation'],
        benefits: { seedFunding: true, startupIntros: true },
        backstory: 'Early-stage investor. Focuses on data-driven startups.'
    },
    {
        id: 'sophia_zhang',
        name: 'Sophia Zhang',
        title: 'Corporate Investor',
        icon: '',
        type: 'investor',
        personality: 'professional',
        location: 'downtown',
        unlockRequirement: { reputation: 1500, money: 50000 },
        gifts: ['luxury_watch', 'fine_wine'],
        dialogueTopics: ['corporate_strategy', 'acquisitions', 'scaling'],
        benefits: { corporateFunding: true, acquisitionOpportunities: true },
        backstory: 'Represents a major corporation\'s investment arm. Deals in millions.'
    },

    // Additional Rivals
    {
        id: 'chloe_competitor',
        name: 'Chloe Martinez',
        title: 'Rival Analyst',
        icon: '',
        type: 'rival',
        personality: 'competitive',
        location: 'networking_bar',
        unlockRequirement: { reputation: 150 },
        gifts: [], // Rivals don't accept gifts
        dialogueTopics: ['competition', 'achievements', 'clients'],
        benefits: { competitionEvents: true, motivationBoost: true },
        backstory: 'Always trying to steal your clients. Very competitive.'
    },
    {
        id: 'tyler_rival',
        name: 'Tyler Brooks',
        title: 'Competing Freelancer',
        icon: '',
        type: 'rival',
        personality: 'competitive',
        location: 'coffee_shop',
        unlockRequirement: { reputation: 100 },
        gifts: [],
        dialogueTopics: ['competition', 'rates', 'clients'],
        benefits: { competitionEvents: true },
        backstory: 'Undercuts your rates. Always trying to one-up you.'
    },

    // Additional Criminal/Shady Characters
    {
        id: 'shadow_broker',
        name: 'Shadow',
        title: 'Information Broker',
        icon: '',
        type: 'criminal',
        personality: 'mysterious',
        location: 'networking_bar',
        unlockRequirement: { ethics: -15 },
        gifts: ['crypto', 'anonymous_tips'],
        dialogueTopics: ['insider_info', 'data_leaks', 'secrets'],
        benefits: { insiderInfo: true, marketManipulation: true },
        backstory: 'Sells information to the highest bidder. Very secretive.'
    },

    // Additional Romance Options
    {
        id: 'maya_engineer',
        name: 'Maya Chen',
        title: 'Software Engineer',
        icon: '',
        type: 'romance',
        personality: 'friendly',
        location: 'tech_hub',
        unlockRequirement: { stat: 'intelligence', value: 25 },
        romanceOptions: { minIntelligence: 20 },
        gifts: ['code_reviews', 'tech_gadgets'],
        dialogueTopics: ['coding', 'tech', 'innovation'],
        benefits: { codingHelp: true, techInsights: true },
        backstory: 'Brilliant engineer. Appreciates intelligence and creativity.'
    },
    {
        id: 'noah_artist',
        name: 'Noah Williams',
        title: 'Visual Artist',
        icon: '',
        type: 'romance',
        personality: 'friendly',
        location: 'coffee_shop',
        unlockRequirement: { day: 15 },
        romanceOptions: { minCharisma: 15 },
        gifts: ['art_supplies', 'coffee'],
        dialogueTopics: ['art', 'creativity', 'aesthetics'],
        benefits: { designHelp: true, creativeBoost: true },
        backstory: 'Creates beautiful visualizations. Values creativity and expression.'
    },

    // Government/Authority Figures
    {
        id: 'agent_smith',
        name: 'Agent Smith',
        title: 'IRS Investigator',
        icon: '',
        type: 'authority',
        personality: 'professional',
        location: 'city_hall',
        unlockRequirement: { ethics: -30 },
        gifts: [], // Can't bribe
        dialogueTopics: ['taxes', 'compliance', 'audits'],
        benefits: { taxAdvice: true, auditProtection: true },
        backstory: 'Investigates financial crimes. Very thorough and by-the-book.'
    },
    {
        id: 'judge_roberts',
        name: 'Judge Roberts',
        title: 'City Judge',
        icon: '',
        type: 'authority',
        personality: 'professional',
        location: 'city_hall',
        unlockRequirement: { reputation: 2000 },
        gifts: ['respect', 'legal_books'],
        dialogueTopics: ['law', 'justice', 'ethics'],
        benefits: { legalProtection: true, ethicsBoost: true },
        backstory: 'Fair and just. Respects those who follow the law.'
    },

    // Service Providers
    {
        id: 'dr_wellness',
        name: 'Dr. Wellness',
        title: 'Health Coach',
        icon: '',
        type: 'service',
        personality: 'generous',
        location: 'gym',
        unlockRequirement: { stat: 'stamina', value: 20 },
        gifts: ['healthy_food', 'vitamins'],
        dialogueTopics: ['health', 'fitness', 'wellness'],
        benefits: { healthBoost: true, staminaBoost: true },
        backstory: 'Helps people maintain healthy lifestyles. Very encouraging.'
    },
    {
        id: 'coach_motivation',
        name: 'Coach Motivation',
        title: 'Life Coach',
        icon: '',
        type: 'service',
        personality: 'friendly',
        location: 'gym',
        unlockRequirement: { stat: 'focus', value: 25 },
        gifts: ['motivational_books', 'protein'],
        dialogueTopics: ['motivation', 'goals', 'success'],
        benefits: { motivationBoost: true, focusBoost: true },
        backstory: 'Helps people achieve their goals. Very inspiring.'
    }
];

// Initialize all NPC images on module load
initializeNPCImages();

// Dialogue templates based on relationship levels
export const DIALOGUE_TEMPLATES = {
    first_meeting: [
        { text: "Hi, I'm {name}. Nice to meet you.", relationshipReq: 0 },
        { text: "Oh, you're new around here? Welcome!", relationshipReq: 0 }
    ],
    low_relationship: [
        { text: "Hey, good to see you again.", relationshipReq: 10 },
        { text: "How's the data business treating you?", relationshipReq: 10 }
    ],
    medium_relationship: [
        { text: "Hey friend! Always happy to chat with you.", relationshipReq: 40 },
        { text: "I was just thinking about you. How are things?", relationshipReq: 40 }
    ],
    high_relationship: [
        { text: "My favorite person! What brings you by?", relationshipReq: 70 },
        { text: "I've got some great news for you!", relationshipReq: 70 }
    ],
    max_relationship: [
        { text: "You know you can always count on me.", relationshipReq: 90 },
        { text: "Let's make something amazing happen today!", relationshipReq: 90 }
    ]
};

// Dialogue choices and their effects
export const DIALOGUE_CHOICES = {
    greeting: [
        { text: "Nice to meet you too!", effect: { relationship: 2 }, tone: 'friendly' },
        { text: "I've heard a lot about you.", effect: { relationship: 3 }, tone: 'flattering' },
        { text: "*nod silently*", effect: { relationship: 0 }, tone: 'cold' }
    ],
    ask_advice: [
        { text: "What's your best career tip?", effect: { relationship: 3, xp: 'intelligence' }, requiredRelationship: 20 },
        { text: "How did you get where you are?", effect: { relationship: 5 }, requiredRelationship: 30 },
        { text: "Can you help me with a problem?", effect: { relationship: 2, favor: true }, requiredRelationship: 50 }
    ],
    business_talk: [
        { text: "Know anyone who needs an analyst?", effect: { relationship: 1, referralChance: true }, requiredRelationship: 40 },
        { text: "Let's collaborate on something!", effect: { relationship: 5, projectChance: true }, requiredRelationship: 60 },
        { text: "I'm interested in investment opportunities.", effect: { relationship: 2, investmentInfo: true }, requiredRelationship: 50 }
    ],
    give_gift: [
        { text: "I brought you something!", effect: { relationship: 10, giftBonus: true } }
    ],
    farewell: [
        { text: "Great talking to you!", effect: { relationship: 1 } },
        { text: "Let's do this again soon.", effect: { relationship: 2 } },
        { text: "See you around.", effect: { relationship: 0 } }
    ],
    // Illegal Choices
    shady_deal: [
        { text: "I'm looking for a... shortcut.", effect: { relationship: 5, ethics: -5 }, requiredRelationship: 10 },
        { text: "How can I make money fast?", effect: { relationship: 2, ethics: -2 }, requiredRelationship: 0 },
        { text: "I'm in. Tell me the scheme.", effect: { relationship: 10, ethics: -10, unlockScheme: true }, requiredRelationship: 40 }
    ]
};

// Deep Dialogue Trees for Key Characters
export const DIALOGUE_TREES = {
    'emma_bloom': {
        'root': {
            text: "Hi! Welcome to the library. Can I help you find something?",
            choices: [
                { text: "What are you reading?", next: 'reading_topic', effect: { relationship: 1 } },
                { text: "I'm just looking for a quiet place.", next: 'quiet_topic', effect: { relationship: 0 } },
                { text: "Actually, I wanted to ask you something...", next: 'personal_topic', requiredRelationship: 20 }
            ]
        },
        'reading_topic': {
            text: "Oh, this? It's a fascinating book on Neural Networks. I love how they mimic the human brain.",
            choices: [
                { text: "I love algorithms! I'm a Data Scientist.", next: 'algorithms_topic', effect: { relationship: 5, xp: 'python' } },
                { text: "Sounds complicated.", next: 'root', effect: { relationship: -1 } }
            ]
        },
        'algorithms_topic': {
            text: "Really? That's amazing! We should study together sometime.",
            choices: [
                { text: "I'd love that.", next: 'root', effect: { relationship: 5, studyBoost: true } },
                { text: "Maybe later.", next: 'root', effect: { relationship: 0 } }
            ]
        },
        'quiet_topic': {
            text: "I understand. The world can be so noisy. Enjoy the silence.",
            choices: [
                { text: "Thanks.", next: 'root', effect: { relationship: 1 } }
            ]
        },
        'personal_topic': {
            text: "Oh? What's on your mind?",
            choices: [
                { text: "Would you like to go out sometime?", action: 'date_ask', next: 'root' },
                { text: "Never mind.", next: 'root' }
            ]
        }
    },
    'alex_rivera': {
        'root': {
            text: "Yo! What's up? Plotting your next big move?",
            choices: [
                { text: "Just working hard. Any tips?", next: 'hustle_topic', effect: { relationship: 1 } },
                { text: "Have you started that app yet?", next: 'startup_topic', effect: { relationship: 1 } },
                { text: "Let's grab a coffee.", next: 'coffee_topic', effect: { relationship: 2 } }
            ]
        },
        'hustle_topic': {
            text: "Always be closing, my friend. I heard crypto is about to moon. You in?",
            choices: [
                { text: "Crypto is a scam.", next: 'root', effect: { relationship: -2, ethics: 2 } },
                { text: "Tell me more!", next: 'root', effect: { relationship: 5, ethics: -1 } }
            ]
        },
        'startup_topic': {
            text: "Bro, it's going to be the Uber for Dog Walking Data. I just need a seed investor.",
            choices: [
                { text: "Sounds... unique.", next: 'root', effect: { relationship: 0 } },
                { text: "I'll invest in you (if I had money).", next: 'root', effect: { relationship: 5 } }
            ]
        },
        'coffee_topic': {
            text: "You buying? Just kidding. Let's get caffeinated.",
            choices: [
                { text: "Let's go.", next: 'root', effect: { relationship: 3, energy: 10 } }
            ]
        }
    },
    'bella_lux': {
        'root': {
            text: "Do I know you? You don't look like you're on the list.",
            choices: [
                { text: "I'm a Data Scientist. I analyze trends.", next: 'value_topic', effect: { relationship: 0 } },
                { text: "Sorry, just passing through.", next: 'ignore_topic', effect: { relationship: 0 } },
                { text: "I can make you rich.", next: 'money_topic', requiredRelationship: 10, effect: { relationship: 5, ethics: -2 } }
            ]
        },
        'value_topic': {
            text: "Data? Boring. Unless... can you predict which fashion stocks will tank next week?",
            choices: [
                { text: "That would be insider trading.", next: 'root', effect: { relationship: -5, ethics: 5 } },
                { text: "I could run some models for you.", next: 'scheme_topic', effect: { relationship: 5, ethics: -5 } }
            ]
        },
        'scheme_topic': {
            text: "Now you're talking my language. Meet me here later. Don't be late.",
            choices: [
                { text: "Understood.", next: 'root', effect: { relationship: 5 } }
            ]
        },
        'ignore_topic': {
            text: "Thought so. Ciao.",
            choices: [
                { text: "Bye.", next: 'root' }
            ]
        },
        'money_topic': {
            text: "Bold. I like bold. You better have the portfolio to back that up.",
            choices: [
                { text: "I do.", next: 'root', effect: { relationship: 5 } }
            ]
        }
    },
    'vinnie_shark': {
        'root': {
            text: "You lost, kid? This ain't the library.",
            choices: [
                { text: "I'm looking for a loan.", next: 'loan_topic', effect: { relationship: 0, ethics: -1 } },
                { text: "Just looking for opportunities.", next: 'job_topic', effect: { relationship: 0, ethics: -2 } },
                { text: "I'm leaving.", next: 'root', effect: { relationship: 0 } }
            ]
        },
        'loan_topic': {
            text: "I got cash. Interest is... strictly non-negotiable. 20% weekly. Take it or leave it.",
            choices: [
                { text: "I'm desperate. I'll take it.", next: 'root', effect: { relationship: 5, money: 1000, ethics: -5, flag: 'loan_taken' } },
                { text: "Too high.", next: 'root', effect: { relationship: -1 } }
            ]
        },
        'job_topic': {
            text: "I got a friend who needs some numbers... adjusted. On a spreadsheet. No questions asked.",
            choices: [
                { text: "I can do that.", next: 'root', effect: { relationship: 10, money: 500, ethics: -10 } },
                { text: "I don't cook books.", next: 'root', effect: { relationship: -5, ethics: 5 } }
            ]
        }
    },
    professor_higgins: {
        'root': {
            text: "Good day. Have you completed the reading on Bayesian Inference?",
            choices: [
                { text: "Yes, Professor. Fascinating stuff.", next: 'theory_topic', effect: { relationship: 2, xp: 'statistics' } },
                { text: "I'm here about the exam.", next: 'exam_topic', effect: { relationship: 0 } },
                { text: "Not yet.", next: 'lecture_topic', effect: { relationship: -1 } }
            ]
        },
        'theory_topic': {
            text: "Glad to hear it. Remember, p-values are not a substitute for critical thinking.",
            choices: [
                { text: "Of course.", next: 'root', effect: { relationship: 2 } }
            ]
        },
        'exam_topic': {
            text: "The exam is tough. If you haven't mastered Python and SQL, don't bother.",
            choices: [
                { text: "I'm ready.", next: 'root', effect: { relationship: 0 } }
            ]
        },
        'lecture_topic': {
            text: "Then why are you bothering me? Go study!",
            choices: [
                { text: "Sorry.", next: 'root', effect: { relationship: -1 } }
            ]
        }
    },
    'mike_johnson': {
        'root': {
            text: "Hey! Good to see you. How's the freelance grind?",
            choices: [
                { text: "It's tough but freeing.", next: 'freelance_topic', effect: { relationship: 1 } },
                { text: "I'm looking for corporate clients.", next: 'corporate_topic', effect: { relationship: 2 } }
            ]
        },
        'freelance_topic': {
            text: "I respect that. Though at GlobalCorp, we enjoy the steady paycheck and free coffee.",
            choices: [
                { text: "Maybe one day.", next: 'root', effect: { relationship: 0 } }
            ]
        },
        'corporate_topic': {
            text: "We actually need some data cleaning done. It's boring work, but pays okay.",
            choices: [
                { text: "I'll take it.", next: 'root', effect: { relationship: 5, money: 300, energy: -20, xp: 'python' } },
                { text: "I'm too expensive for cleaning.", next: 'root', effect: { relationship: -1 } }
            ]
        }
    },
    'lisa_wong': {
        'root': {
            text: "Does this pitch deck look 'disruptive' enough to you?",
            choices: [
                { text: "Needs more blockchain keywords.", next: 'hype_topic', effect: { relationship: 2, ethics: -1 } },
                { text: "Focus on the revenue model.", next: 'revenue_topic', effect: { relationship: 1 } }
            ]
        },
        'hype_topic': {
            text: "Brilliant! 'DeFi AI on the Edge'. Investors will eat it up.",
            choices: [
                { text: "Go get 'em.", next: 'root', effect: { relationship: 5 } }
            ]
        },
        'revenue_topic': {
            text: "Revenue? That's pre-seed thinking. We need growth!",
            choices: [
                { text: "My mistake.", next: 'root', effect: { relationship: -1 } }
            ]
        }
    },
    'jordan_kim': {
        'root': {
            text: "Bro, did you see those gains? My portfolio is up 5%... muscle mass, I mean.",
            choices: [
                { text: "Looking huge, Jordan.", next: 'fitness_topic', effect: { relationship: 2 } },
                { text: "I need to work out more.", next: 'workout_topic', effect: { relationship: 5 } }
            ]
        },
        'fitness_topic': {
            text: "Thanks! It's all about consistency. Same with coding, right?",
            choices: [
                { text: "Totally.", next: 'root', effect: { relationship: 1 } }
            ]
        },
        'workout_topic': {
            text: "Let's hit the weights right now! I'll spot you.",
            choices: [
                { text: "Let's do it!", next: 'root', effect: { relationship: 10, stamina: 10, energy: -30 } }
            ]
        }
    },
    'brad_sterling': {
        'root': {
            text: "Oh, it's you. Still playing with Excel spreadsheets?",
            choices: [
                { text: "I use Python actually.", next: 'tech_topic', effect: { relationship: 0, xp: 'python' } },
                { text: "I'm doing better than you.", next: 'rival_topic', effect: { relationship: -2 } },
                { text: "Go away, Brad.", next: 'root', effect: { relationship: -5 } }
            ]
        },
        'tech_topic': {
            text: "Python? Cute. I'm already optimizing LLMs on custom hardware.",
            choices: [
                { text: "Show off.", next: 'root', effect: { relationship: -1 } }
            ]
        },
        'rival_topic': {
            text: "We'll see about that when the quarterly rankings come out.",
            choices: [
                { text: "Bring it on.", next: 'root', effect: { relationship: 0, motivation: 5 } }
            ]
        }
    },
    'david_chen': {
        'root': {
            text: "...",
            choices: [
                { text: "Mr. Chen? I have a proposal.", next: 'pitch_topic', requiredRelationship: 20 },
                { text: "*Nod silently*", next: 'silent_topic', effect: { relationship: 1 } }
            ]
        },
        'silent_topic': {
            text: "*He nods back, appreciating the lack of noise.*",
            choices: [
                { text: "...", next: 'root', effect: { relationship: 2 } }
            ]
        },
        'pitch_topic': {
            text: "I'm listening. Make it quick.",
            choices: [
                { text: "Data-driven AI for Healthcare.", next: 'root', effect: { relationship: 5, money: 5000, flag: 'seed_interest' } },
                { text: "Uhh... an App for Dogs?", next: 'root', effect: { relationship: -10 } }
            ]
        }
    }
};

/**
 * NPCManager class - handles NPC interactions and relationships
 */
export class NPCManager {
    constructor(gameState) {
        this.gameState = gameState;

        // Relationship levels with each NPC (0-100)
        this.relationships = {};

        // Advanced State Tracking (Dialogue Trees & Flags)
        this.npcStates = {}; // { npcId: { currentNode: 'root', flags: {}, history: [] } }

        // Start tracking
        this.initializeRelationships();

        // Track interaction history
        this.interactionHistory = {};

        // NPCs met
        this.metNPCs = [];

        // Active conversations
        this.currentConversation = null;

        // Connect dialogue system to NPC manager (will be set after initialization)
        setTimeout(() => {
            if (dialogueTreeSystem) {
                dialogueTreeSystem.setNPCManager(this);
            }
        }, 0);
    }

    initializeRelationships() {
        if (!NPCs || !Array.isArray(NPCs)) return; // Safety check
        NPCs.forEach(npc => {
            if (this.relationships[npc.id] === undefined) {
                this.relationships[npc.id] = 0;
            }
            if (!this.npcStates[npc.id]) {
                this.npcStates[npc.id] = { currentNode: 'root', flags: {}, history: [] };
            }
        });
    }

    getNPCState(npcId) {
        if (!this.npcStates[npcId]) {
            this.npcStates[npcId] = { currentNode: 'root', flags: {}, history: [] };
        }
        return this.npcStates[npcId];
    }

    updateNPCState(npcId, updates) {
        const state = this.getNPCState(npcId);
        Object.assign(state, updates);
    }

    toJSON() {
        return {
            relationships: this.relationships,
            npcStates: this.npcStates,
            interactionHistory: this.interactionHistory,
            metNPCs: this.metNPCs
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.relationships = data.relationships || {};
        this.npcStates = data.npcStates || {};
        this.interactionHistory = data.interactionHistory || {};
        this.metNPCs = data.metNPCs || [];

        // Re-init if needed to ensure all NPCs exist
        this.initializeRelationships();
    }

    /**
     * Get available NPCs at a location
     */
    getNPCsAtLocation(locationId) {
        return NPCs.filter(npc => {
            if (npc.location !== locationId) return false;

            // Check unlock requirements
            if (npc.unlockRequirement) {
                const req = npc.unlockRequirement;
                if (req.day && this.gameState.timeManager?.totalDays < req.day) return false;
                if (req.stat && this.gameState.characterStats?.getStat(req.stat) < req.value) return false;
                if (req.reputation && this.gameState.reputation < req.reputation) return false;
                if (req.relationship) {
                    for (const [npcId, level] of Object.entries(req.relationship)) {
                        if (this.relationships[npcId] < level) return false;
                    }
                }
            }

            return true;
        });
    }

    /**
     * Get NPC by ID
     */
    getNPC(npcId) {
        return NPCs.find(n => n.id === npcId);
    }

    /**
     * Get all NPCs (for map rendering, etc.)
     */
    getAllNPCs() {
        return NPCs.map(npc => {
            // Ensure every NPC has image path
            if (!npc.image) {
                npc.image = getNPCImage(npc);
            }
            if (!npc.fallbackIcon) {
                npc.fallbackIcon = getNPCFallback(npc);
            }
            return npc;
        });
    }

    /**
     * Get met NPCs with relationship data
     */
    getMetNPCs() {
        // At game start, player knows NO ONE - empty city
        if (!this.metNPCs) {
            this.metNPCs = []; // Start empty
        }

        return this.metNPCs.map(npcId => {
            const npc = this.getNPC(npcId);
            if (!npc) return null;

            return {
                ...npc,
                relationship: this.relationships[npcId] || 0,
                tier: this.getRelationshipTier(npcId)
            };
        }).filter(n => n !== null);
    }

    /**
     * Mark NPC as met (when first encountered)
     */
    markNPCAsMet(npcId) {
        if (!this.metNPCs.includes(npcId)) {
            this.metNPCs.push(npcId);
        }
    }

    /**
     * Get relationship level
     */
    getRelationship(npcId) {
        return this.relationships[npcId] || 0;
    }

    /**
     * Get relationship tier (stranger, acquaintance, friend, close friend, best friend)
     */
    getRelationshipTier(npcId) {
        const level = this.relationships[npcId] || 0;
        if (level < 10) return { tier: 'stranger', label: 'Stranger', color: '#888' };
        if (level < 30) return { tier: 'acquaintance', label: 'Acquaintance', color: '#4ecdc4' };
        if (level < 60) return { tier: 'friend', label: 'Friend', color: '#6bcb77' };
        if (level < 85) return { tier: 'close_friend', label: 'Close Friend', color: '#a855f7' };
        return { tier: 'best_friend', label: 'Best Friend', color: '#ffd93d' };
    }

    /**
     * Modify relationship
     */
    modifyRelationship(npcId, amount) {
        const npc = this.getNPC(npcId);
        if (!npc) return;

        const personality = PERSONALITY_TRAITS[npc.personality];
        let adjustedAmount = amount * personality.relationshipGain;
        // Don't let Math.floor eat fractional gains: any positive gain counts as at least 1,
        // any negative loss counts as at most -1, so small gains/losses still register.
        if (adjustedAmount > 0) adjustedAmount = Math.max(1, Math.round(adjustedAmount));
        else if (adjustedAmount < 0) adjustedAmount = Math.min(-1, Math.round(adjustedAmount));

        this.relationships[npcId] = Math.max(0, Math.min(100,
            (this.relationships[npcId] || 0) + adjustedAmount
        ));

        return this.relationships[npcId];
    }

    /**
     * Start conversation with NPC using dialogue tree system
     */
    async startConversation(npcId) {
        const npc = this.getNPC(npcId);
        if (!npc) return null;

        const relationship = this.relationships[npcId] || 0;
        const isFirstMeeting = !this.metNPCs.includes(npcId);

        if (isFirstMeeting) {
            this.markNPCAsMet(npcId);

            // Check for story beat (first NPC met)
            if (this.metNPCs.length === 1 && this.gameState.mainGame && this.gameState.mainGame.storyBeatsSystem) {
                const beat = this.gameState.mainGame.storyBeatsSystem?.getBeat('meet_first_npc');
                if (beat) {
                    this.gameState.mainGame.handleStoryBeat?.(beat);
                }
            }
        }

        // Progressive relationship: Just talking increases relationship slightly
        if (!isFirstMeeting && relationship < 100) {
            let talkGain = 1;
            if (relationship > 60) talkGain = 0.5;
            if (relationship > 85) talkGain = 0.25;
            this.modifyRelationship(npcId, talkGain);
        }

        // Get dialogue using relationship dialogue system (loads individual NPC files)
        // relationship already declared above

        // Try to get dialogue from individual NPC file first
        let dialogueText = null;
        if (this.gameState.relationshipDialogueSystem) {
            try {
                dialogueText = await this.gameState.relationshipDialogueSystem?.getDialogue(npcId, relationship);
            } catch (error) {
                console.warn(`Could not load dialogue for ${npcId}:`, error);
            }
        }

        // Check for memory-based dialogue (NPCs remember player choices)
        let memoryDialogue = null;
        if (this.gameState.npcMemorySystem && !isFirstMeeting) {
            memoryDialogue = this.gameState.npcMemorySystem?.getMemoryDialogue(npcId, relationship);
            if (memoryDialogue) {
                // Apply relationship change from memory
                if (memoryDialogue.relationshipChange) {
                    this.modifyRelationship(npcId, memoryDialogue.relationshipChange);
                }
            }
        }

        // Fallback to dialogue tree system
        const dialogueTree = dialogueTreeSystem.getTree(npcId, relationship);
        const rootNode = dialogueTree ? dialogueTree.getRootNode() : null;

        // Get greeting based on relationship level
        // Use relationship variable already declared above
        let greetingText;
        if (memoryDialogue) {
            greetingText = memoryDialogue.text;
        } else if (dialogueText) {
            greetingText = dialogueText;
        } else if (rootNode) {
            greetingText = this.getDynamicGreeting(npc, relationship, rootNode);
        } else {
            // Fallback to template system
            const greetingPool = this.getGreetingPool(relationship, isFirstMeeting);
            greetingText = greetingPool[Math.floor(Math.random() * greetingPool.length)].text;
        }

        this.currentConversation = {
            npc,
            relationship: relationship,
            isFirstMeeting,
            stage: 'greeting',
            currentNode: 'root',
            dialogueTree: dialogueTree
        };

        // Get choices from dialogue tree or fallback
        const updatedRelationship = relationship; // FIX: Define before using
        let choices = [];
        if (rootNode && rootNode.choices) {
            choices = rootNode.choices.filter(choice => {
                // Check conditions
                if (choice.conditions) {
                    if (choice.conditions.relationship && updatedRelationship < choice.conditions.relationship) {
                        return false;
                    }
                }
                return true;
            });
        } else {
            choices = this.getAvailableChoices('greeting', updatedRelationship);
        }

        // Add "Ask on Date" if eligible and single
        if (!this.gameState.romanceSystem?.partnerId && npc.romanceOptions && relationship >= 30) {
            choices.push({
                text: "Would you like to go on a date?",
                action: 'date_ask',
                effect: { relationship: 0 }
            });
        }

        // Add Date Night choices if partner
        if (this.gameState.romanceSystem?.partnerId === npc.id) {
            choices = [
                { text: "Let's grab a coffee ($20)", action: 'date_coffee', effect: { relationship: 0 } },
                { text: "Dinner tonight? ($100)", action: 'date_dinner', effect: { relationship: 0 } },
                { text: "Weekend Trip! ($2000)", action: 'date_vacation', effect: { relationship: 0 } }
            ];
            if (this.gameState.romanceSystem?.relationshipStatus === 'dating' && this.gameState.romanceSystem?.relationshipScore > 80) {
                choices.push({ text: "I have a question... (Propose)", action: 'date_propose', effect: { relationship: 0 } });
            }
        }

        return {
            npc,
            greeting: greetingText.replace('{name}', npc.name),
            choices: choices,
            relationship: updatedRelationship,
            tier: this.getRelationshipTier(npcId),
            dialogueTree: dialogueTree
        };
    }

    /**
     * Get dynamic greeting based on relationship and personality
     */
    getDynamicGreeting(npc, relationship, rootNode) {
        if (rootNode && rootNode.text) {
            return rootNode.text;
        }

        // Fallback greeting generation
        const personalityGreetings = {
            friendly: [
                "Hey! Great to see you!",
                "Hi there! How's it going?",
                "Hello! Always happy to chat!"
            ],
            professional: [
                "Good day. How can I assist you?",
                "Hello. What brings you here?",
                "Greetings. How may I help?"
            ],
            competitive: [
                "Oh, it's you. What do you want?",
                "Hey. Still trying to keep up?",
                "What's up? Got something to prove?"
            ],
            mysterious: [
                "...",
                "You again.",
                "*nods silently*"
            ],
            generous: [
                "Hello! I'm here to help!",
                "Hi! Need anything?",
                "Welcome! What can I do for you?"
            ]
        };

        const greetings = personalityGreetings[npc.personality] || personalityGreetings.friendly;
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    /**
     * Get greeting pool based on relationship
     */
    getGreetingPool(relationship, isFirstMeeting) {
        if (isFirstMeeting) {
            return DIALOGUE_TEMPLATES.first_meeting;
        } else if (relationship < 20) {
            return DIALOGUE_TEMPLATES.low_relationship;
        } else if (relationship < 50) {
            return DIALOGUE_TEMPLATES.medium_relationship;
        } else if (relationship < 80) {
            return DIALOGUE_TEMPLATES.high_relationship;
        } else {
            return DIALOGUE_TEMPLATES.max_relationship;
        }
    }

    /**
     * Get available dialogue choices
     */
    getAvailableChoices(stage, relationship) {
        // Tree Logic
        const npcId = this.currentConversation ? this.currentConversation.npc.id : null;
        if (npcId && DIALOGUE_TREES[npcId]) {
            const state = this.getNPCState(npcId);
            const node = DIALOGUE_TREES[npcId][state.currentNode || 'root'];

            if (node) {
                // Filter choices by requirements
                return node.choices.filter(c => {
                    let met = true;
                    if (c.requiredRelationship && relationship < c.requiredRelationship) met = false;
                    return met;
                });
            }
        }

        // Fallback to legacy choices
        const choices = DIALOGUE_CHOICES[stage] || DIALOGUE_CHOICES['greeting'];

        // Filter by relationship requirement
        return choices.filter(c => {
            if (!c.requiredRelationship) return true;
            return relationship >= c.requiredRelationship;
        });
    }

    makeChoice(choiceIndex) {
        if (!this.currentConversation) return null;

        // Re-get choices to include dynamic ones
        let choices = this.getAvailableChoices(this.currentConversation.stage, this.currentConversation.relationship);

        // Dynamic Choices injection logic
        // 1. Ask Date (if single)
        if (!this.gameState.romanceSystem?.partnerId &&
            this.currentConversation.npc.romanceOptions &&
            this.currentConversation.relationship >= 30) {
            choices.push({
                text: "Would you like to go on a date?",
                action: 'date_ask',
                effect: { relationship: 0 }
            });
        }

        // 2. Date Night (if partner)
        if (this.gameState.romanceSystem?.partnerId === this.currentConversation.npc.id) {
            choices.push(
                { text: "Let's grab a coffee ($20)", action: 'date_coffee', effect: { relationship: 0 } },
                { text: "Dinner tonight? ($100)", action: 'date_dinner', effect: { relationship: 0 } },
                { text: "Weekend Trip! ($2000)", action: 'date_vacation', effect: { relationship: 0 } }
            );
            // Propose logic
            if (this.gameState.romanceSystem?.relationshipStatus === 'dating' && this.gameState.romanceSystem?.relationshipScore > 80) {
                choices.push({ text: "I have a question... (Propose)", action: 'date_propose', effect: { relationship: 0 } });
            }
        }

        const choice = choices[choiceIndex];
        if (!choice) return null;

        // Handle special actions
        if (choice.action === 'date_ask') {
            const result = this.gameState.romanceSystem?.askOnDate(this.currentConversation.npc.id);
            return {
                success: result.success,
                text: result.message,
                effects: {},
                newRelationship: this.relationships[this.currentConversation.npc.id],
                isSpecialAction: true
            };
        }

        // Handle Dating Actions
        if (choice.action && choice.action.startsWith('date_')) {
            let result;
            if (choice.action === 'date_propose') {
                result = this.gameState.romanceSystem?.propose();
            } else {
                const type = choice.action.replace('date_', '');
                result = this.gameState.romanceSystem?.goOnDate(type);
            }

            return {
                success: result.success,
                text: result.message,
                effects: {},
                newRelationship: this.relationships[this.currentConversation.npc.id],
                isSpecialAction: true
            };
        }

        // Apply choice effects
        const effects = choice.effect || {};
        this.applyChoiceEffects(effects);

        // Return result
        return {
            success: true,
            text: choice.text,
            effects,
            newRelationship: this.relationships[this.currentConversation.npc.id],
            tier: this.getRelationshipTier(this.currentConversation.npc.id),
            isTreeAction: false
        };
    }

    /**
     * Apply choice effects
     */
    applyChoiceEffects(effects) {
        const npcId = this.currentConversation.npc.id;

        // Apply relationship change
        if (effects.relationship) {
            this.modifyRelationship(npcId, effects.relationship);
        }

        // XP rewards
        if (effects.xp) {
            const amount = effects.xpAmount || 20;
            this.gameState.characterStats?.addExperience(effects.xp, amount);
        }

        // Ethics change
        if (effects.ethics) {
            this.gameState.characterStats?.modifyEthics(effects.ethics);
        }

        // Money change
        if (effects.money) {
            this.gameState.money += effects.money;
        }

        // Flags (Quest tracking)
        if (effects.flag) {
            const state = this.getNPCState(npcId);
            if (!state.flags) state.flags = {};
            state.flags[effects.flag] = true;
        }
    }

    /**
     * Give gift to NPC
     */
    giveGift(npcId, giftId) {
        const npc = this.getNPC(npcId);
        if (!npc) return { success: false, reason: 'NPC not found' };

        // Mark as met if not already
        if (!this.metNPCs.includes(npcId)) {
            this.markNPCAsMet(npcId);
        }

        const likesGift = npc.gifts.includes(giftId);
        const relationshipGain = likesGift ? 15 : 5; // Liked gift = +15, generic = +5

        // Progressive relationship: Higher relationships get less gain (harder to maintain)
        const currentRel = this.relationships[npcId] || 0;
        let adjustedGain = relationshipGain;
        if (currentRel > 60) adjustedGain = Math.max(3, relationshipGain * 0.5); // Harder to gain at high levels
        if (currentRel > 85) adjustedGain = Math.max(2, relationshipGain * 0.3); // Very hard at max levels

        this.modifyRelationship(npcId, adjustedGain);

        return {
            success: true,
            liked: likesGift,
            relationshipGain,
            newRelationship: this.relationships[npcId]
        };
    }

}




