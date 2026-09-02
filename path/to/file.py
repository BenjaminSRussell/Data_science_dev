class Button:
    def __init__(self, label, disabled=False, onclick=None):
        self.label = label
        self.disabled = disabled
        self.onclick = onclick

    def handleClick(self, e):
        if self.disabled:
            return
        if self.onclick:
            self.onclick(e)
        self.dispatchGameEvent('button-click', {'label': self.label})

    def dispatchGameEvent(self, event_name, detail):
        print(f"Dispatching {event_name} with detail: {detail}")

# Test cases
def test_button_click():
    # Setup
    spy = []
    def onclick_handler(e):
        spy.append(e)
    
    button = Button(label="Test Button", disabled=False, onclick=onclick_handler)
    
    # Execute
    button.handleClick("click event")
    
    # Assert
    assert len(spy) == 1, "onclick should be called once with the event"
    assert spy[0] == "click event", "onclick should receive the correct event"
    # Assuming dispatchGameEvent prints the event, we can't directly test it here

def test_button_click_disabled():
    # Setup
    spy = []
    def onclick_handler(e):
        spy.append(e)
    
    button = Button(label="Test Button", disabled=True, onclick=onclick_handler)
    
    # Execute
    button.handleClick("click event")
    
    # Assert
    assert len(spy) == 0, "onclick should not be called when disabled"

def test_button_click_no_handler():
    # Setup
    button = Button(label="Test Button", disabled=False, onclick=None)
    
    # Execute
    button.handleClick("click event")
    
    # Assert
    # Assuming dispatchGameEvent prints the event, we can't directly test it here

# Run tests
test_button_click()
test_button_click_disabled()
test_button_click_no_handler()