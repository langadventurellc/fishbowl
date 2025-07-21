# Fishbowl AI MVP - Acceptance Tests (Gherkin)

## Initial Setup and Configuration

### Feature: First-time application setup
  As a new user
  I want to set up the application
  So that I can start using AI Collaborators

  Scenario: Opening the application for the first time
    Given I have installed AI Collaborators
    When I launch the application
    Then I should see the main window
    And I should see an empty conversation list
    And I should see "No agents selected" in the chat area

  Scenario: Accessing settings on first launch
    Given I have opened AI Collaborators for the first time
    When I open the settings modal
    Then I should see the API configuration section
    And I should see empty API key fields for each provider
    And I should see the theme preference options

### Feature: API key configuration
  As a user
  I want to configure my AI provider API keys
  So that agents can connect to AI services

  Scenario: Adding an OpenAI API key
    Given I am in the API settings section
    When I enter a valid OpenAI API key
    And I click "Test Connection"
    Then I should see "Connection successful" message
    And the API key should be saved securely

  Scenario: Testing an invalid API key
    Given I am in the API settings section
    When I enter an invalid API key
    And I click "Test Connection"
    Then I should see "Connection failed" error message
    And the API key should not be saved

  Scenario: Adding multiple provider API keys
    Given I am in the API settings section
    When I add valid API keys for OpenAI and Anthropic
    And I test both connections successfully
    Then both API keys should be saved
    And I should be able to create agents using either provider

## Agent Configuration

### Feature: Creating custom personalities
  As a user
  I want to create custom agent personalities
  So that agents behave according to my preferences

  Scenario: Creating a personality from scratch
    Given I am in the Personalities settings section
    When I click "Create Custom Personality"
    And I set Openness to 80
    And I set Conscientiousness to 60
    And I set Extraversion to 40
    And I set Agreeableness to 70
    And I set Neuroticism to 30
    And I save the personality as "Thoughtful Analyst"
    Then the personality should appear in my saved personalities list

  Scenario: Adjusting behavior sliders
    Given I am creating a custom personality
    When I set Formality to 90
    And I set Humor to 20
    And I set Brevity to 70
    And I set Empathy to 60
    Then the personality configuration should reflect these values
    And agents using this personality should behave accordingly

  Scenario: Using a predefined personality template
    Given I am in the Personalities settings section
    When I select "The Innovator" template
    Then I should see pre-configured personality values
    And I should be able to modify these values
    And I should be able to save as a new personality

### Feature: Creating custom roles
  As a user
  I want to create specialized agent roles
  So that agents have specific areas of expertise

  Scenario: Creating a custom role
    Given I am in the Roles settings section
    When I click "Create Custom Role"
    And I enter "UX Designer" as the role name
    And I enter "Focus on user experience and interface design" as description
    And I enter a detailed system prompt for UX expertise
    And I save the role
    Then the role should appear in my available roles list

  Scenario: Using predefined roles
    Given I am creating a new agent
    When I select the "Technical Advisor" role
    Then the agent should have technical expertise
    And the agent should focus on implementation details
    And the agent should use technical terminology appropriately

## Agent Management

### Feature: Creating and configuring agents
  As a user
  I want to create AI agents with specific configurations
  So that I can have specialized assistants

  Scenario: Creating a new agent
    Given I have configured at least one API key
    And I have at least one personality saved
    When I click "Create New Agent"
    And I enter "Code Reviewer" as the agent name
    And I select "The Critic" personality
    And I select "Technical Advisor" role
    And I select "GPT-4" as the model
    And I save the agent
    Then the agent should appear in my agent library

  Scenario: Configuring agent model parameters
    Given I am creating or editing an agent
    When I set temperature to 0.7
    And I set max tokens to 1000
    Then these parameters should be saved with the agent
    And the agent should use these settings when generating responses

  Scenario: Creating multiple agents with different providers
    Given I have API keys for multiple providers
    When I create one agent using OpenAI
    And I create another agent using Anthropic
    Then both agents should be available in my library
    And each should connect to their respective provider

## Conversation Management

