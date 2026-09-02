# Assuming the original code is in a file named 'game.py'

# game.py

def hireLawyer(gameState, tier):
    costs = {
        'cheap': 100,
        'average': 500,
        'expensive': 1000
    }
    
    # Guard clause to reject unknown tiers
    if tier not in costs:
        return {
            'success': False,
            'message': 'Invalid tier'
        }
    
    cost = costs[tier]
    
    if gameState['money'] < cost:
        return {
            'success': False,
            'message': 'Insufficient funds'
        }
    
    gameState['money'] -= cost
    gameState['lawyer'] = tier
    
    return {
        'success': True,
        'message': f'Hired a {tier} lawyer for {cost}'
    }

# Test cases

def test_hireLawyer():
    gameState = {
        'money': 1000,
        'lawyer': None
    }
    
    # Test with valid tiers
    result = hireLawyer(gameState, 'cheap')
    assert result['success'] == True
    assert gameState['money'] == 900
    assert gameState['lawyer'] == 'cheap'
    
    result = hireLawyer(gameState, 'average')
    assert result['success'] == True
    assert gameState['money'] == 400
    assert gameState['lawyer'] == 'average'
    
    result = hireLawyer(gameState, 'expensive')
    assert result['success'] == True
    assert gameState['money'] == 400
    assert gameState['lawyer'] == 'expensive'
    
    # Test with invalid tiers
    gameState = {
        'money': 1000,
        'lawyer': None
    }
    
    result = hireLawyer(gameState, 'chep')
    assert result['success'] == False
    assert gameState['money'] == 1000
    assert gameState['lawyer'] == None
    
    result = hireLawyer(gameState, '')
    assert result['success'] == False
    assert gameState['money'] == 1000
    assert gameState['lawyer'] == None
    
    result = hireLawyer(gameState, 'undefined')
    assert result['success'] == False
    assert gameState['money'] == 1000
    assert gameState['lawyer'] == None
    
    print("All tests passed.")

# Run tests
test_hireLawyer()