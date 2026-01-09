
import { enhancedDialogueSystem } from './src/js/game/dialogue/EnhancedDialogueSystem.js';
import { CHARACTER_STORIES } from './src/js/game/dialogue/DeepCharacterStories.js';

// Mock NPC Object
const mockEmma = {
    id: 'emma_bloom',
    name: 'Emma Bloom',
    personality: 'friendly'
};

function runTest() {
    console.log("Starting Verification for Emma Bloom Story...");

    // Test Case 1: Low Relationship (No Phase)
    console.log("\n--- Test Case 1: Relationship 5 (No Phase) ---");
    let tree = enhancedDialogueSystem.buildEnhancedTree(mockEmma, 5);
    let root = tree.nodes.get('root');
    let hasPhaseOption = root.choices.some(c => c.id.startsWith('phase_'));
    console.log(`Phase Option Present: ${hasPhaseOption} (Expected: false)`);

    // Test Case 2: Relationship 20 (Phase 1 Should Unlock)
    console.log("\n--- Test Case 2: Relationship 20 (Phase 1 Unlock) ---");
    tree = enhancedDialogueSystem.buildEnhancedTree(mockEmma, 20);
    root = tree.nodes.get('root');
    let phaseOption = root.choices.find(c => c.id.startsWith('phase_'));
    console.log(`Phase Option Present: ${!!phaseOption} (Expected: true)`);
    if (phaseOption) {
        console.log(`Option Text: "${phaseOption.text}"`);
        console.log(`Target Phase ID: ${phaseOption.id}`);

        // Verify Phase Node Content
        let phaseNode = tree.nodes.get(phaseOption.id);
        if (phaseNode) {
            console.log(`Phase Dialogue: "${phaseNode.text}"`);
            console.log(`Choices Count: ${phaseNode.choices.length} (Expected: 3)`);
            phaseNode.choices.forEach(c => console.log(` - Choice: ${c.text}`));
        } else {
            console.error("Phase Node NOT found in tree!");
        }
    }

    // Test Case 3: Relationship 40 (Phase 2 Should Unlock)
    console.log("\n--- Test Case 3: Relationship 40 (Phase 2 Unlock) ---");
    // Note: Our mock logic currently just picks the first valid phase it finds.
    // In a real scenario, flags would prevent Phase 1 from showing if completed.
    // For this test, we just want to see if Phase 2 IS reachable if Phase 1 conditions weren't met (or if we force it).
    // Actually, iterate phases to see if they are in the tree at all.
    tree = enhancedDialogueSystem.buildEnhancedTree(mockEmma, 40);
    let phase2Node = tree.nodes.get('phase_phase_2'); // ID based on our implementation: phase_{id}
    console.log(`Phase 2 Node Present in Tree: ${!!phase2Node} (Expected: true)`);
    if (phase2Node) {
        console.log(`Phase 2 Dialogue: "${phase2Node.text}"`);
    }

    console.log("\nVerification Complete.");
}

runTest();
