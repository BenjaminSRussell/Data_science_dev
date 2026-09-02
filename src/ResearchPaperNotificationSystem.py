class ResearchPaperNotificationSystem:
    def __init__(self, inbox, papers):
        self.inbox = inbox
        self.papers = papers
        self.readPapers = set()

    def getPapersByPhase(self, phase):
        return [paper for paper in self.papers.values() if paper['phase'] == phase and paper['unlocked']]

    def getBreakthroughPapers(self):
        return [paper for paper in self.papers.values() if paper['isBreakthrough'] and paper['unlocked']]

    def toJSON(self):
        return {
            'inbox': self.inbox,
            'readPapers': list(self.readPapers),
            'papers': {id: {'unlocked': paper['unlocked']} for id, paper in self.papers.items()}
        }

    @staticmethod
    def fromJSON(data):
        papers = {id: {'unlocked': paper['unlocked']} for id, paper in data['papers'].items()}
        system = ResearchPaperNotificationSystem(data['inbox'], papers)
        system.readPapers = set(data['readPapers'])
        return system

def test_round_trip():
    # Initial setup
    initial_papers = {
        '1': {'phase': 'pre_attention', 'unlocked': True, 'isBreakthrough': False},
        '2': {'phase': 'pre_attention', 'unlocked': False, 'isBreakthrough': False},
        '3': {'phase': 'post_attention', 'unlocked': True, 'isBreakthrough': True},
        '4': {'phase': 'pre_attention', 'unlocked': True, 'isBreakthrough': True}
    }
    system = ResearchPaperNotificationSystem(inbox=True, papers=initial_papers)
    system.readPapers.add('1')

    # Serialization
    serialized = system.toJSON()

    # Deserialization
    new_system = ResearchPaperNotificationSystem.fromJSON(serialized)

    # Assertions
    assert new_system.inbox == system.inbox, "Inbox should be preserved"
    assert new_system.readPapers == system.readPapers, "Read papers should be preserved"
    assert new_system.getPapersByPhase('pre_attention') == system.getPapersByPhase('pre_attention'), "Papers by phase should match"
    assert new_system.getBreakthroughPapers() == system.getBreakthroughPapers(), "Breakthrough papers should match"
    assert all('unlocked' in paper for paper in new_system.papers.values()), "All papers should have 'unlocked' field"
    assert all(len(paper) == 1 for paper in new_system.papers.values()), "All papers should have only 'unlocked' field"

    # Full round trip
    serialized2 = new_system.toJSON()
    new_system2 = ResearchPaperNotificationSystem.fromJSON(serialized2)
    assert new_system2.inbox == new_system.inbox, "Inbox should be preserved in full round trip"
    assert new_system2.readPapers == new_system.readPapers, "Read papers should be preserved in full round trip"
    assert new_system2.getPapersByPhase('pre_attention') == new_system.getPapersByPhase('pre_attention'), "Papers by phase should match in full round trip"
    assert new_system2.getBreakthroughPapers() == new_system.getBreakthroughPapers(), "Breakthrough papers should match in full round trip"
    assert all('unlocked' in paper for paper in new_system2.papers.values()), "All papers should have 'unlocked' field in full round trip"
    assert all(len(paper) == 1 for paper in new_system2.papers.values()), "All papers should have only 'unlocked' field in full round trip"

    print("All tests passed.")

# Run the test
test_round_trip()