### Feature: Managing conversations
  As a user
  I want to create and manage multiple conversations
  So that I can organize different topics

  Scenario: Creating a new conversation
    Given I am on the main screen
    When I click "New Conversation"
    Then a new conversation should be created
    And it should appear in the conversation list
    And it should be selected automatically

  Scenario: Renaming a conversation
    Given I have at least one conversation
    When I right-click on the conversation
    And I select "Rename"
    And I enter "Project Planning Session"
    Then the conversation should be renamed
    And the new name should appear in the sidebar

  Scenario: Switching between conversations
    Given I have multiple conversations
    When I click on a different conversation in the sidebar
    Then that conversation should become active
    And I should see its message history
    And its agents should be loaded

  Scenario: Deleting a conversation
    Given I have at least one conversation
    When I right-click on the conversation
    And I select "Delete"
    And I confirm the deletion
    Then the conversation should be removed
    And its messages should be deleted

## Chat Functionality

### Feature: Adding agents to conversations
  As a user
  I want to add agents to my conversations
  So that I can get diverse perspectives

  Scenario: Adding first agent to conversation
    Given I have a new conversation
    And I have agents in my library
    When I click the "+" button in the agent bar
    And I select an agent from the dropdown
    Then the agent should appear in the agent bar
    And the agent should be ready to respond

  Scenario: Adding multiple agents
    Given I have a conversation with one agent
    When I add two more agents
    Then all three agents should appear in the agent bar
    And each should have a unique color
    And all should be able to participate

  Scenario: Removing an agent from conversation
    Given I have a conversation with multiple agents
    When I hover over an agent label
    And I click the "X" button
    Then the agent should be removed from the conversation
    And their messages should remain in history

### Feature: Sending messages
  As a user
  I want to send messages in conversations
  So that I can interact with AI agents

  Scenario: Sending a message in manual mode
    Given I have a conversation with at least one agent
    And manual mode is active
    When I type "Hello, how are you?" in the input field
    And I press Enter
    Then my message should appear in the chat
    And I should see agent response previews

  Scenario: Sending a multiline message
    Given I am typing in the message input
    When I press Shift+Enter
    Then a new line should be created
    And I should be able to continue typing
    And Enter should still send the complete message

## Manual Mode Features

### Feature: Manual mode agent responses
  As a user
  I want to preview and select agent responses
  So that I can control the conversation flow

  Scenario: Viewing agent response previews
    Given I am in manual mode
    And I have sent a message
    When agents generate their responses
    Then I should see a preview card for each agent
    And each preview should show the first 2 lines
    And I should see checkboxes for each response

  Scenario: Selecting responses to include
    Given I see multiple agent response previews
    When I check the boxes for two responses
    And I uncheck one response
    And I click Submit
    Then only the selected responses should be added to chat
    And unselected responses should disappear

  Scenario: All agent responses saved with state
    Given I am in manual mode
    When agents provide responses
    And I select only some responses
    Then selected responses should be marked as active
    And unselected responses should be marked as inactive
    And all responses should be saved in the database

  Scenario: Expanding response previews
    Given I see agent response previews
    When I click on a preview card
    Then the full response should be displayed
    And I should be able to collapse it again

## Auto Mode Features

### Feature: Auto mode conversation flow
  As a user
  I want agents to respond automatically
  So that conversations can progress without manual intervention

  Scenario: Enabling auto mode
    Given I have a conversation with multiple agents
    And I am in manual mode
    When I toggle the mode switch to "Auto"
    Then auto mode should be activated
    And agents should start responding automatically

  Scenario: Auto mode turn taking
    Given I am in auto mode with three agents
    When I send a message
    Then the first agent should respond
    And after a delay, the second agent should respond
    And after another delay, the third agent should respond
    And then the cycle should continue

  Scenario: Agent skip detection
    Given I am in auto mode
    When an agent has nothing relevant to add
    Then the agent should skip their turn
    And a skip notification should appear
    And the next agent should take their turn

  Scenario: Auto mode stop conditions
    Given I am in auto mode
    When all agents skip their turns consecutively
    Then auto mode should stop automatically
    And I should see a notification
    And the mode should remain on Auto but paused

  Scenario: Configurable response delay
    Given I have set response delay to 5 seconds
    When agents respond in auto mode
    Then there should be a 5-second delay between responses
    And I should see "thinking" indicators during the delay

## @ Mention System

