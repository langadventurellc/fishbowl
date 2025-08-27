# Chat Implementation Overview

## Core Functionality

This application enables chat between a user and one or more LLM-powered agents. The chat functionality is the most complicated part of the application and needs to be approached deliberately and incrementally.

## Domain Concepts

### Participants

- **User**: A participant in the chat
- **Conversation Agents**: Participants in a conversation, created by selecting from available configured agents

### Structure

- **Messages**: The elements of a chat
- **Conversations**: Container for a chat, including:
  - The configured agents for that particular conversation
  - All messages that have occurred in that conversation

### Configuration

- **Configured Agents**: Templates that combine:
  - LLM provider and model
  - Role
  - Personality

## Current State

### Completed

- All configuration functionality:
  - Create roles
  - Create personalities
  - Configure LLM providers (OpenAI and Anthropic supported, more coming)
  - Create configured agents
  - Create conversation agents
  - Create conversations
- Database exists for storing conversations and conversation agents

### Not Yet Implemented

- Chat mechanism
- LLM provider connectivity
- Message storage in database

## How Chat Works

### Example Flow

Setup: New conversation with two conversation agents (Bob and Alice)

1. **Initial Message**
   - User submits first message
   - Both enabled agents receive the message at their respective LLM providers
   - Agents may use same or different providers/models

2. **Response Handling**
   - User sees responses from both conversation agents
   - User can choose to include zero, one, or both responses in the chat via checkboxes
   - Included messages become part of future chat history sent to LLM providers
   - Excluded messages are hidden and not included in future submissions

3. **Continuation**
   - If user keeps both messages and responds again:
   - Both agents' LLM providers receive entire chat history:
     - User's first message
     - Both agents' responses
     - User's new message

### Technical Details

**System Prompts**

- Every chat starts with a system prompt
- Each agent's system prompt includes their personality and role information

**Message Metadata**

- Each message includes metadata identifying who said what
- Example: When Alice's LLM provider gets the second user submission, it sees:
  - Original system prompt with Alice's personality and roles
  - User's first message
  - Alice's response
  - Bob's response
  - User's new message

## UI Components

### Current Layout

- **Left sidebar**: List of conversations
- **Main content area**: Chat display
- **Input area**: Below chat, where user enters messages
- **Agent pills**: Above chat, where users can:
  - Add agents to conversation
  - Delete agents from conversation
  - Enable/disable agents (click to toggle)

### Conversation Agent Management

- Disabled agents don't participate until re-enabled
- Disabled agents are not deleted, just temporarily inactive
