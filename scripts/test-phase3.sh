#!/bin/bash

# Phase 3 Test Script — Inbox & ACK Validation
# Server: http://localhost:3001

set -e

BASE_URL="${BASE_URL:-http://localhost:3333}"
CURL_OPTS="--connect-timeout 5 --max-time 10"

echo "🧪 Phase 3 Test — Inbox & ACK"
echo "Server: $BASE_URL"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✅ PASS${NC}: $1"; }
fail() { echo -e "${RED}❌ FAIL${NC}: $1"; exit 1; }
info() { echo -e "${YELLOW}ℹ️  INFO${NC}: $1"; }

# Check server is running
echo "Checking server..."
if ! curl $CURL_OPTS -s "$BASE_URL/api/agents" > /dev/null 2>&1; then
  fail "Server not responding at $BASE_URL. Is it running?"
fi
pass "Server is responding"

# ========================================
# Step 1 — Create Two Agents
# ========================================
echo ""
echo "📌 Step 1: Create Agents"

AGENT_A=$(curl $CURL_OPTS -s -X POST "$BASE_URL/api/agents" \
  -H 'Content-Type: application/json' \
  -d '{"name":"TestAgentA","role":"dev"}')

AGENT_A_ID=$(echo "$AGENT_A" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$AGENT_A_ID" ]; then
  fail "Failed to create Agent A: $AGENT_A"
fi
pass "Agent A created: $AGENT_A_ID"

AGENT_B=$(curl $CURL_OPTS -s -X POST "$BASE_URL/api/agents" \
  -H 'Content-Type: application/json' \
  -d '{"name":"TestAgentB","role":"qa"}')

AGENT_B_ID=$(echo "$AGENT_B" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$AGENT_B_ID" ]; then
  fail "Failed to create Agent B: $AGENT_B"
fi
pass "Agent B created: $AGENT_B_ID"

# ========================================
# Step 2 — Create Thread
# ========================================
echo ""
echo "📌 Step 2: Create Thread"

THREAD=$(curl $CURL_OPTS -s -X POST "$BASE_URL/api/threads" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Phase3 Test Thread"}')

THREAD_ID=$(echo "$THREAD" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$THREAD_ID" ]; then
  fail "Failed to create Thread: $THREAD"
fi
pass "Thread created: $THREAD_ID"

# ========================================
# Step 3 — Send Message to Agent B
# ========================================
echo ""
echo "📌 Step 3: Send Message (A → B)"

MESSAGE=$(curl $CURL_OPTS -s -X POST "$BASE_URL/api/messages/send" \
  -H 'Content-Type: application/json' \
  -d "{\"threadId\":\"$THREAD_ID\",\"fromAgentId\":\"$AGENT_A_ID\",\"toAgentId\":\"$AGENT_B_ID\",\"payload\":{\"text\":\"hello inbox test\"}}")

MESSAGE_ID=$(echo "$MESSAGE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
MESSAGE_STATUS=$(echo "$MESSAGE" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$MESSAGE_ID" ]; then
  fail "Failed to send message: $MESSAGE"
fi

if [ "$MESSAGE_STATUS" != "pending" ]; then
  fail "Expected status 'pending', got '$MESSAGE_STATUS'"
fi
pass "Message sent: $MESSAGE_ID (status: $MESSAGE_STATUS)"

# ========================================
# Step 4 — Inbox Fetch #1
# ========================================
echo ""
echo "📌 Step 4: Inbox Fetch #1 (pending → delivered)"

INBOX1=$(curl $CURL_OPTS -s "$BASE_URL/api/messages/inbox?agentId=$AGENT_B_ID")

INBOX1_STATUS=$(echo "$INBOX1" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
INBOX1_COUNT=$(echo "$INBOX1" | grep -o '"id":"[^"]*"' | wc -l | tr -d ' ')

if [ "$INBOX1_COUNT" -lt 1 ]; then
  fail "Inbox should contain message: $INBOX1"
fi

if [ "$INBOX1_STATUS" != "delivered" ]; then
  fail "Expected status 'delivered', got '$INBOX1_STATUS'"
fi
pass "Inbox returned message with status: $INBOX1_STATUS"

# ========================================
# Step 5 — Inbox Fetch #2 (idempotency)
# ========================================
echo ""
echo "📌 Step 5: Inbox Fetch #2 (idempotency)"

INBOX2=$(curl $CURL_OPTS -s "$BASE_URL/api/messages/inbox?agentId=$AGENT_B_ID")

INBOX2_STATUS=$(echo "$INBOX2" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ "$INBOX2_STATUS" != "delivered" ]; then
  fail "Status should remain 'delivered', got '$INBOX2_STATUS'"
fi
pass "Idempotent: status still 'delivered'"

# ========================================
# Step 6 — ACK Message
# ========================================
echo ""
echo "📌 Step 6: ACK Message"

ACK1=$(curl $CURL_OPTS -s -X POST "$BASE_URL/api/messages/$MESSAGE_ID/ack")

ACK1_STATUS=$(echo "$ACK1" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ "$ACK1_STATUS" != "ack" ]; then
  fail "Expected status 'ack', got '$ACK1_STATUS'"
fi
pass "ACK successful: status = $ACK1_STATUS"

# ========================================
# Step 7 — Inbox After ACK
# ========================================
echo ""
echo "📌 Step 7: Inbox After ACK"

INBOX3=$(curl $CURL_OPTS -s "$BASE_URL/api/messages/inbox?agentId=$AGENT_B_ID")

INBOX3_COUNT=$(echo "$INBOX3" | grep -o '"id":"[^"]*"' | wc -l | tr -d ' ')

if [ "$INBOX3_COUNT" -gt 0 ]; then
  fail "Inbox should be empty after ACK: $INBOX3"
fi
pass "Inbox empty after ACK"

# ========================================
# Edge Case: Double ACK (idempotency)
# ========================================
echo ""
echo "📌 Edge Case: Double ACK"

ACK2=$(curl $CURL_OPTS -s -X POST "$BASE_URL/api/messages/$MESSAGE_ID/ack")

ACK2_STATUS=$(echo "$ACK2" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ "$ACK2_STATUS" != "ack" ]; then
  fail "Double ACK should succeed, got: $ACK2"
fi
pass "Double ACK idempotent: status = $ACK2_STATUS"

# ========================================
# Edge Case: ACK Unknown Message (404)
# ========================================
echo ""
echo "📌 Edge Case: ACK Unknown Message"

FAKE_UUID="00000000-0000-0000-0000-000000000000"
ACK_404=$(curl $CURL_OPTS -s -X POST "$BASE_URL/api/messages/$FAKE_UUID/ack")

if echo "$ACK_404" | grep -q '"code":"not_found"'; then
  pass "404 returned for unknown message"
else
  fail "Expected 404 for unknown message: $ACK_404"
fi

# ========================================
# Edge Case: ACK pending message (409)
# ========================================
echo ""
echo "📌 Edge Case: ACK pending message (should fail)"

# Create new message
MESSAGE2=$(curl $CURL_OPTS -s -X POST "$BASE_URL/api/messages/send" \
  -H 'Content-Type: application/json' \
  -d "{\"threadId\":\"$THREAD_ID\",\"fromAgentId\":\"$AGENT_A_ID\",\"toAgentId\":\"$AGENT_B_ID\",\"payload\":{\"text\":\"pending ack test\"}}")

MESSAGE2_ID=$(echo "$MESSAGE2" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Try to ACK without fetching inbox (still pending)
ACK_409=$(curl $CURL_OPTS -s -X POST "$BASE_URL/api/messages/$MESSAGE2_ID/ack")

if echo "$ACK_409" | grep -q '"code":"conflict"'; then
  pass "409 returned for pending message ACK"
else
  fail "Expected 409 for pending message: $ACK_409"
fi

# ========================================
# Summary
# ========================================
echo ""
echo "================================"
echo -e "${GREEN}🎉 ALL TESTS PASSED${NC}"
echo "================================"
echo ""
echo "Test IDs for reference:"
echo "  Agent A: $AGENT_A_ID"
echo "  Agent B: $AGENT_B_ID"
echo "  Thread:  $THREAD_ID"
echo "  Message: $MESSAGE_ID"
echo ""
