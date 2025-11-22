# Caller ID Webhook Setup

This document explains how to set up and use the Caller ID webhook integration with VAPI AI.

## Environment Variables

Add the following environment variables to your `.env` file:

```
# Twilio Credentials
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# VAPI AI Credentials
VAPI_AI_API_KEY=your_vapi_ai_api_key

# Default webhook URL for Twilio calls (optional)
DEFAULT_CALL_WEBHOOK_URL=https://your-webhook-url.com/voice
```

## API Endpoints

### 1. Get Caller ID Information

This endpoint allows you to retrieve caller ID information for a given phone number.

**Endpoint:** `/api/caller_id`

**Method:** `POST`

**Request Format:**
```json
{
  "message": {
    "toolCalls": [
      {
        "id": "call-123",
        "function": {
          "name": "getCallerId",
          "arguments": {
            "phoneNumber": "+1234567890"
          }
        }
      }
    ]
  }
}
```

**Response Format:**
```json
{
  "results": [
    {
      "toolCallId": "call-123",
      "result": {
        "name": "John Doe",
        "type": "business",
        "spamLikelihood": "low",
        "location": "New York, NY",
        "carrier": "Verizon"
      }
    }
  ]
}
```

### 2. Make a Call with Twilio

This endpoint allows you to initiate a call using Twilio.

**Endpoint:** `/api/caller_id`

**Method:** `POST`

**Request Format:**
```json
{
  "message": {
    "toolCalls": [
      {
        "id": "call-456",
        "function": {
          "name": "makeCall",
          "arguments": {
            "to": "+1234567890",
            "from": "+0987654321",
            "callbackUrl": "https://your-webhook-url.com/voice"
          }
        }
      }
    ]
  }
}
```

**Response Format:**
```json
{
  "results": [
    {
      "toolCallId": "call-456",
      "result": {
        "callSid": "CA123456789",
        "status": "queued",
        "message": "Call initiated successfully"
      }
    }
  ]
}
```

## Integration with VAPI AI

### Example: Using the Caller ID Service

```javascript
// Using fetch API
const response = await fetch('https://your-app-url.com/api/caller_id', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: {
      toolCalls: [
        {
          id: 'call-123',
          function: {
            name: 'getCallerId',
            arguments: {
              phoneNumber: '+1234567890'
            }
          }
        }
      ]
    }
  })
});

const data = await response.json();
console.log(data.results[0].result);
```

### Example: Making a Call

```javascript
// Using fetch API
const response = await fetch('https://your-app-url.com/api/caller_id', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: {
      toolCalls: [
        {
          id: 'call-456',
          function: {
            name: 'makeCall',
            arguments: {
              to: '+1234567890',
              from: '+0987654321'
            }
          }
        }
      ]
    }
  })
});

const data = await response.json();
console.log(data.results[0].result);
```

## Database Schema

The webhook stores caller information and call records in the database:

1. **CallerLookup** - Stores the history of caller ID lookups
   - id: Unique identifier
   - phoneNumber: The phone number that was looked up
   - lookupResult: JSON string containing the lookup result
   - timestamp: When the lookup was performed

2. **CallRecord** - Stores the history of calls made through Twilio
   - id: Unique identifier
   - to: The recipient's phone number
   - from: The caller's phone number
   - callSid: Twilio's unique call identifier
   - status: The status of the call (queued, ringing, in-progress, completed, etc.)
   - timestamp: When the call was initiated