### Feature: Directing questions to specific agents
  As a user
  I want to mention specific agents
  So that I can direct questions appropriately

  Scenario: Mentioning an agent
    Given I have multiple agents in the conversation
    When I type "@TechnicalAdvisor what do you think?"
    And I send the message
    Then TechnicalAdvisor should respond next
    And other agents should wait their turn

  Scenario: Multiple mentions
    Given I have multiple agents in the conversation
    When I type "@Analyst @Critic please review this"
    And I send the message
    Then both Analyst and Critic should generate responses
    And both responses should appear simultaneously in manual mode

  Scenario: Agent mentioning another agent
    Given I am in a multi-agent conversation
    When an agent includes "@ProjectManager" in their response
    Then ProjectManager should be queued to respond next
    And the mention should be highlighted in the message

## Message Management

### Feature: Managing message states
  As a user
  I want to control which messages are active
  So that I can manage conversation context

  Scenario: Toggling message active state
    Given I have a conversation with multiple messages
    When I hover over a message
    And I click the checkbox that appears
    Then the message should toggle between active and inactive
    And inactive messages should appear with 50% opacity

  Scenario: Context includes only active messages
    Given I have 10 messages with 3 marked inactive
    When agents generate new responses
    Then only the 7 active messages should be in their context
    And token count should reflect only active messages

  Scenario: Viewing inactive messages
    Given I have messages marked as inactive
    Then I should still see them in the conversation
    But they should be visually distinguished
    And they should not affect agent responses

### Feature: Message actions
  As a user
  I want to perform actions on messages
  So that I can manage conversation content

  Scenario: Copying message content
    Given I have messages in a conversation
    When I hover over a message
    And I click the copy button
    Then the message content should be copied to clipboard

  Scenario: Collapsing long messages
    Given I have a message longer than 3 lines
    Then it should show a "Show more..." link
    When I click "Show more..."
    Then the full message should expand
    And I should see a "Show less..." option

## Theme and UI

### Feature: Theme preferences
  As a user
  I want to choose interface themes
  So that I can work comfortably

  Scenario: Switching to dark mode
    Given I am using light mode
    When I open settings
    And I select "Dark" theme
    Then the interface should switch to dark mode
    And the preference should be saved

  Scenario: Following system theme
    Given I have selected "System" theme preference
    When my operating system is in dark mode
    Then the application should use dark mode
    When my operating system switches to light mode
    Then the application should switch to light mode

## Context Management

### Feature: Context window warnings
  As a user
  I want to know when approaching context limits
  So that I can manage conversation length

  Scenario: Approaching context limit
    Given I have a long conversation
    When the token count reaches 80% of the model's limit
    Then I should see a warning notification
    And the token counter should show the usage

  Scenario: Reaching context limit
    Given I have reached 95% of context capacity
    When I try to send another message
    Then I should see a critical warning
    And I should be advised to start a new conversation
    Or deactivate some messages

## Error Handling

### Feature: Handling API errors
  As a user
  I want graceful error handling
  So that issues don't disrupt my work

  Scenario: API rate limit error
    Given I am in a conversation
    When an agent encounters a rate limit
    Then I should see an error message
    And auto mode should pause if active
    And I should see a retry option

  Scenario: Network connection error
    Given I am in a conversation
    When the network connection is lost
    Then I should see a connection error message
    And existing conversation should remain accessible
    And I should be able to continue when connection returns

  Scenario: Invalid API key error
    Given I am using an agent
    When the API key becomes invalid
    Then I should see an authentication error
    And be directed to update the API key
    And the agent should show an error state

## Keyboard Shortcuts

### Feature: Keyboard navigation
  As a user
  I want keyboard shortcuts
  So that I can work efficiently

  Scenario: Creating new conversation with shortcut
    Given I am in the application
    When I press Cmd+N (or Ctrl+N on Windows/Linux)
    Then a new conversation should be created

  Scenario: Toggling between modes with shortcut
    Given I am in a conversation
    When I press Cmd+M (or Ctrl+M on Windows/Linux)
    Then the mode should toggle between Manual and Auto

  Scenario: Opening settings with shortcut
    Given I am in the application
    When I press Cmd+, (or Ctrl+, on Windows/Linux)
    Then the settings modal should open

## Performance

### Feature: Handling long conversations
  As a user
  I want smooth performance with long conversations
  So that the app remains responsive

  Scenario: Scrolling through long conversations
    Given I have a conversation with 100+ messages
    When I scroll through the messages
    Then scrolling should be smooth
    And messages should load without lag

  Scenario: Many agents thinking simultaneously
    Given I have 4 agents in manual mode
    When all agents are generating responses
    Then I should see thinking indicators for each
    And the UI should remain responsive
    And I should be able to type in the input field